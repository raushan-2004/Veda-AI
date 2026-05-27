import { Worker } from 'bullmq';
import { connection } from '@/queues';
import { JobStatusModel } from '@/models/job-status.model';
import { AssignmentModel } from '@/models/assignment.model';
import { pdfService } from '@/services/pdf.service';
import { logger } from '@/utils/logger';
import { getRedis } from '@/config/redis';
import { env } from '@/config/env';

export const pdfGenerationWorker = new Worker(
  'pdf-generation',
  async (job) => {
    const { assessmentId } = job.data as {
      assessmentId: string;
      title?: string;
    };

    logger.info(`📄 PDF generation worker picked up job: ${job.id} for assessment: ${assessmentId}`);

    // Helper to update progress and phase in Mongoose & BullMQ
    const updateJob = async (status: string, progress: number, phase: string) => {
      await job.updateProgress(progress);
      await JobStatusModel.findOneAndUpdate(
        { jobId: job.id },
        { status, progress, phase },
        { upsert: true }
      );
    };

    try {
      // Step 1: Processing layout styling & fetching details (30%)
      await updateJob('processing', 30, 'Formatting print booklet layouts');
      const assessment = await AssignmentModel.findById(assessmentId).populate('generatedPaper');
      if (!assessment) {
        throw new Error(`Assignment with ID ${assessmentId} not found`);
      }

      // Step 2: Compiling text content & rendering PDF Kit streams (65%)
      await updateJob('processing', 65, 'Assembling generated questions & rendering PDF booklet');
      await pdfService.generateAssessmentPDF(assessment);

      // Invalidate Redis cache
      try {
        const redisClient = getRedis();
        await redisClient.del(`assessment:cache:${assessmentId}`);
        logger.info(`🧹 Worker Invalidated Redis Cache after PDF compilation: ${assessmentId}`);
      } catch (cacheErr: any) {
        logger.warn(`⚠️ Redis cache invalidation skipped: ${cacheErr.message}`);
      }

      // Step 3: Finished rendering (100%)
      await updateJob('completed', 100, 'Printable PDF booklet generated successfully');
      logger.info(`✅ PDF successfully compiled for assessment: ${assessmentId}`);

      return { assessmentId, pdfUrl: `/api/v1/assessments/${assessmentId}/download` };
    } catch (error: any) {
      logger.error(`❌ PDF Generation worker error: ${error.message}`);
      await JobStatusModel.findOneAndUpdate(
        { jobId: job.id },
        { status: 'failed', error: error.message }
      );
      throw error;
    }
  },
  { connection, concurrency: env.QUEUE_CONCURRENCY || 5 }
);

pdfGenerationWorker.on('error', (err) => {
  logger.warn(`BullMQ pdf-generation Worker warning: ${err.message}`);
});

export default pdfGenerationWorker;

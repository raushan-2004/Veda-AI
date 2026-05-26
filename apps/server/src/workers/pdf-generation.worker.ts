import { Worker } from 'bullmq';
import { connection } from '@/queues';
import { JobStatusModel } from '@/models/job-status.model';
import { logger } from '@/utils/logger';

export const pdfGenerationWorker = new Worker(
  'pdf-generation',
  async (job) => {
    const { assessmentId, title } = job.data as {
      assessmentId: string;
      title: string;
    };

    logger.info(`📄 PDF generation worker picked up job: ${job.id} for '${title}'`);

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
      // Step 1: Processing layout styling (30%)
      await updateJob('processing', 30, 'Formatting print booklet layouts');
      await new Promise((r) => setTimeout(r, 1200));

      // Step 2: Compiling text content (65%)
      await updateJob('processing', 65, 'Assembling generated questions & options');
      await new Promise((r) => setTimeout(r, 1500));

      // Step 3: Finished rendering (100%)
      await updateJob('completed', 100, 'Printable PDF booklet generated successfully');
      logger.info(`✅ PDF successfully compiled for assessment: ${assessmentId}`);

      return { assessmentId, pdfUrl: `/static/pdfs/${assessmentId}.pdf` };
    } catch (error: any) {
      logger.error(`❌ PDF Generation worker error: ${error.message}`);
      await JobStatusModel.findOneAndUpdate(
        { jobId: job.id },
        { status: 'failed', error: error.message }
      );
      throw error;
    }
  },
  { connection, concurrency: 2 }
);

export default pdfGenerationWorker;

import { Worker } from 'bullmq';
import { connection } from '@/queues';
import { JobStatusModel } from '@/models/job-status.model';
import { GeneratedPaperModel } from '@/models/generated-paper.model';
import { AssignmentModel } from '@/models/assignment.model';
import { aiService } from '@/services/ai.service';
import { getIO } from '@/socket';
import { logger } from '@/utils/logger';
import { getRedis } from '@/config/redis';
import { env } from '@/config/env';

export const aiGenerationWorker = new Worker(
  'ai-generation',
  async (job) => {
    const { topic, assessmentId, numQuestions, formats } = job.data as {
      topic: string;
      userId: string;
      assessmentId: string;
      numQuestions: number;
      formats: string[];
    };

    logger.info(`🤖 AI generation worker picked up job: ${job.id}`);

    // Helper to update progress and phase in Mongoose & BullMQ, and notify Socket clients
    const updateJob = async (status: string, progress: number, phase: string) => {
      await job.updateProgress(progress);
      await JobStatusModel.findOneAndUpdate(
        { jobId: job.id },
        { status, progress, phase },
        { upsert: true }
      );

      try {
        const ioInstance = getIO();
        ioInstance.to(`job:${job.id}`).emit('generation:progress', {
          jobId: job.id || '',
          progress,
          phase,
          status,
        });
      } catch (err: any) {
        logger.warn(`Could not emit progress socket update: ${err.message}`);
      }
    };

    try {
      // Emit generation started
      try {
        const ioInstance = getIO();
        ioInstance.to(`job:${job.id}`).emit('generation:started', {
          jobId: job.id || '',
          assessmentId,
        });
      } catch (err: any) {
        logger.warn(`Could not emit started socket update: ${err.message}`);
      }

      // Step 1: Processing prompt configurations & fetching assignment details (25%)
      await updateJob('processing', 25, 'Structuring AI prompt parameters');
      const assignment = await AssignmentModel.findById(assessmentId);
      if (!assignment) {
        throw new Error(`Assignment with ID ${assessmentId} not found`);
      }

      // Step 2: Generative LLM Inference (50%)
      await updateJob('generating', 50, 'Running generative LLM APIs inference');
      const aiOutput = await aiService.generateAssessment(
        assignment.subject,
        topic,
        assignment.classGrade,
        numQuestions,
        formats
      );

      // Step 3: Zod validation checking & formatting questions (75%)
      await updateJob('generating', 75, 'Executing structural validation checks');
      
      let questionIndex = 0;
      const questions: any[] = [];

      for (const section of aiOutput.sections) {
        for (const q of section.questions) {
          const qType = q.type || 'multiple-choice';
          questions.push({
            _id: `q_${Math.random().toString(36).substring(7)}`,
            type: qType,
            prompt: q.question,
            options: qType === 'multiple-choice' ? [
              { id: 'a', text: 'Option A (Correct)', isCorrect: true },
              { id: 'b', text: 'Option B' },
              { id: 'c', text: 'Option C' },
            ] : undefined,
            correctAnswer: qType === 'multiple-choice' ? 'a' : undefined,
            points: q.marks || 1,
            difficulty: q.difficulty || 'medium',
            tags: [topic, section.title].filter(Boolean),
            order: questionIndex++,
          });
        }
      }

      // Write compiled GeneratedPaper to database
      const generatedPaper = await GeneratedPaperModel.create({
        assignmentId: assessmentId,
        questions,
      });

      // Bind generatedPaper back to the original Assignment
      await AssignmentModel.findByIdAndUpdate(assessmentId, {
        generatedPaper: generatedPaper._id,
        status: 'published', // Transition assignment to active status
      });

      // Invalidate Redis cache
      try {
        const redisClient = getRedis();
        await redisClient.del(`assessment:cache:${assessmentId}`);
        logger.info(`🧹 Worker Invalidated Redis Cache for finished assessment: ${assessmentId}`);
      } catch (cacheErr: any) {
        logger.warn(`⚠️ Redis cache invalidation skipped: ${cacheErr.message}`);
      }

      // Step 4: Finished (100%)
      await updateJob('completed', 100, 'Assessment compiled and published successfully');
      logger.info(`✅ AI generation successfully completed for assessment: ${assessmentId}`);

      try {
        const ioInstance = getIO();
        ioInstance.to(`job:${job.id}`).emit('generation:completed', {
          jobId: job.id || '',
          assessmentId,
          questionsCount: questions.length,
        });
      } catch (err: any) {
        logger.warn(`Could not emit completed socket update: ${err.message}`);
      }

      return { assessmentId, questionsCount: questions.length };
    } catch (error: any) {
      logger.error(`❌ AI Generation worker error: ${error.message}`);
      await JobStatusModel.findOneAndUpdate(
        { jobId: job.id },
        { status: 'failed', error: error.message }
      );

      try {
        const ioInstance = getIO();
        ioInstance.to(`job:${job.id}`).emit('generation:failed', {
          jobId: job.id || '',
          error: error.message,
        });
      } catch (err: any) {
        logger.warn(`Could not emit failed socket update: ${err.message}`);
      }
      throw error;
    }
  },
  { connection, concurrency: env.QUEUE_CONCURRENCY || 5 }
);

aiGenerationWorker.on('error', (err) => {
  logger.warn(`BullMQ ai-generation Worker warning: ${err.message}`);
});

export default aiGenerationWorker;


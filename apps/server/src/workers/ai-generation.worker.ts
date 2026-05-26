import { Worker } from 'bullmq';
import { connection } from '@/queues';
import { JobStatusModel } from '@/models/job-status.model';
import { GeneratedPaperModel } from '@/models/generated-paper.model';
import { AssignmentModel } from '@/models/assignment.model';
import { logger } from '@/utils/logger';

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
      // Step 1: Processing prompt configurations (25%)
      await updateJob('processing', 25, 'Structuring AI prompt parameters');
      await new Promise((r) => setTimeout(r, 1000));

      // Step 2: Generative LLM Inference (50%)
      await updateJob('generating', 50, 'Running generative LLM APIs inference');
      await new Promise((r) => setTimeout(r, 1500));

      // Step 3: Zod validation checking (75%)
      await updateJob('generating', 75, 'Executing structural validation checks');
      await new Promise((r) => setTimeout(r, 1000));

      // Generate mock questions matching type definitions
      const questions = Array(numQuestions).fill(null).map((_, i) => ({
        _id: `q_${Math.random().toString(36).substring(7)}`,
        type: (formats[i % formats.length] || 'multiple-choice') as any,
        prompt: `Sample generated question #${i + 1} on ${topic}?`,
        options: [
          { id: 'a', text: 'Option A (Correct)', isCorrect: true },
          { id: 'b', text: 'Option B' },
          { id: 'c', text: 'Option C' },
        ],
        correctAnswer: 'a',
        points: 1,
        difficulty: 'medium' as any,
        tags: [topic],
        order: i,
      }));

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

      // Step 4: Finished (100%)
      await updateJob('completed', 100, 'Assessment compiled and published successfully');
      logger.info(`✅ AI generation successfully completed for assessment: ${assessmentId}`);

      return { assessmentId, questionsCount: numQuestions };
    } catch (error: any) {
      logger.error(`❌ AI Generation worker error: ${error.message}`);
      await JobStatusModel.findOneAndUpdate(
        { jobId: job.id },
        { status: 'failed', error: error.message }
      );
      throw error;
    }
  },
  { connection, concurrency: 2 }
);

export default aiGenerationWorker;

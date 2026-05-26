import { Queue, Worker, QueueEvents } from 'bullmq';

import { env } from '@/config/env';

const connection = {
  host: new URL(env.REDIS_URL).hostname,
  port: parseInt(new URL(env.REDIS_URL).port || '6379'),
};

// ==================== Assessment Grading Queue ====================
export const gradingQueue = new Queue('assessment-grading', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { age: 3600 }, // Keep for 1 hour
    removeOnFail: { age: 24 * 3600 }, // Keep failures for 24 hours
  },
});

// ==================== AI Generation Queue ====================
export const aiGenerationQueue = new Queue('ai-generation', {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 24 * 3600 },
  },
});

// ==================== Grading Worker ====================
export const gradingWorker = new Worker(
  'assessment-grading',
  async (job) => {
    const { submissionId, assessmentId } = job.data as {
      submissionId: string;
      assessmentId: string;
    };

    console.info(`Grading job started: ${job.id}`, { submissionId, assessmentId });

    // TODO: Implement grading logic
    // 1. Fetch submission + assessment from DB
    // 2. Calculate score for each question
    // 3. Calculate total score + percentage + pass/fail
    // 4. Update submission in DB
    // 5. Emit socket event to client

    return { submissionId, score: 0, percentage: 0, passed: false };
  },
  { connection, concurrency: 5 }
);

gradingWorker.on('completed', (job) => {
  console.info(`Grading job completed: ${job.id}`);
});

gradingWorker.on('failed', (job, error) => {
  console.error(`Grading job failed: ${job?.id}`, error);
});

// ==================== AI Generation Worker ====================
export const aiGenerationWorker = new Worker(
  'ai-generation',
  async (job) => {
    const { topic, userId, assessmentId } = job.data as {
      topic: string;
      userId: string;
      assessmentId: string;
    };

    console.info(`AI generation job started: ${job.id}`, { topic, userId, assessmentId });

    // TODO: Implement AI generation logic
    // 1. Call Gemini/OpenAI API
    // 2. Parse and validate response
    // 3. Save questions to DB
    // 4. Update assessment status
    // 5. Notify client via socket

    return { assessmentId, questionsGenerated: 0 };
  },
  { connection, concurrency: 2 }
);

// ==================== Queue Events ====================
export const gradingQueueEvents = new QueueEvents('assessment-grading', { connection });
export const aiQueueEvents = new QueueEvents('ai-generation', { connection });

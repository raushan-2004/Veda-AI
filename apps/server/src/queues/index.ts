import { Queue, QueueEvents } from 'bullmq';
import { env } from '@/config/env';

export const connection = {
  host: new URL(env.REDIS_URL).hostname,
  port: parseInt(new URL(env.REDIS_URL).port || '6379'),
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
  retryStrategy: (times: number) => {
    // Stop reconnecting immediately on local environments if Redis is unavailable
    if (times > 1) {
      return null;
    }
    return 1000;
  },
};

const defaultJobOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 3000 },
  removeOnComplete: { age: 3600 }, // Keep for 1 hour
  removeOnFail: { age: 24 * 3600 }, // Keep failures for 24 hours
};

// ==================== AI Generation Queue ====================
export const aiGenerationQueue = new Queue('ai-generation', {
  connection,
  defaultJobOptions,
});

// ==================== PDF Generation Queue ====================
export const pdfGenerationQueue = new Queue('pdf-generation', {
  connection,
  defaultJobOptions,
});

// ==================== Assessment Grading Queue ====================
export const gradingQueue = new Queue('assessment-grading', {
  connection,
  defaultJobOptions,
});

// ==================== Queue Events ====================
export const aiQueueEvents = new QueueEvents('ai-generation', { connection });
export const pdfQueueEvents = new QueueEvents('pdf-generation', { connection });
export const gradingQueueEvents = new QueueEvents('assessment-grading', { connection });

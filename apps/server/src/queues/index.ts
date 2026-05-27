import { Queue, QueueEvents } from 'bullmq';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

let redisHost = 'localhost';
let redisPort = 6379;
let redisPassword = undefined;
let redisTls = false;

try {
  let redisUrl = env.REDIS_URL || 'redis://localhost:6379';
  
  // Resilient parsing: if user copy-pasted the redis-cli command from Upstash/RedisCloud console
  if (redisUrl.includes('redis-cli')) {
    const match = redisUrl.match(/-u\s+(redis[s]?:\/\/[^\s]+)/);
    if (match && match[1]) {
      redisUrl = match[1];
    }
  }

  const parsedUrl = new URL(redisUrl);
  redisHost = parsedUrl.hostname;
  redisPort = parseInt(parsedUrl.port || '6379');
  redisPassword = parsedUrl.password || undefined;
  if (parsedUrl.protocol === 'rediss:' || env.REDIS_URL.includes('tls') || env.REDIS_URL.includes('upstash.io')) {
    redisTls = true;
  }
} catch (error) {
  console.warn('⚠️ Safe Redis URL parsing failed. Falling back to localhost Redis:', error);
}

export const connection = {
  host: redisHost,
  port: redisPort,
  ...(redisPassword && { password: redisPassword }),
  ...(redisTls && { tls: {} }),
  maxRetriesPerRequest: null,
  keepAlive: 10000,
  connectTimeout: 10000,
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
aiGenerationQueue.on('error', (err) => {
  logger.warn(`BullMQ ai-generation Queue warning: ${err.message}`);
});

// ==================== PDF Generation Queue ====================
export const pdfGenerationQueue = new Queue('pdf-generation', {
  connection,
  defaultJobOptions,
});
pdfGenerationQueue.on('error', (err) => {
  logger.warn(`BullMQ pdf-generation Queue warning: ${err.message}`);
});

// ==================== Assessment Grading Queue ====================
export const gradingQueue = new Queue('assessment-grading', {
  connection,
  defaultJobOptions,
});
gradingQueue.on('error', (err) => {
  logger.warn(`BullMQ assessment-grading Queue warning: ${err.message}`);
});

// ==================== Queue Events ====================
export const aiQueueEvents = new QueueEvents('ai-generation', { connection });
aiQueueEvents.on('error', (err) => {
  logger.warn(`BullMQ ai-generation QueueEvents warning: ${err.message}`);
});

export const pdfQueueEvents = new QueueEvents('pdf-generation', { connection });
pdfQueueEvents.on('error', (err) => {
  logger.warn(`BullMQ pdf-generation QueueEvents warning: ${err.message}`);
});

export const gradingQueueEvents = new QueueEvents('assessment-grading', { connection });
gradingQueueEvents.on('error', (err) => {
  logger.warn(`BullMQ assessment-grading QueueEvents warning: ${err.message}`);
});

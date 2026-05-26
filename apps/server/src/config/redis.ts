import Redis from 'ioredis';

import { env } from './env';

export let redis: Redis;

export async function connectRedis(): Promise<void> {
  redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 3) {
        return null; // Stop retrying quickly to allow graceful fallback
      }
      return Math.min(times * 200, 1000);
    },
    lazyConnect: true,
  });

  // Register event listeners BEFORE connecting to avoid process crashes on unhandled error events
  redis.on('error', (error) => {
    console.warn('🔌 Redis connection warning:', error.message);
  });

  redis.on('reconnecting', () => {
    console.warn('Redis reconnecting...');
  });

  await redis.connect();
}

export function getRedis(): Redis {
  if (!redis) throw new Error('Redis not initialized. Call connectRedis() first.');
  return redis;
}

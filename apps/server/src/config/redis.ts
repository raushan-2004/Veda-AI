import Redis from 'ioredis';

import { env } from './env';

export let redis: Redis;

export async function connectRedis(): Promise<void> {
  redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 5) {
        console.error('Redis: Max retry attempts reached');
        return null;
      }
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  await redis.connect();

  redis.on('error', (error) => {
    console.error('Redis error:', error);
  });

  redis.on('reconnecting', () => {
    console.warn('Redis reconnecting...');
  });
}

export function getRedis(): Redis {
  if (!redis) throw new Error('Redis not initialized. Call connectRedis() first.');
  return redis;
}

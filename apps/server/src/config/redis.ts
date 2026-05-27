import Redis from 'ioredis';

import { env } from './env';

export let redis: Redis;

export async function connectRedis(): Promise<void> {
  let redisUrl = env.REDIS_URL;
  const redisOptions: any = {
    maxRetriesPerRequest: 3,
    keepAlive: 10000,
    connectTimeout: 10000,
    retryStrategy: (times: number) => {
      if (times > 1) {
        return null; // Stop retrying immediately to keep console clean
      }
      return 1000;
    },
    lazyConnect: true,
  };

  // Resilient parsing: if user copy-pasted the redis-cli command from Upstash/RedisCloud console
  if (redisUrl.includes('redis-cli')) {
    const match = redisUrl.match(/-u\s+(redis[s]?:\/\/[^\s]+)/);
    if (match && match[1]) {
      redisUrl = match[1];
    }
  }

  // If protocol is TLS (rediss:), or Upstash/TLS is detected, configure tls: {} to support secure connections
  if (redisUrl.startsWith('rediss:') || env.REDIS_URL.includes('tls') || env.REDIS_URL.includes('upstash.io')) {
    redisOptions.tls = {};
  }

  redis = new Redis(redisUrl, redisOptions);

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

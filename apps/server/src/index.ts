import * as moduleAlias from 'module-alias';
moduleAlias.addAlias('@', __dirname);

import './dotenv-init';
import { createServer } from 'http';

import { app } from './app';
import { connectDB } from './config/database';
import { connectRedis } from './config/redis';
import { env } from './config/env';
import { initSocket } from './socket';
import { initWorkers } from './workers';

const PORT = env.PORT;

async function bootstrap() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.info('✅ MongoDB connected');

    // Connect to Redis
    try {
      await connectRedis();
      console.info('✅ Redis connected');
    } catch (redisError) {
      console.warn('⚠️ Redis connection failed. Local BullMQ background queues will run in fallback/retry mode. Ensure Redis is running locally if queue features are required.');
    }

    // Initialize background BullMQ workers
    initWorkers();

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize Socket.IO
    initSocket(httpServer);
    console.info('✅ Socket.IO initialized');

    // Start server
    httpServer.listen(PORT, () => {
      console.info(`🚀 Veda AI Server running on http://localhost:${PORT}`);
      console.info(`📡 Environment: ${env.NODE_ENV}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.info(`\n${signal} received. Shutting down gracefully...`);
      httpServer.close(() => {
        console.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();

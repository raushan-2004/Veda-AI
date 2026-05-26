import { Server as HttpServer } from 'http';

import { Server } from 'socket.io';

import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from '@veda-ai/types';

import { env } from '@/config/env';
import { assessmentSocketHandlers } from './handlers/assessment';
import { submissionSocketHandlers } from './handlers/submission';

export let io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function initSocket(httpServer: HttpServer): void {
  io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
      skipMiddlewares: true,
    },
  });

  // ==================== Middleware ====================
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) {
        // Allow unauthenticated for now; add JWT verification here
        socket.data.userId = 'anonymous';
        socket.data.userRole = 'student';
        return next();
      }
      // TODO: Verify JWT and set socket.data.userId + socket.data.userRole
      next();
    } catch {
      next(new Error('Authentication failed'));
    }
  });

  // ==================== Connection Handler ====================
  io.on('connection', (socket) => {
    console.info(`Socket connected: ${socket.id} (user: ${socket.data.userId})`);

    // Register event handlers
    assessmentSocketHandlers(io, socket);
    submissionSocketHandlers(io, socket);

    socket.on('disconnect', (reason) => {
      console.info(`Socket disconnected: ${socket.id} — ${reason}`);
    });
  });

  console.info('✅ Socket.IO server initialized');
}

export function getIO() {
  if (!io) throw new Error('Socket.IO not initialized. Call initSocket() first.');
  return io;
}

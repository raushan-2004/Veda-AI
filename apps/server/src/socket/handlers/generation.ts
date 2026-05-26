import type { Server, Socket } from 'socket.io';
import {
  SOCKET_EVENTS,
  type ClientToServerEvents,
  type ServerToClientEvents,
  type InterServerEvents,
  type SocketData,
} from '@veda-ai/types';

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function generationSocketHandlers(_io: TypedServer, socket: TypedSocket): void {
  // Subscribe to generation job room
  socket.on(SOCKET_EVENTS.SUBSCRIBE_GENERATION, async ({ jobId }) => {
    const room = `job:${jobId}`;
    await socket.join(room);
    console.info(`Socket ${socket.id} subscribed to updates for job: ${jobId}`);
  });

  // Unsubscribe from generation job room
  socket.on(SOCKET_EVENTS.UNSUBSCRIBE_GENERATION, async ({ jobId }) => {
    const room = `job:${jobId}`;
    await socket.leave(room);
    console.info(`Socket ${socket.id} unsubscribed from updates for job: ${jobId}`);
  });
}

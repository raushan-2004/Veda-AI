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

export function assessmentSocketHandlers(io: TypedServer, socket: TypedSocket): void {
  // Join assessment room
  socket.on(SOCKET_EVENTS.JOIN_ASSESSMENT, async ({ assessmentId, submissionId, userId }) => {
    const room = `assessment:${assessmentId}`;
    await socket.join(room);
    socket.data.assessmentId = assessmentId;

    // Notify teacher dashboard
    io.to(`teacher:${assessmentId}`).emit(SOCKET_EVENTS.PARTICIPANT_JOINED, {
      userId,
      count: (await io.in(room).fetchSockets()).length,
    });

    console.info(`User ${userId} joined assessment room: ${assessmentId} (submission: ${submissionId})`);
  });

  // Leave assessment room
  socket.on(SOCKET_EVENTS.LEAVE_ASSESSMENT, async ({ assessmentId }) => {
    const room = `assessment:${assessmentId}`;
    await socket.leave(room);
  });
}

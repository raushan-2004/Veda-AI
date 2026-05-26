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

export function submissionSocketHandlers(_io: TypedServer, socket: TypedSocket): void {
  // Save individual answer in real-time
  socket.on(SOCKET_EVENTS.SUBMIT_ANSWER, async ({ questionId, answer, assessmentId, submissionId }) => {
    try {
      // TODO: Persist answer to DB via SubmissionService
      console.info(`Answer saved: ${submissionId} / ${questionId}`, { assessmentId, answer });

      socket.emit(SOCKET_EVENTS.ANSWER_SAVED, {
        questionId,
        success: true,
      });
    } catch {
      socket.emit(SOCKET_EVENTS.ANSWER_SAVED, {
        questionId,
        success: false,
      });
    }
  });

  // Final submission
  socket.on(SOCKET_EVENTS.SUBMIT_ASSESSMENT, async ({ submissionId, assessmentId }) => {
    try {
      // TODO: Finalize submission and trigger BullMQ grading job
      console.info(`Assessment submitted: ${submissionId}`, { assessmentId });
    } catch (error) {
      console.error('Submission failed:', error);
    }
  });
}

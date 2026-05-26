'use client';

import { useEffect, useCallback } from 'react';

import { io, type Socket } from 'socket.io-client';

import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from '@veda-ai/types';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socketInstance: TypedSocket | null = null;

function getSocket(token?: string): TypedSocket {
  if (!socketInstance) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
    socketInstance = io(socketUrl, {
      autoConnect: false,
      auth: token ? { token } : {},
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socketInstance;
}

export function useSocket(token?: string) {
  const socket = getSocket(token);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
  }, [socket]);

  const emit = useCallback(
    <E extends keyof ClientToServerEvents>(
      event: E,
      ...args: Parameters<ClientToServerEvents[E]>
    ) => {
      socket.emit(event, ...args);
    },
    [socket]
  );

  const on = useCallback(
    <E extends keyof ServerToClientEvents>(
      event: E,
      handler: ServerToClientEvents[E]
    ) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (socket as any).on(event, handler);
      return () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (socket as any).off(event, handler);
      };
    },
    [socket]
  );

  return { socket, emit, on };
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

'use client';

import { useEffect, useRef, useCallback } from 'react';

import { io, type Socket } from 'socket.io-client';

import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from '@veda-ai/types';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socketInstance: TypedSocket | null = null;

function getSocket(token?: string): TypedSocket {
  if (!socketInstance) {
    socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
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
  const socketRef = useRef<TypedSocket | null>(null);

  useEffect(() => {
    const socket = getSocket(token);
    socketRef.current = socket;

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      // Don't disconnect globally — socket is a singleton
      // Only clean up event listeners in individual hooks
    };
  }, [token]);

  const emit = useCallback(
    <E extends keyof ClientToServerEvents>(
      event: E,
      ...args: Parameters<ClientToServerEvents[E]>
    ) => {
      socketRef.current?.emit(event, ...args);
    },
    []
  );

  const on = useCallback(
    <E extends keyof ServerToClientEvents>(
      event: E,
      handler: ServerToClientEvents[E]
    ) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (socketRef.current as any)?.on(event, handler);
      return () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (socketRef.current as any)?.off(event, handler);
      };
    },
    []
  );

  return { socket: socketRef.current, emit, on };
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

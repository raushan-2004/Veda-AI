import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface GradingSyncEntry {
  id: string;
  questionId: string;
  candidateName: string;
  score: number;
  timestamp: string;
}

interface SocketState {
  isConnected: boolean;
  activeRoomId: string | null;
  joinedCandidates: string[];
  gradingSyncs: GradingSyncEntry[];

  // Actions
  setConnected: (connected: boolean) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  addCandidate: (name: string) => void;
  removeCandidate: (name: string) => void;
  setCandidates: (names: string[]) => void;
  addGradingSync: (questionId: string, candidateName: string, score: number) => void;
  clearSyncs: () => void;
}

export const useSocketStore = create<SocketState>()(
  devtools(
    (set) => ({
      isConnected: false,
      activeRoomId: null,
      joinedCandidates: [],
      gradingSyncs: [],

      setConnected: (isConnected) => set({ isConnected }, false, 'socket/setConnected'),

      joinRoom: (activeRoomId) =>
        set(
          { activeRoomId, joinedCandidates: [], gradingSyncs: [] },
          false,
          'socket/joinRoom'
        ),

      leaveRoom: () =>
        set(
          { activeRoomId: null, joinedCandidates: [], gradingSyncs: [] },
          false,
          'socket/leaveRoom'
        ),

      addCandidate: (name) =>
        set(
          (state) => ({
            joinedCandidates: state.joinedCandidates.includes(name)
              ? state.joinedCandidates
              : [...state.joinedCandidates, name],
          }),
          false,
          'socket/addCandidate'
        ),

      removeCandidate: (name) =>
        set(
          (state) => ({
            joinedCandidates: state.joinedCandidates.filter((c) => c !== name),
          }),
          false,
          'socket/removeCandidate'
        ),

      setCandidates: (joinedCandidates) =>
        set({ joinedCandidates }, false, 'socket/setCandidates'),

      addGradingSync: (questionId, candidateName, score) =>
        set(
          (state) => ({
            gradingSyncs: [
              {
                id: Math.random().toString(36).substring(7),
                questionId,
                candidateName,
                score,
                timestamp: new Date().toISOString(),
              },
              ...state.gradingSyncs,
            ],
          }),
          false,
          'socket/addGradingSync'
        ),

      clearSyncs: () => set({ gradingSyncs: [] }, false, 'socket/clearSyncs'),
    }),
    { name: 'SocketStore' }
  )
);

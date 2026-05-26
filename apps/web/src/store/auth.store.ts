import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

import type { User } from '@veda-ai/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User, accessToken: string) => void;
  updateUser: (partial: Partial<User>) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,

        setUser: (user, accessToken) =>
          set({ user, accessToken, isAuthenticated: true }, false, 'auth/setUser'),

        updateUser: (partial) =>
          set(
            (state) => ({ user: state.user ? { ...state.user, ...partial } : null }),
            false,
            'auth/updateUser'
          ),

        clearAuth: () =>
          set(
            { user: null, accessToken: null, isAuthenticated: false },
            false,
            'auth/clearAuth'
          ),

        setLoading: (isLoading) => set({ isLoading }, false, 'auth/setLoading'),
      }),
      {
        name: 'veda-ai-auth',
        partialize: (state) => ({
          user: state.user,
          accessToken: state.accessToken,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);

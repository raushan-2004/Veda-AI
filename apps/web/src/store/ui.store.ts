import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface VedaNotification {
  id: string;
  message: string;
  read: boolean;
  timestamp: string;
}

interface UIState {
  isSidebarCollapsed: boolean;
  isSearchOpen: boolean;
  activeDialog: string | null;
  notifications: VedaNotification[];

  // Actions
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setActiveDialog: (dialog: string | null) => void;
  addNotification: (message: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        isSidebarCollapsed: false,
        isSearchOpen: false,
        activeDialog: null,
        notifications: [
          {
            id: '1',
            message: 'Veda AI workspace synced cleanly.',
            read: false,
            timestamp: new Date().toISOString(),
          },
          {
            id: '2',
            message: 'Welcome to your brand new Assessment Creator!',
            read: true,
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          }
        ],

        toggleSidebarCollapsed: () =>
          set(
            (state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed }),
            false,
            'ui/toggleSidebarCollapsed'
          ),

        setSidebarCollapsed: (isSidebarCollapsed) =>
          set({ isSidebarCollapsed }, false, 'ui/setSidebarCollapsed'),

        setSearchOpen: (isSearchOpen) => set({ isSearchOpen }, false, 'ui/setSearchOpen'),

        setActiveDialog: (activeDialog) => set({ activeDialog }, false, 'ui/setActiveDialog'),

        addNotification: (message) =>
          set(
            (state) => ({
              notifications: [
                {
                  id: Math.random().toString(36).substring(7),
                  message,
                  read: false,
                  timestamp: new Date().toISOString(),
                },
                ...state.notifications,
              ],
            }),
            false,
            'ui/addNotification'
          ),

        markAllNotificationsRead: () =>
          set(
            (state) => ({
              notifications: state.notifications.map((n) => ({ ...n, read: true })),
            }),
            false,
            'ui/markAllNotificationsRead'
          ),

        clearNotifications: () => set({ notifications: [] }, false, 'ui/clearNotifications'),
      }),
      {
        name: 'veda-ui-preferences',
        partialize: (state) => ({
          isSidebarCollapsed: state.isSidebarCollapsed,
        }),
      }
    ),
    { name: 'UIStore' }
  )
);

'use client';

import { create } from 'zustand';

interface NotificationState {
  show: boolean;
  text: string;
  type: 'success' | 'error' | 'warning' | 'info';
  success: (text: string) => void;
  error: (text: string) => void;
  warning: (text: string) => void;
  hide: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  show: false,
  text: '',
  type: 'info',

  success: (text) => set({ show: true, text, type: 'success' }),
  error: (text) => set({ show: true, text, type: 'error' }),
  warning: (text) => set({ show: true, text, type: 'warning' }),
  hide: () => set({ show: false }),
}));

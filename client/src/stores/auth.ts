'use client';

import { create } from 'zustand';
import type { User } from '@/lib/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isManager: boolean;
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isManager: false,

  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    set({
      user,
      isAuthenticated: !!user,
      isManager: user?.role === 'MANAGER',
    });
  },

  login: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, isAuthenticated: true, isManager: user.role === 'MANAGER' });
  },

  logout: () => {
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false, isManager: false });
  },

  hydrate: () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const user: User = JSON.parse(stored);
        set({ user, isAuthenticated: true, isManager: user.role === 'MANAGER' });
      } catch {
        set({ user: null, isAuthenticated: false, isManager: false });
      }
    }
  },
}));

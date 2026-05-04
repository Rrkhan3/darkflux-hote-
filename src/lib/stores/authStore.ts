import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
}

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  showLoginModal: boolean;
  pendingAction: (() => void) | null;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role: string) => Promise<User>;
  logout: () => void;
  setUser: (user: User) => void;
  openLoginModal: (pendingAction?: () => void) => void;
  closeLoginModal: () => void;
  requireAuth: (action: () => void) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAdmin: false,
  loading: false,
  showLoginModal: false,
  pendingAction: null,

  login: async (email: string, password: string): Promise<User> => {
    set({ loading: true });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      const { pendingAction, closeLoginModal } = get();
      set({ user: data, isAdmin: data.role === 'admin', loading: false, showLoginModal: false, pendingAction: null });

      // Execute pending action after successful login
      if (pendingAction) {
        setTimeout(() => pendingAction(), 100);
      }

      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  register: async (name: string, email: string, password: string, role: string): Promise<User> => {
    set({ loading: true });
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      const { pendingAction } = get();
      set({ user: data, isAdmin: data.role === 'admin', loading: false, showLoginModal: false, pendingAction: null });

      // Execute pending action after successful registration
      if (pendingAction) {
        setTimeout(() => pendingAction(), 100);
      }

      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    set({ user: null, isAdmin: false, showLoginModal: false, pendingAction: null });
  },

  setUser: (user: User) => {
    set({ user, isAdmin: user.role === 'admin' });
  },

  openLoginModal: (pendingAction?: () => void) => {
    set({ showLoginModal: true, pendingAction: pendingAction || null });
  },

  closeLoginModal: () => {
    set({ showLoginModal: false, pendingAction: null });
  },

  requireAuth: (action: () => void) => {
    const { user } = get();
    if (user) {
      action();
    } else {
      set({ showLoginModal: true, pendingAction: action });
    }
  },
}));

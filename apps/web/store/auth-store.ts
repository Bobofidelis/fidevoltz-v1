import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name?: string;
  role: 'USER' | 'EDITOR' | 'ADMIN';
  phoneNumber?: string;
  address?: string;
  bio?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Selector hook for isAuthenticated
export const useIsAuthenticated = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  return !!token && !!user;
};

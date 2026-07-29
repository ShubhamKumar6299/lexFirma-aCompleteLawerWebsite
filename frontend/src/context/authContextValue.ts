import { createContext } from 'react';
import type { User } from '../types';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
  phone?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateAvatar: (avatar: string) => void;
  isLawyer: boolean;
  isAdmin: boolean;
}

/**
 * Kept in its own module (no components) so Fast Refresh can hot-reload
 * `AuthProvider` and `useAuth` without invalidating the context identity.
 */
export const AuthContext = createContext<AuthContextType | null>(null);

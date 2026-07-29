import { useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { authAPI } from '../services/api';
import { AuthContext, type RegisterData } from './authContextValue';

/**
 * A user object as it may actually arrive: from the API, or from a session
 * persisted in localStorage before `_id` was returned. Either identifier may
 * be absent, which is precisely what `normalizeUser` exists to resolve.
 */
type RawUser = Omit<User, '_id' | 'id'> & { _id?: string; id?: string };

/**
 * The API has historically returned the user id as `id` while the rest of the
 * app reads `_id`. Populating both keeps every consumer working regardless of
 * which shape came in.
 */
const normalizeUser = (raw: RawUser): User => {
  const id = raw._id ?? raw.id ?? '';
  return { ...raw, _id: id, id };
};

/**
 * Restores a session from localStorage. Reading storage is synchronous, so
 * this runs as lazy `useState` initialization rather than in an effect —
 * which avoids a render pass where the user appears logged out.
 */
const restoreSession = (): User | null => {
  const savedUser = localStorage.getItem('user');
  const savedToken = localStorage.getItem('token');
  if (!savedUser || !savedToken) return null;
  try {
    return normalizeUser(JSON.parse(savedUser));
  } catch {
    // Corrupted entry — drop it rather than crashing the whole app on boot.
    localStorage.removeItem('user');
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(restoreSession);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  // The session is resolved synchronously above, so there is never a pending
  // state. Retained in the context so consumers keep compiling unchanged.
  const isLoading = false;

  const login = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    const { token: newToken, user: userData } = res.data;
    const normalized = normalizeUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(normalized));
    setToken(newToken);
    setUser(normalized);
  };

  const register = async (data: RegisterData) => {
    await authAPI.register(data);
    // Don't auto-login — user should be redirected to the login page
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateAvatar = (avatar: string) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, avatar };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{
      user, token, isLoading,
      login, register, logout, updateAvatar,
      isLawyer: user?.role === 'lawyer',
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

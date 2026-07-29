import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role?: string; phone?: string }) => Promise<void>;
  logout: () => void;
  updateAvatar: (avatar: string) => void;
  isLawyer: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * The API has historically returned the user id as `id` while the rest of the
 * app reads `_id`. Normalizing on the way in keeps both shapes working,
 * including sessions already persisted in localStorage.
 */
const normalizeUser = (raw: User & { id?: string }): User => ({
  ...raw,
  _id: raw._id ?? raw.id ?? '',
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && token) {
      setUser(normalizeUser(JSON.parse(savedUser)));
    }
    setIsLoading(false);
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    const { token: newToken, user: userData } = res.data;
    const normalized = normalizeUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(normalized));
    setToken(newToken);
    setUser(normalized);
  };

  const register = async (data: { name: string; email: string; password: string; role?: string; phone?: string }) => {
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

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { User } from '../types';
import * as api from '../services/apiService';
import { secureGet, secureSet, secureRemove } from '../utils/secureStorage';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for an active session on component mount
  useEffect(() => {
    // Restore session via secure storage (falls back silently if unavailable)
    (async () => {
      try {
        const storedToken = await secureGet('token');
        const storedUser = await secureGet('user');
        if (storedToken && storedUser) {
          setToken(storedToken as string);
          setCurrentUser(storedUser as User);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    try {
  const res = await api.login(email, password) as any;
  const userObj = { name: res.user.username, email: res.user.email } as User;
  setToken(res.token);
  setCurrentUser(userObj);
  // Persist securely (best-effort)
  secureSet('token', res.token);
  secureSet('user', userObj);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Login failed');
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<void> => {
    try {
      await api.register(name, email, password);
      // After registration, log in
      await login(email, password);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Registration failed');
    }
  }, [login]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setToken(null);
  secureRemove('token');
  secureRemove('user');
  }, []);

  const value = {
    currentUser,
    isLoading,
    login,
    register,
    logout,
    token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

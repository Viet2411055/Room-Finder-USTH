import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isGuest: boolean;
  isHost: boolean;
  login: (identity: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  updateProfile: (updates: Partial<User>) => Promise<User>;
  becomeHost: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const user = await api.me();
      setCurrentUser(user);
      return user;
    } catch {
      setCurrentUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void refreshUser(); }, [refreshUser]);

  const login = useCallback(async (identity: string, password: string) => {
    const user = await api.login(identity, password);
    setCurrentUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    try { await api.logout(); } finally { setCurrentUser(null); }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    const user = await api.updateProfile({ name: updates.name, phone: updates.phone, avatarUrl: updates.avatar_url });
    setCurrentUser(user);
    return user;
  }, []);

  const becomeHost = useCallback(async () => {
    const user = await api.onboardHost();
    setCurrentUser(user);
    return user;
  }, []);

  const value = useMemo(() => ({
    currentUser,
    isLoading,
    isGuest: currentUser === null,
    isHost: currentUser?.role === 'host',
    login,
    logout,
    refreshUser,
    updateProfile,
    becomeHost,
  }), [currentUser, isLoading, login, logout, refreshUser, updateProfile, becomeHost]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

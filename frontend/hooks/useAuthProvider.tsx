'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { apiClient } from '@/lib/api-client';
import type { ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'doctor';
  specialization?: string;
  license_number?: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: {
    email: string;
    password: string;
    full_name: string;
    role?: 'doctor' | 'admin';
    specialization?: string;
    license_number?: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await apiClient.getCurrentUser();
          setUser(response.data);
        } catch (err) {
          console.error('Failed to fetch user:', err);
          localStorage.removeItem('access_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      await apiClient.login(email, password);
      const response = await apiClient.getCurrentUser();
      setUser(response.data);
    } catch (err) {
      setError('Invalid email or password');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    window.location.href = '/login';
  };

  const register = async (userData: {
    email: string;
    password: string;
    full_name: string;
    role?: 'doctor' | 'admin';
    specialization?: string;
    license_number?: string;
  }) => {
    try {
      setError(null);
      await apiClient.register(userData);
      await login(userData.email, userData.password);
    } catch (err) {
      setError('Registration failed');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
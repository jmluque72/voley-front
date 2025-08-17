import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import ApiClient from '../utils/apiClient';
import { API_ENDPOINTS, AUTH_CONFIG } from '../config/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaurar usuario si hay token guardado
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
      if (token) {
        try {
          const res = await ApiClient.get(API_ENDPOINTS.AUTH.ME);
          setUser(res);
        } catch (err) {
          setUser(null);
          localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
          localStorage.removeItem(AUTH_CONFIG.USER_KEY);
        }
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await ApiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
      const user = res.user;
      setUser(user);
      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, res.token);
      localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(user));
      return true;
    } catch (err) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
  };

  const isAuthenticated = !!user;

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
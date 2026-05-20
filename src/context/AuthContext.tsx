import React, { createContext, useContext, useState } from 'react';
import type { Employee } from '../types';

interface AuthContextType {
  user: Employee | null;
  login: (employee: Employee) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'arcms_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Employee | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY);
      if (!savedUser) return null;
      const parsed = JSON.parse(savedUser) as Employee;
      if (parsed.role !== 'ADMIN' && parsed.role !== 'OP. TEAM') {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const login = (employee: Employee) => {
    setUser(employee);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employee));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

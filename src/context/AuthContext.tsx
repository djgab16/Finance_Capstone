import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Employee } from '../types';

interface AuthContextType {
  user: Employee | null;
  login: (employee: Employee) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Employee | null>(() => {
    const savedUser = localStorage.getItem('speedex_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (employee: Employee) => {
    setUser(employee);
    localStorage.setItem('speedex_user', JSON.stringify(employee));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('speedex_user');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

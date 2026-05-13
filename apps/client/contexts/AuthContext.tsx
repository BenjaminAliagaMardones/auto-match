'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthUser, AuthContextType, getStoredToken, getStoredUser, clearAuthData, decodeToken } from '@/lib/auth';
import { fetchAPI } from '@/lib/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar desde localStorage y validar token
  useEffect(() => {
    const initAuth = () => {
      const storedToken = getStoredToken();
      const storedUser = getStoredUser();

      if (storedToken && storedUser) {
        // Verificar que el token es válido (no expirado)
        const decoded = decodeToken(storedToken);
        if (decoded && decoded.exp) {
          const now = Math.floor(Date.now() / 1000);
          if (decoded.exp > now) {
            setToken(storedToken);
            setUser(storedUser);
          } else {
            // Token expirado
            clearAuthData();
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const logout = () => {
    clearAuthData();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}

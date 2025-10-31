'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { storage } from '../storage';
import { JWTPayload, User } from '../api/types';
import apiClient from '../api/client';
import { authApi } from '../api/endpoints/auth';

interface AuthContextType {
  user: User | null;
  roles: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const decodeToken = (token: string): JWTPayload | null => {
    try {
      return jwtDecode<JWTPayload>(token);
    } catch {
      return null;
    }
  };

  const fetchUser = async (userId: number) => {
    try {
      const response = await apiClient.get<User>(`/users/${userId}`);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    }
  };

  const login = async (accessToken: string, refreshToken: string) => {
    storage.setTokens(accessToken, refreshToken);

    const decoded = decodeToken(accessToken);
    if (decoded) {
      setRoles(decoded.roles || []);
      await fetchUser(decoded.sub);
    }
  };

  const logout = async () => {
    try {
      // Call API to invalidate token on backend
      await authApi.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear local storage and state
      storage.clearTokens();
      setUser(null);
      setRoles([]);
    }
  };

  const hasRole = (role: string): boolean => {
    return roles.includes(role);
  };

  const hasAnyRole = (requiredRoles: string[]): boolean => {
    return requiredRoles.some((role) => roles.includes(role));
  };

  // Initialize auth state from stored token
  useEffect(() => {
    const initAuth = async () => {
      const token = storage.getAccessToken();

      if (token) {
        const decoded = decodeToken(token);
        if (decoded) {
          // Check if token is expired
          const now = Date.now() / 1000;
          if (decoded.exp > now) {
            setRoles(decoded.roles || []);
            await fetchUser(decoded.sub);
          } else {
            // Token expired, clear it
            storage.clearTokens();
          }
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const value: AuthContextType = {
    user,
    roles,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

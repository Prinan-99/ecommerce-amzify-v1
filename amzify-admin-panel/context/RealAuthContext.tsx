import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminApiService } from '../services/adminApi';

interface User {
  id: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await adminApiService.getCurrentUser();
          setUser(response.data?.user || null);
        } catch (error) {
          // Token might be expired or backend unreachable, clear it
          console.warn('Auth check failed:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await adminApiService.login(credentials);
      
      // Check if user is an admin
      if (response.user.role !== 'admin') {
        throw new Error('Access denied. Administrator account required.');
      }
      
      setUser(response.user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please check your connection and try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await adminApiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setError(null);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
import React, { createContext, useContext, useState, useEffect } from 'react';
import { sellerApiService } from '../services/sellerApi';

interface User {
  id: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_verified: boolean;
  company_name?: string;
  business_type?: string;
  seller_approved?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: { email: string; password: string; firstName: string; lastName: string; phone?: string; companyName: string; businessType?: string; description?: string }) => Promise<void>;
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
          const response = await sellerApiService.getCurrentUser();
          setUser(response.data?.user || null);
        } catch (error) {
          // Token might be expired, clear it
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
      const response = await sellerApiService.login(credentials);
      
      // Check if user is a seller
      if (response.user.role !== 'seller') {
        throw new Error('Access denied. Seller account required.');
      }
      
      // In development/mock mode, allow sellers even if not approved
      // (seller_approved might be undefined for newly created sellers)
      // if (!response.user.seller_approved) {
      //   throw new Error('Your seller account is pending approval. Please contact support.');
      // }
      
      setUser(response.user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { email: string; password: string; firstName: string; lastName: string; phone?: string; companyName: string; businessType?: string; description?: string }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await sellerApiService.register(userData);
      setUser(response.user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await sellerApiService.logout();
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
    register,
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
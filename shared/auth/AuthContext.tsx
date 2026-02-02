
/**
 * Unified Authentication Context Provider
 * 
 * This component provides authentication state and methods to the entire application.
 * It integrates with existing AuthContext patterns from nexus-admin-console while
 * supporting the unified authentication system for customers, sellers, and super admins.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  User, 
  UserRole, 
  AuthContextType, 
  LoginCredentials, 
  SessionData 
} from './types';
import { UnifiedAuthenticationService } from './AuthenticationService';
import { sessionManager } from './SessionManager';
import { authErrorHandler, AuthErrorHandler } from './ErrorHandler';

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider Component
 * 
 * Provides authentication state and methods to child components.
 * Integrates with existing patterns while supporting the unified system.
 * Includes enhanced state management with loading states, error handling,
 * and authentication state persistence.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Service instances (using refs to maintain stability across renders)
  const authServiceRef = useRef(new UnifiedAuthenticationService());
  const sessionManagerRef = useRef(sessionManager);
  const errorHandlerRef = useRef(authErrorHandler);

  // Session refresh timer
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Clear any existing refresh timer
   */
  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  /**
   * Set up automatic session refresh
   */
  const setupSessionRefresh = useCallback(() => {
    clearRefreshTimer();
    
    const sessionData = sessionManagerRef.current.getSessionData();
    if (!sessionData) return;

    // Calculate time until token expires (refresh 5 minutes before expiration)
    const now = new Date().getTime();
    const expiresAt = sessionData.expiresAt.getTime();
    const refreshTime = expiresAt - now - (5 * 60 * 1000); // 5 minutes before expiry

    if (refreshTime > 0) {
      refreshTimerRef.current = setTimeout(async () => {
        try {
          const refreshed = await sessionManagerRef.current.refreshSession();
          if (refreshed) {
            const updatedSessionData = sessionManagerRef.current.getSessionData();
            if (updatedSessionData?.user) {
              setUser(updatedSessionData.user);
              setupSessionRefresh(); // Set up next refresh
            }
          } else {
            // Refresh failed, logout user
            logout();
          }
        } catch (error) {
          console.error('Session refresh failed:', error);
          logout();
        }
      }, refreshTime);
    }
  }, [clearRefreshTimer]);

  /**
   * Initialize authentication state on component mount
   * Attempts to restore session from secure storage with enhanced error handling
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if there's an existing valid session
        const isValidSession = await sessionManagerRef.current.validateSession();
        
        if (isValidSession) {
          const sessionData = sessionManagerRef.current.getSessionData();
          if (sessionData?.user) {
            setUser(sessionData.user);
            setupSessionRefresh(); // Set up automatic refresh
            
            // Set up session expiration warning
            errorHandlerRef.current.setupSessionWarning(sessionData.expiresAt);
          }
        } else {
          // Clear any invalid session data
          sessionManagerRef.current.clearSession();
        }
      } catch (error) {
        console.error('Failed to initialize authentication:', error);
        const authError = await errorHandlerRef.current.handleAuthError(error, 'initialization');
        sessionManagerRef.current.clearSession();
        setError(authError.message);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();

    // Cleanup on unmount
    return () => {
      clearRefreshTimer();
      errorHandlerRef.current.cleanup();
    };
  }, [setupSessionRefresh, clearRefreshTimer]);

  /**
   * Login method supporting all three user roles with enhanced state management
   * 
   * @param credentials - Login credentials (email/password, seller info, or admin credentials)
   * @param role - The role the user is attempting to authenticate as
   */
  const login = useCallback(async (credentials: LoginCredentials, role: UserRole): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      let authResult;

      // Route to appropriate authentication method based on role
      switch (role) {
        case UserRole.CUSTOMER:
          if (!credentials.email) {
            throw new Error('Email is required for customer login');
          }
          authResult = await authServiceRef.current.authenticateCustomer(credentials.email, credentials.password);
          break;

        case UserRole.SELLER:
          if (!credentials.sellerName || !credentials.companyName) {
            throw new Error('Seller name and company name are required for seller login');
          }
          authResult = await authServiceRef.current.authenticateSeller(
            credentials.sellerName, 
            credentials.companyName, 
            credentials.password
          );
          break;

        case UserRole.SUPER_ADMIN:
          if (!credentials.adminUsername) {
            throw new Error('Admin username is required for admin login');
          }
          authResult = await authServiceRef.current.authenticateAdmin(credentials.adminUsername, credentials.password);
          break;

        default:
          throw new Error(`Unsupported role: ${role}`);
      }

      if (!authResult.success) {
        throw new Error(authResult.error || 'Authentication failed');
      }

      if (!authResult.user || !authResult.accessToken || !authResult.refreshToken) {
        throw new Error('Invalid authentication response');
      }

      // Create session with the authenticated user and tokens
      sessionManagerRef.current.createSession(authResult.user, {
        accessToken: authResult.accessToken,
        refreshToken: authResult.refreshToken
      });

      // Update authentication state
      setUser(authResult.user);
      
      // Set up automatic session refresh
      setupSessionRefresh();

      // Set up session expiration warning
      const sessionData = sessionManagerRef.current.getSessionData();
      if (sessionData) {
        errorHandlerRef.current.setupSessionWarning(sessionData.expiresAt);
      }

    } catch (error) {
      const authError = await errorHandlerRef.current.handleAuthError(error, `login-${role}`);
      setError(authError.message);
      throw new Error(authError.message);
    } finally {
      setIsLoading(false);
    }
  }, [setupSessionRefresh]);

  /**
   * Logout method with enhanced cleanup
   * Clears all authentication state, session data, and timers
   */
  const logout = useCallback(() => {
    try {
      // Clear refresh timer
      clearRefreshTimer();
      
      // Clear session data
      sessionManagerRef.current.clearSession();
      
      // Clear authentication state
      setUser(null);
      setError(null);
      
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear state even if there's an error
      setUser(null);
      setError(null);
    }
  }, [clearRefreshTimer]);

  /**
   * Check if the current user has permission for a specific role
   * 
   * @param requiredRole - The role required for access
   * @returns true if user has the required role, false otherwise
   */
  const checkPermission = useCallback((requiredRole: UserRole): boolean => {
    if (!user) {
      return false;
    }

    // Exact role match required for security
    return user.role === requiredRole;
  }, [user]);

  /**
   * Clear authentication errors
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Computed values
  const isAuthenticated = !!user;
  const role = user?.role || null;

  // Context value
  const contextValue: AuthContextType = {
    user,
    role,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    login,
    logout,
    checkPermission,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access authentication context
 * 
 * @returns AuthContextType with authentication state and methods
 * @throws Error if used outside of AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

/**
 * Higher-order component to provide authentication context
 * Useful for wrapping components that need authentication
 */
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => (
    <AuthProvider>
      <Component {...props} />
    </AuthProvider>
  );
};
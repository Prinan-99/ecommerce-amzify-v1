/**
 * Unified Authentication System - Main Export File
 * 
 * This file exports all authentication types, interfaces, and utilities
 * for easy importing across both lumina-luxe-e-commerce and nexus-admin-console projects.
 */

// Export all types and interfaces
export * from './types';

// Export all constants
export * from './constants';

// Export all utilities
export * from './utils';

// Export services
export * from './TokenService';
export * from './CookieService';
export * from './SessionManager';
export * from './AuthenticationService';
export * from './AccessControllerService';
export * from './ApiService';
export * from './ErrorHandler';
export * from './AdminCredentialsManager';

// Export React components and context (hooks will be implemented in consuming projects)
export * from './AuthContext';
export * from './hooks';
export * from './LoginPortal';
export * from './LoginForms';
export * from './ProtectedRoute';
export * from './AccessDeniedPage';
export * from './NotificationManager';
export * from './AuthenticationIntegration';
export * from './IntegrationExample';

// Export routing configuration and services
export * from './routeConfig';
export * from './RoutingService';
export * from './NavigationManager';
export * from './AuthenticatedRouter';
export * from './useNavigation';

// Re-export commonly used types for convenience
export type {
  User,
  Customer,
  Seller,
  SuperAdmin,
  LoginCredentials,
  AuthResult,
  TokenPair,
  JWTPayload,
  SessionData,
  AuthContextType,
  ProtectedRouteProps,
  RouteConfig
} from './types';

// Re-export the UserRole enum as a named export for easier access
export { UserRole } from './types';
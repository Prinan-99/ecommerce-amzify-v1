/**
 * Unified Authentication System Types and Interfaces
 * 
 * This file contains all type definitions for the unified authentication system
 * that consolidates authentication for both lumina-luxe-e-commerce and nexus-admin-console.
 */

// Note: React types will be imported when used in actual React components

// ============================================================================
// Core Authentication Enums
// ============================================================================

/**
 * User roles for the unified authentication system
 * Simplified from the original nexus-admin-console roles to focus on the three main user types
 */
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  SELLER = 'SELLER',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

// ============================================================================
// User Interface Definitions
// ============================================================================

/**
 * Base user interface with common properties
 */
export interface BaseUser {
  id: string;
  role: UserRole;
  createdAt: Date;
  lastLoginAt: Date;
  isActive: boolean;
}

/**
 * Customer user interface for e-commerce customers
 */
export interface Customer extends BaseUser {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole.CUSTOMER;
}

/**
 * Seller user interface for business users managing products and orders
 */
export interface Seller extends BaseUser {
  sellerName: string;
  companyName: string;
  email: string;
  role: UserRole.SELLER;
}

/**
 * Super Admin user interface for platform administrators
 */
export interface SuperAdmin extends BaseUser {
  adminUsername: string;
  role: UserRole.SUPER_ADMIN;
}

/**
 * Union type representing any authenticated user
 */
export type User = Customer | Seller | SuperAdmin;

// ============================================================================
// Authentication Credential Interfaces
// ============================================================================

/**
 * Login credentials interface supporting all three authentication methods
 */
export interface LoginCredentials {
  // Customer login fields
  email?: string;
  password: string;
  
  // Seller login fields
  sellerName?: string;
  companyName?: string;
  
  // Admin login fields
  adminUsername?: string;
}

/**
 * Authentication result interface returned by authentication service
 */
export interface AuthResult {
  success: boolean;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}

/**
 * Token pair interface for JWT access and refresh tokens
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Token validation result interface
 */
export interface TokenValidationResult {
  valid: boolean;
  user?: User;
  expired?: boolean;
  error?: string;
}

// ============================================================================
// JWT and Session Interfaces
// ============================================================================

/**
 * JWT payload interface with role-specific claims
 */
export interface JWTPayload {
  sub: string; // user ID
  role: UserRole;
  iat: number; // issued at
  exp: number; // expiration time
  permissions: string[];
}

/**
 * Session data interface for managing user sessions
 */
export interface SessionData {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

// ============================================================================
// Service Interface Definitions
// ============================================================================

/**
 * Authentication service interface defining core authentication methods
 */
export interface AuthenticationService {
  authenticateCustomer: (email: string, password: string) => Promise<AuthResult>;
  authenticateSeller: (sellerName: string, companyName: string, password: string) => Promise<AuthResult>;
  authenticateAdmin: (username: string, password: string) => Promise<AuthResult>;
  validateToken: (token: string) => Promise<TokenValidationResult>;
  refreshToken: (refreshToken: string) => Promise<AuthResult>;
}

/**
 * Token service interface for JWT token management
 */
export interface TokenService {
  generateTokens: (user: User) => Promise<TokenPair>;
  validateAccessToken: (token: string) => Promise<TokenValidationResult>;
  refreshAccessToken: (refreshToken: string) => Promise<string>;
  revokeTokens: (userId: string) => Promise<void>;
}

/**
 * Session manager interface for session lifecycle management
 */
export interface SessionManager {
  createSession: (user: User, tokens: TokenPair) => void;
  validateSession: () => Promise<boolean>;
  refreshSession: () => Promise<boolean>;
  clearSession: () => void;
  getSessionData: () => SessionData | null;
}

/**
 * Access controller service interface for route and permission validation
 */
export interface AccessControllerService {
  validateRouteAccess: (path: string, userRole: UserRole) => boolean;
  getRedirectPath: (userRole: UserRole) => string;
  handleUnauthorizedAccess: (attemptedPath: string, userRole: UserRole) => void;
}

// ============================================================================
// Cookie Management Interfaces
// ============================================================================

/**
 * Cookie options interface for secure cookie configuration
 */
export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
  path: string;
}

/**
 * Cookie service interface for secure cookie management
 */
export interface CookieService {
  setSecureCookie: (name: string, value: string, options: CookieOptions) => void;
  getSecureCookie: (name: string) => string | null;
  removeSecureCookie: (name: string) => void;
}

// ============================================================================
// React Context and Component Interfaces
// ============================================================================

/**
 * Authentication context interface for React Context API
 * Enhanced with additional state management features
 */
export interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (credentials: LoginCredentials, role: UserRole) => Promise<void>;
  logout: () => void;
  checkPermission: (requiredRole: UserRole) => boolean;
  clearError: () => void;
}

/**
 * Login portal component props interface
 */
export interface LoginPortalProps {
  onRoleSelect: (role: UserRole) => void;
  selectedRole: UserRole | null;
}

/**
 * Login form component props interface
 */
export interface LoginFormProps {
  role: UserRole;
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Protected route component props interface
 * Note: React types will be properly imported when implementing components
 */
export interface ProtectedRouteProps {
  children: any; // React.ReactNode when implemented
  allowedRoles: UserRole[];
  fallback?: any; // React.ComponentType when implemented
}

// ============================================================================
// Route Configuration Interfaces
// ============================================================================

/**
 * Route configuration interface for role-based routing
 * Note: React types will be properly imported when implementing components
 */
export interface RouteConfig {
  path: string;
  allowedRoles: UserRole[];
  component: any; // React.ComponentType when implemented
  exact?: boolean;
  children?: RouteConfig[];
}

// ============================================================================
// Error and Event Interfaces
// ============================================================================

/**
 * Authentication error interface for structured error handling
 */
export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Network error interface with retry information
 */
export interface NetworkError extends Error {
  code: string;
  retryable: boolean;
  retryCount?: number;
  originalError?: Error;
}

/**
 * Session expiration notification interface
 */
export interface SessionExpirationNotification {
  type: 'warning' | 'expired';
  message: string;
  timeRemaining?: number;
  action?: 'refresh' | 'login';
}

/**
 * Authentication event interface for logging and monitoring
 */
export interface AuthEvent {
  type: 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'LOGOUT' | 'TOKEN_REFRESH' | 'UNAUTHORIZED_ACCESS';
  userId?: string;
  role?: UserRole;
  timestamp: Date;
  metadata?: any;
}
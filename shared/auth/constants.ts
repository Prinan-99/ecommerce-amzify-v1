/**
 * Unified Authentication System Constants
 * 
 * This file contains all constants used throughout the authentication system
 */

import { UserRole } from './types';

// ============================================================================
// Token Configuration
// ============================================================================

/**
 * JWT token configuration constants
 */
export const TOKEN_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '15m', // 15 minutes
  REFRESH_TOKEN_EXPIRY: '7d', // 7 days
  ISSUER: 'unified-auth-system',
  AUDIENCE: 'lumina-nexus-platform'
} as const;

/**
 * Cookie names for token storage
 */
export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER_DATA: 'auth_user_data'
} as const;

/**
 * Default cookie options for secure storage
 */
export const DEFAULT_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
};

// ============================================================================
// Route Configuration
// ============================================================================

/**
 * Default redirect paths for each user role after successful authentication
 */
export const DEFAULT_REDIRECT_PATHS: Record<UserRole, string> = {
  [UserRole.CUSTOMER]: '/customer',
  [UserRole.SELLER]: '/seller',
  [UserRole.SUPER_ADMIN]: '/admin'
};

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/access-denied'
] as const;

/**
 * Role-based route prefixes
 */
export const ROLE_ROUTE_PREFIXES: Record<UserRole, string> = {
  [UserRole.CUSTOMER]: '/customer',
  [UserRole.SELLER]: '/seller',
  [UserRole.SUPER_ADMIN]: '/admin'
};

// ============================================================================
// Authentication Error Codes
// ============================================================================

/**
 * Standard authentication error codes
 */
export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

/**
 * User-friendly error messages
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  [AUTH_ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid email/username or password. Please try again.',
  [AUTH_ERROR_CODES.USER_NOT_FOUND]: 'User account not found. Please check your credentials.',
  [AUTH_ERROR_CODES.ACCOUNT_DISABLED]: 'Your account has been disabled. Please contact support.',
  [AUTH_ERROR_CODES.TOKEN_EXPIRED]: 'Your session has expired. Please log in again.',
  [AUTH_ERROR_CODES.TOKEN_INVALID]: 'Invalid authentication token. Please log in again.',
  [AUTH_ERROR_CODES.INSUFFICIENT_PERMISSIONS]: 'You do not have permission to access this resource.',
  [AUTH_ERROR_CODES.SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
  [AUTH_ERROR_CODES.NETWORK_ERROR]: 'Network error occurred. Please check your connection and try again.',
  [AUTH_ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.'
};

// ============================================================================
// Role Permissions
// ============================================================================

/**
 * Default permissions for each user role
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.CUSTOMER]: [
    'customer:read_profile',
    'customer:update_profile',
    'customer:view_orders',
    'customer:place_orders',
    'customer:view_products',
    'customer:manage_cart'
  ],
  [UserRole.SELLER]: [
    'seller:read_profile',
    'seller:update_profile',
    'seller:manage_products',
    'seller:view_orders',
    'seller:update_orders',
    'seller:view_analytics',
    'seller:manage_inventory'
  ],
  [UserRole.SUPER_ADMIN]: [
    'admin:full_access',
    'admin:manage_users',
    'admin:manage_sellers',
    'admin:manage_products',
    'admin:view_analytics',
    'admin:system_settings',
    'admin:audit_logs'
  ]
};

// ============================================================================
// Hardcoded Admin Credentials (for development/demo)
// ============================================================================

/**
 * Hardcoded admin credentials as specified in requirements
 * Note: In production, these should be stored securely and configurable
 */
export const ADMIN_CREDENTIALS = {
  username: 'superadmin',
  password: 'admin123!@#'
} as const;

// ============================================================================
// Session Configuration
// ============================================================================

/**
 * Session management configuration
 */
export const SESSION_CONFIG = {
  CHECK_INTERVAL: 60000, // Check session validity every minute
  REFRESH_THRESHOLD: 300000, // Refresh token when 5 minutes left
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second delay between retries
} as const;
/**
 * Unified Authentication System Utilities
 * 
 * This file contains utility functions for authentication operations
 */

import { UserRole, User, Customer, Seller, SuperAdmin, JWTPayload } from './types';
import { ROLE_ROUTE_PREFIXES, ROLE_PERMISSIONS, PUBLIC_ROUTES } from './constants';

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a user is a Customer
 */
export function isCustomer(user: User): user is Customer {
  return user.role === UserRole.CUSTOMER;
}

/**
 * Type guard to check if a user is a Seller
 */
export function isSeller(user: User): user is Seller {
  return user.role === UserRole.SELLER;
}

/**
 * Type guard to check if a user is a Super Admin
 */
export function isSuperAdmin(user: User): user is SuperAdmin {
  return user.role === UserRole.SUPER_ADMIN;
}

// ============================================================================
// Route Utilities
// ============================================================================

/**
 * Check if a route is public (doesn't require authentication)
 */
export function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    if (route === '/') {
      return path === '/';
    }
    return path.startsWith(route);
  });
}

/**
 * Check if a user has access to a specific route based on their role
 */
export function hasRouteAccess(path: string, userRole: UserRole): boolean {
  // Public routes are accessible to everyone
  if (isPublicRoute(path)) {
    return true;
  }

  // Check if the path matches the user's role prefix
  const rolePrefix = ROLE_ROUTE_PREFIXES[userRole];
  return path.startsWith(rolePrefix);
}

/**
 * Get the default redirect path for a user role
 */
export function getDefaultRedirectPath(role: UserRole): string {
  return ROLE_ROUTE_PREFIXES[role];
}

/**
 * Extract the role from a route path
 */
export function getRoleFromPath(path: string): UserRole | null {
  for (const [role, prefix] of Object.entries(ROLE_ROUTE_PREFIXES)) {
    if (path.startsWith(prefix)) {
      return role as UserRole;
    }
  }
  return null;
}

// ============================================================================
// Permission Utilities
// ============================================================================

/**
 * Get all permissions for a specific role
 */
export function getRolePermissions(role: UserRole): string[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = getRolePermissions(role);
  return permissions.includes(permission) || permissions.includes('admin:full_access');
}

/**
 * Check if a user has a specific permission
 */
export function userHasPermission(user: User, permission: string): boolean {
  return hasPermission(user.role, permission);
}

// ============================================================================
// Token Utilities
// ============================================================================

/**
 * Check if a JWT token is expired
 */
export function isTokenExpired(payload: JWTPayload): boolean {
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

/**
 * Check if a JWT token is about to expire (within threshold)
 */
export function isTokenNearExpiry(payload: JWTPayload, thresholdSeconds: number = 300): boolean {
  const now = Math.floor(Date.now() / 1000);
  return payload.exp - now < thresholdSeconds;
}

/**
 * Get time until token expiry in seconds
 */
export function getTokenTimeToExpiry(payload: JWTPayload): number {
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, payload.exp - now);
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength (basic validation)
 */
export function isValidPassword(password: string): boolean {
  // At least 8 characters, contains letters and numbers
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Validate seller name format
 */
export function isValidSellerName(sellerName: string): boolean {
  // At least 2 characters, letters, numbers, spaces, and common punctuation
  const sellerNameRegex = /^[A-Za-z0-9\s\-_.]{2,50}$/;
  return sellerNameRegex.test(sellerName);
}

/**
 * Validate company name format
 */
export function isValidCompanyName(companyName: string): boolean {
  // At least 2 characters, letters, numbers, spaces, and common business punctuation
  const companyNameRegex = /^[A-Za-z0-9\s\-_.&,()]{2,100}$/;
  return companyNameRegex.test(companyName);
}

/**
 * Validate admin username format
 */
export function isValidAdminUsername(username: string): boolean {
  // At least 3 characters, alphanumeric and underscores only
  const usernameRegex = /^[A-Za-z0-9_]{3,30}$/;
  return usernameRegex.test(username);
}

// ============================================================================
// User Display Utilities
// ============================================================================

/**
 * Get display name for a user based on their role
 */
export function getUserDisplayName(user: User): string {
  switch (user.role) {
    case UserRole.CUSTOMER:
      const customer = user as Customer;
      return `${customer.firstName} ${customer.lastName}`;
    case UserRole.SELLER:
      const seller = user as Seller;
      return seller.sellerName;
    case UserRole.SUPER_ADMIN:
      const admin = user as SuperAdmin;
      return admin.adminUsername;
    default:
      return 'Unknown User';
  }
}

/**
 * Get user identifier (email or username) for display
 */
export function getUserIdentifier(user: User): string {
  switch (user.role) {
    case UserRole.CUSTOMER:
      return (user as Customer).email;
    case UserRole.SELLER:
      return (user as Seller).email;
    case UserRole.SUPER_ADMIN:
      return (user as SuperAdmin).adminUsername;
    default:
      return 'Unknown';
  }
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case UserRole.CUSTOMER:
      return 'Customer';
    case UserRole.SELLER:
      return 'Seller';
    case UserRole.SUPER_ADMIN:
      return 'Super Admin';
    default:
      return 'Unknown Role';
  }
}

// ============================================================================
// Date and Time Utilities
// ============================================================================

/**
 * Format date for display in authentication contexts
 */
export function formatAuthDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

/**
 * Get relative time string (e.g., "2 minutes ago")
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

// ============================================================================
// Error Handling Utilities
// ============================================================================

/**
 * Create a standardized authentication error
 */
export function createAuthError(code: string, message: string, details?: any) {
  return {
    code,
    message,
    details,
    timestamp: new Date()
  };
}

/**
 * Check if an error is an authentication error
 */
export function isAuthError(error: any): boolean {
  return error && typeof error === 'object' && 'code' in error && 'message' in error;
}
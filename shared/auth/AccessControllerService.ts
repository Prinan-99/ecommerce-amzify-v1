/**
 * Access Controller Service
 * 
 * This service implements role-based access control for routes and resources.
 * It validates user permissions, handles unauthorized access, and provides
 * redirect logic for role-based navigation.
 */

import { UserRole, AccessControllerService, AuthEvent } from './types';
import { 
  DEFAULT_REDIRECT_PATHS, 
  PUBLIC_ROUTES, 
  ROLE_ROUTE_PREFIXES,
  AUTH_ERROR_CODES 
} from './constants';

/**
 * Route access configuration defining which roles can access which route patterns
 */
interface RouteAccessConfig {
  pattern: string;
  allowedRoles: UserRole[];
  exact?: boolean;
}

/**
 * Implementation of the AccessControllerService interface
 */
export class AccessController implements AccessControllerService {
  private static instance: AccessController;
  private accessLog: AuthEvent[] = [];

  /**
   * Route access configuration mapping
   */
  private readonly routeConfigs: RouteAccessConfig[] = [
    // Customer routes
    { pattern: '/customer', allowedRoles: [UserRole.CUSTOMER] },
    { pattern: '/customer/*', allowedRoles: [UserRole.CUSTOMER] },
    
    // Seller routes
    { pattern: '/seller', allowedRoles: [UserRole.SELLER] },
    { pattern: '/seller/*', allowedRoles: [UserRole.SELLER] },
    
    // Admin routes
    { pattern: '/admin', allowedRoles: [UserRole.SUPER_ADMIN] },
    { pattern: '/admin/*', allowedRoles: [UserRole.SUPER_ADMIN] },
    
    // Public routes (accessible to all)
    { pattern: '/', allowedRoles: [UserRole.CUSTOMER, UserRole.SELLER, UserRole.SUPER_ADMIN] },
    { pattern: '/login', allowedRoles: [UserRole.CUSTOMER, UserRole.SELLER, UserRole.SUPER_ADMIN] },
    { pattern: '/access-denied', allowedRoles: [UserRole.CUSTOMER, UserRole.SELLER, UserRole.SUPER_ADMIN] }
  ];

  /**
   * Singleton pattern implementation
   */
  public static getInstance(): AccessController {
    if (!AccessController.instance) {
      AccessController.instance = new AccessController();
    }
    return AccessController.instance;
  }

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}

  /**
   * Validates if a user with the given role can access the specified route
   * 
   * @param path - The route path to validate
   * @param userRole - The user's role
   * @returns true if access is allowed, false otherwise
   */
  public validateRouteAccess(path: string, userRole: UserRole): boolean {
    // Check if it's a public route
    if (this.isPublicRoute(path)) {
      return true;
    }

    // Find matching route configuration
    const matchingConfig = this.findMatchingRouteConfig(path);
    
    if (!matchingConfig) {
      // If no specific config found, deny access by default
      this.logUnauthorizedAccess(path, userRole, 'No route configuration found');
      return false;
    }

    // Check if user's role is in the allowed roles
    const hasAccess = matchingConfig.allowedRoles.includes(userRole);
    
    if (!hasAccess) {
      this.logUnauthorizedAccess(path, userRole, 'Role not in allowed roles');
    }

    return hasAccess;
  }

  /**
   * Gets the appropriate redirect path for a user based on their role
   * 
   * @param userRole - The user's role
   * @returns The redirect path for the user's role
   */
  public getRedirectPath(userRole: UserRole): string {
    return DEFAULT_REDIRECT_PATHS[userRole] || '/';
  }

  /**
   * Handles unauthorized access attempts by logging and providing feedback
   * Enhanced with detailed logging and access denied page integration
   * 
   * @param attemptedPath - The path the user tried to access
   * @param userRole - The user's role
   * @param additionalContext - Additional context for logging
   */
  public handleUnauthorizedAccess(
    attemptedPath: string, 
    userRole: UserRole, 
    additionalContext?: any
  ): void {
    // Enhanced logging with more details
    this.logUnauthorizedAccess(attemptedPath, userRole, 'Unauthorized access attempt', additionalContext);
    
    // In a real application, you might want to:
    // - Send analytics events
    // - Trigger security alerts for suspicious patterns
    // - Rate limit repeated unauthorized attempts
    // - Send notifications to security team for admin route attempts
    
    const logData = {
      timestamp: new Date().toISOString(),
      attemptedPath,
      userRole,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      referrer: typeof document !== 'undefined' ? document.referrer : 'unknown',
      additionalContext
    };

    console.warn('Unauthorized access attempt:', logData);

    // Check if this is a repeated attempt from the same user
    const recentAttempts = this.getRecentUnauthorizedAttempts(userRole, 5 * 60 * 1000); // 5 minutes
    if (recentAttempts.length > 3) {
      console.error('Multiple unauthorized access attempts detected:', {
        userRole,
        attemptCount: recentAttempts.length,
        paths: recentAttempts.map(event => event.metadata?.attemptedPath)
      });
      
      // Could trigger additional security measures here
      // - Temporary account suspension
      // - CAPTCHA requirement
      // - Security team notification
    }

    // For admin route attempts, log with higher severity
    if (attemptedPath.startsWith('/admin') && userRole !== UserRole.SUPER_ADMIN) {
      console.error('Attempted admin access by non-admin user:', logData);
      // Could trigger immediate security alert
    }
  }

  /**
   * Checks if a route is public (accessible without authentication)
   * 
   * @param path - The route path to check
   * @returns true if the route is public, false otherwise
   */
  public isPublicRoute(path: string): boolean {
    return PUBLIC_ROUTES.some(publicRoute => {
      if (publicRoute === path) return true;
      if (publicRoute.endsWith('*')) {
        const prefix = publicRoute.slice(0, -1);
        return path.startsWith(prefix);
      }
      return false;
    });
  }

  /**
   * Gets the role that should have access to a specific route
   * 
   * @param path - The route path
   * @returns The role that should access this route, or null if it's public/unknown
   */
  public getRouteRole(path: string): UserRole | null {
    // Check role-based route prefixes
    for (const [role, prefix] of Object.entries(ROLE_ROUTE_PREFIXES)) {
      if (path.startsWith(prefix)) {
        return role as UserRole;
      }
    }
    
    return null;
  }

  /**
   * Validates if a user can access a specific resource/action
   * 
   * @param userRole - The user's role
   * @param resource - The resource being accessed
   * @param action - The action being performed
   * @returns true if access is allowed, false otherwise
   */
  public validateResourceAccess(userRole: UserRole, resource: string, action: string): boolean {
    // Define resource-action permissions for each role
    const permissions: Record<UserRole, Record<string, string[]>> = {
      [UserRole.CUSTOMER]: {
        'orders': ['read', 'create'],
        'profile': ['read', 'update'],
        'products': ['read'],
        'cart': ['read', 'create', 'update', 'delete']
      },
      [UserRole.SELLER]: {
        'products': ['read', 'create', 'update', 'delete'],
        'orders': ['read', 'update'],
        'profile': ['read', 'update'],
        'analytics': ['read'],
        'inventory': ['read', 'update']
      },
      [UserRole.SUPER_ADMIN]: {
        'users': ['read', 'create', 'update', 'delete'],
        'sellers': ['read', 'create', 'update', 'delete'],
        'products': ['read', 'create', 'update', 'delete'],
        'orders': ['read', 'update', 'delete'],
        'analytics': ['read'],
        'system': ['read', 'update', 'delete']
      }
    };

    const rolePermissions = permissions[userRole];
    if (!rolePermissions) return false;

    const resourceActions = rolePermissions[resource];
    if (!resourceActions) return false;

    return resourceActions.includes(action);
  }

  /**
   * Gets the access log for monitoring and auditing
   * 
   * @returns Array of access events
   */
  public getAccessLog(): AuthEvent[] {
    return [...this.accessLog];
  }

  /**
   * Gets recent unauthorized access attempts for a specific user role
   * 
   * @param userRole - The user role to filter by
   * @param timeWindowMs - Time window in milliseconds to look back
   * @returns Array of recent unauthorized access events
   */
  public getRecentUnauthorizedAttempts(userRole: UserRole, timeWindowMs: number = 300000): AuthEvent[] {
    const cutoffTime = new Date(Date.now() - timeWindowMs);
    return this.accessLog.filter(event => 
      event.type === 'UNAUTHORIZED_ACCESS' &&
      event.role === userRole &&
      event.timestamp > cutoffTime
    );
  }

  /**
   * Gets unauthorized access statistics
   * 
   * @returns Statistics about unauthorized access attempts
   */
  public getUnauthorizedAccessStats(): {
    total: number;
    byRole: Record<UserRole, number>;
    recentAttempts: number;
    topAttemptedPaths: Array<{ path: string; count: number }>;
  } {
    const unauthorizedEvents = this.accessLog.filter(event => event.type === 'UNAUTHORIZED_ACCESS');
    const recentCutoff = new Date(Date.now() - 3600000); // 1 hour ago
    
    const byRole: Record<UserRole, number> = {
      [UserRole.CUSTOMER]: 0,
      [UserRole.SELLER]: 0,
      [UserRole.SUPER_ADMIN]: 0
    };

    const pathCounts: Record<string, number> = {};

    unauthorizedEvents.forEach(event => {
      if (event.role) {
        byRole[event.role]++;
      }
      
      const path = event.metadata?.attemptedPath;
      if (path) {
        pathCounts[path] = (pathCounts[path] || 0) + 1;
      }
    });

    const topAttemptedPaths = Object.entries(pathCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      total: unauthorizedEvents.length,
      byRole,
      recentAttempts: unauthorizedEvents.filter(event => event.timestamp > recentCutoff).length,
      topAttemptedPaths
    };
  }

  /**
   * Clears the access log
   */
  public clearAccessLog(): void {
    this.accessLog = [];
  }

  /**
   * Finds the matching route configuration for a given path
   * 
   * @param path - The route path
   * @returns The matching route configuration or null
   */
  private findMatchingRouteConfig(path: string): RouteAccessConfig | null {
    // First try exact matches
    const exactMatch = this.routeConfigs.find(config => 
      config.exact && config.pattern === path
    );
    
    if (exactMatch) return exactMatch;

    // Then try pattern matches
    return this.routeConfigs.find(config => {
      if (config.pattern.endsWith('/*')) {
        const prefix = config.pattern.slice(0, -2);
        return path.startsWith(prefix);
      }
      return config.pattern === path;
    }) || null;
  }

  /**
   * Logs unauthorized access attempts for security monitoring
   * Enhanced with additional context and metadata
   * 
   * @param path - The attempted path
   * @param userRole - The user's role
   * @param reason - The reason for denial
   * @param additionalContext - Additional context information
   */
  private logUnauthorizedAccess(
    path: string, 
    userRole: UserRole, 
    reason: string,
    additionalContext?: any
  ): void {
    const event: AuthEvent = {
      type: 'UNAUTHORIZED_ACCESS',
      role: userRole,
      timestamp: new Date(),
      metadata: {
        attemptedPath: path,
        reason,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        referrer: typeof document !== 'undefined' ? document.referrer : 'unknown',
        timestamp: new Date().toISOString(),
        sessionId: this.generateSessionId(),
        additionalContext
      }
    };

    this.accessLog.push(event);

    // Keep only the last 1000 access log entries to prevent memory issues
    if (this.accessLog.length > 1000) {
      this.accessLog = this.accessLog.slice(-1000);
    }

    // In production, you would also send this to a logging service
    // logService.logSecurityEvent(event);
  }

  /**
   * Generate a simple session ID for tracking purposes
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Export singleton instance for easy access
 */
export const accessController = AccessController.getInstance();

/**
 * Utility functions for common access control operations
 */
export const AccessControlUtils = {
  /**
   * Check if current user can access a route
   */
  canAccessRoute: (path: string, userRole: UserRole): boolean => {
    return accessController.validateRouteAccess(path, userRole);
  },

  /**
   * Get redirect path for user role
   */
  getRedirectForRole: (userRole: UserRole): string => {
    return accessController.getRedirectPath(userRole);
  },

  /**
   * Check if route is public
   */
  isPublic: (path: string): boolean => {
    return accessController.isPublicRoute(path);
  },

  /**
   * Handle unauthorized access
   */
  handleUnauthorized: (path: string, userRole: UserRole): void => {
    accessController.handleUnauthorizedAccess(path, userRole);
  }
};
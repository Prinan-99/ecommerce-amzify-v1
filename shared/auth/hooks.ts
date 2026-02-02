/**
 * Additional Authentication Utilities
 * 
 * This file provides additional utilities for enhanced authentication state management.
 * React-specific hooks should be implemented in the consuming projects.
 */

import { User, UserRole, LoginCredentials } from './types';

/**
 * Authentication state utility functions
 */
export class AuthStateManager {
  private static loginAttempts = 0;
  private static lastError: string | null = null;

  /**
   * Track login attempts
   */
  static incrementLoginAttempts(): number {
    return ++this.loginAttempts;
  }

  /**
   * Reset login attempts
   */
  static resetLoginAttempts(): void {
    this.loginAttempts = 0;
  }

  /**
   * Get current login attempts
   */
  static getLoginAttempts(): number {
    return this.loginAttempts;
  }

  /**
   * Set last error
   */
  static setLastError(error: string | null): void {
    this.lastError = error;
  }

  /**
   * Get last error
   */
  static getLastError(): string | null {
    return this.lastError;
  }

  /**
   * Clear last error
   */
  static clearLastError(): void {
    this.lastError = null;
  }

  /**
   * Check if can retry login
   */
  static canRetry(maxRetries: number = 3): boolean {
    return this.loginAttempts < maxRetries;
  }
}

/**
 * Role-based access control utilities
 */
export class RoleAccessManager {
  /**
   * Check if user has specific role
   */
  static hasRole(user: User | null, role: UserRole): boolean {
    return user?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  static hasAnyRole(user: User | null, roles: UserRole[]): boolean {
    if (!user) return false;
    return roles.includes(user.role);
  }

  /**
   * Check if user has all of the specified roles
   * (In this system, a user can only have one role, so this checks if the user's role is in the list)
   */
  static hasAllRoles(user: User | null, roles: UserRole[]): boolean {
    if (!user || roles.length === 0) return false;
    return roles.length === 1 && roles[0] === user.role;
  }

  /**
   * Get role-specific permissions
   */
  static getRolePermissions(role: UserRole): string[] {
    switch (role) {
      case UserRole.CUSTOMER:
        return ['view_products', 'place_orders', 'view_order_history'];
      case UserRole.SELLER:
        return ['manage_products', 'view_orders', 'manage_inventory', 'view_analytics'];
      case UserRole.SUPER_ADMIN:
        return ['manage_users', 'manage_sellers', 'view_all_data', 'system_admin'];
      default:
        return [];
    }
  }

  /**
   * Check if user has specific permission
   */
  static hasPermission(user: User | null, permission: string): boolean {
    if (!user) return false;
    const permissions = this.getRolePermissions(user.role);
    return permissions.includes(permission);
  }
}

/**
 * Authentication persistence utilities
 */
export class AuthPersistenceManager {
  private static readonly STORAGE_KEY = 'auth_state';
  private static readonly MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Save authentication state to storage
   */
  static saveAuthState(user: User | null): void {
    if (typeof window === 'undefined') return;

    const stateToSave = {
      user,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to save auth state:', error);
    }
  }

  /**
   * Load authentication state from storage
   */
  static loadAuthState(): { user: User | null; isValid: boolean } {
    if (typeof window === 'undefined') {
      return { user: null, isValid: false };
    }

    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (!saved) {
        return { user: null, isValid: false };
      }

      const parsed = JSON.parse(saved);
      const isValid = (Date.now() - parsed.timestamp) < this.MAX_AGE;

      return {
        user: isValid ? parsed.user : null,
        isValid
      };
    } catch (error) {
      console.warn('Failed to load auth state:', error);
      return { user: null, isValid: false };
    }
  }

  /**
   * Clear saved authentication state
   */
  static clearAuthState(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear auth state:', error);
    }
  }
}

/**
 * Authentication event tracking utilities
 */
export class AuthEventTracker {
  private static events: Array<{
    type: 'login' | 'logout' | 'error' | 'refresh';
    timestamp: number;
    data?: any;
  }> = [];

  /**
   * Add authentication event
   */
  static addEvent(type: 'login' | 'logout' | 'error' | 'refresh', data?: any): void {
    this.events = [
      ...this.events.slice(-9), // Keep last 10 events
      {
        type,
        timestamp: Date.now(),
        data
      }
    ];
  }

  /**
   * Get event history
   */
  static getEventHistory(): typeof AuthEventTracker.events {
    return [...this.events];
  }

  /**
   * Clear event history
   */
  static clearEventHistory(): void {
    this.events = [];
  }

  /**
   * Get events of specific type
   */
  static getEventsByType(type: 'login' | 'logout' | 'error' | 'refresh'): typeof AuthEventTracker.events {
    return this.events.filter(event => event.type === type);
  }
}
/**
 * Admin Credentials Manager
 * 
 * This module provides secure storage and validation for admin credentials.
 * It implements secure storage for admin credentials, admin authentication validation,
 * and admin login and access control testing.
 * 
 * Requirements: 4.1, 4.3, 4.4
 */

import { ADMIN_CREDENTIALS } from './constants';
import { SuperAdmin, UserRole, AuthResult } from './types';
import { isValidAdminUsername } from './utils';

// ============================================================================
// Admin Credentials Interface
// ============================================================================

export interface AdminCredentials {
  username: string;
  password: string;
}

export interface AdminCredentialsConfig {
  enableMultipleAdmins?: boolean;
  requireStrongPassword?: boolean;
  enableAccountLocking?: boolean;
  maxFailedAttempts?: number;
  lockoutDurationMs?: number;
}

// ============================================================================
// Admin Credentials Manager Class
// ============================================================================

export class AdminCredentialsManager {
  private static instance: AdminCredentialsManager;
  private config: AdminCredentialsConfig;
  private failedAttempts: Map<string, { count: number; lastAttempt: Date }> = new Map();
  private lockedAccounts: Map<string, Date> = new Map();

  /**
   * Default configuration
   */
  private static readonly DEFAULT_CONFIG: AdminCredentialsConfig = {
    enableMultipleAdmins: false,
    requireStrongPassword: true,
    enableAccountLocking: true,
    maxFailedAttempts: 3,
    lockoutDurationMs: 15 * 60 * 1000 // 15 minutes
  };

  /**
   * Additional admin accounts (for future extensibility)
   * In production, these would be stored in a secure database
   */
  private additionalAdmins: Map<string, AdminCredentials> = new Map();

  /**
   * Singleton pattern implementation
   */
  public static getInstance(config?: AdminCredentialsConfig): AdminCredentialsManager {
    if (!AdminCredentialsManager.instance) {
      AdminCredentialsManager.instance = new AdminCredentialsManager(config);
    }
    return AdminCredentialsManager.instance;
  }

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor(config?: AdminCredentialsConfig) {
    this.config = { ...AdminCredentialsManager.DEFAULT_CONFIG, ...config };
  }

  /**
   * Validate admin credentials against hardcoded and additional admin accounts
   */
  public validateAdminCredentials(username: string, password: string): AuthResult {
    try {
      // Input validation
      if (!username || !password) {
        return {
          success: false,
          error: 'Username and password are required'
        };
      }

      // Validate username format
      if (!isValidAdminUsername(username)) {
        return {
          success: false,
          error: 'Invalid username format'
        };
      }

      // Check if account is locked
      if (this.isAccountLocked(username)) {
        const lockExpiry = this.lockedAccounts.get(username);
        const remainingTime = lockExpiry ? Math.ceil((lockExpiry.getTime() - Date.now()) / 1000 / 60) : 0;
        return {
          success: false,
          error: `Account is locked. Try again in ${remainingTime} minutes.`
        };
      }

      // Check against hardcoded admin credentials
      const isHardcodedAdmin = this.validateHardcodedAdmin(username, password);
      
      // Check against additional admin accounts (if enabled)
      const isAdditionalAdmin = this.config.enableMultipleAdmins && 
                               this.validateAdditionalAdmin(username, password);

      if (isHardcodedAdmin || isAdditionalAdmin) {
        // Clear failed attempts on successful login
        this.clearFailedAttempts(username);
        
        // Create admin user object
        const adminUser: SuperAdmin = {
          id: username === ADMIN_CREDENTIALS.username ? 'admin-001' : `admin-${Date.now()}`,
          adminUsername: username,
          role: UserRole.SUPER_ADMIN,
          createdAt: new Date('2024-01-01'), // Fixed creation date for hardcoded admin
          lastLoginAt: new Date(),
          isActive: true
        };

        return {
          success: true,
          user: adminUser
        };
      } else {
        // Record failed attempt
        this.recordFailedAttempt(username);
        
        return {
          success: false,
          error: 'Invalid admin credentials'
        };
      }

    } catch (error) {
      console.error('Error validating admin credentials:', error);
      return {
        success: false,
        error: 'Authentication error occurred'
      };
    }
  }

  /**
   * Validate against hardcoded admin credentials
   */
  private validateHardcodedAdmin(username: string, password: string): boolean {
    return username === ADMIN_CREDENTIALS.username && 
           password === ADMIN_CREDENTIALS.password;
  }

  /**
   * Validate against additional admin accounts
   */
  private validateAdditionalAdmin(username: string, password: string): boolean {
    const adminAccount = this.additionalAdmins.get(username);
    return adminAccount ? adminAccount.password === password : false;
  }

  /**
   * Add additional admin account (for future extensibility)
   */
  public addAdminAccount(username: string, password: string): boolean {
    if (!this.config.enableMultipleAdmins) {
      console.warn('Multiple admin accounts are disabled');
      return false;
    }

    // Validate username format
    if (!isValidAdminUsername(username)) {
      console.error('Invalid admin username format');
      return false;
    }

    // Validate password strength if required
    if (this.config.requireStrongPassword && !this.isStrongPassword(password)) {
      console.error('Password does not meet strength requirements');
      return false;
    }

    // Check if username already exists
    if (username === ADMIN_CREDENTIALS.username || this.additionalAdmins.has(username)) {
      console.error('Admin username already exists');
      return false;
    }

    // In production, password should be hashed
    this.additionalAdmins.set(username, { username, password });
    
    console.log(`Additional admin account created: ${username}`);
    return true;
  }

  /**
   * Remove additional admin account
   */
  public removeAdminAccount(username: string): boolean {
    if (username === ADMIN_CREDENTIALS.username) {
      console.error('Cannot remove hardcoded admin account');
      return false;
    }

    const removed = this.additionalAdmins.delete(username);
    if (removed) {
      console.log(`Admin account removed: ${username}`);
    }
    
    return removed;
  }

  /**
   * List all admin accounts
   */
  public listAdminAccounts(): string[] {
    const accounts = [ADMIN_CREDENTIALS.username];
    
    if (this.config.enableMultipleAdmins) {
      accounts.push(...Array.from(this.additionalAdmins.keys()));
    }
    
    return accounts;
  }

  /**
   * Check if account is locked due to failed attempts
   */
  private isAccountLocked(username: string): boolean {
    if (!this.config.enableAccountLocking) {
      return false;
    }

    const lockExpiry = this.lockedAccounts.get(username);
    if (!lockExpiry) {
      return false;
    }

    // Check if lock has expired
    if (Date.now() > lockExpiry.getTime()) {
      this.lockedAccounts.delete(username);
      return false;
    }

    return true;
  }

  /**
   * Record failed login attempt
   */
  private recordFailedAttempt(username: string): void {
    if (!this.config.enableAccountLocking) {
      return;
    }

    const attempts = this.failedAttempts.get(username) || { count: 0, lastAttempt: new Date() };
    attempts.count++;
    attempts.lastAttempt = new Date();
    
    this.failedAttempts.set(username, attempts);

    // Lock account if max attempts exceeded
    if (attempts.count >= (this.config.maxFailedAttempts || 3)) {
      const lockUntil = new Date(Date.now() + (this.config.lockoutDurationMs || 15 * 60 * 1000));
      this.lockedAccounts.set(username, lockUntil);
      
      console.warn(`Admin account locked due to failed attempts: ${username}`);
    }
  }

  /**
   * Clear failed attempts for successful login
   */
  private clearFailedAttempts(username: string): void {
    this.failedAttempts.delete(username);
    this.lockedAccounts.delete(username);
  }

  /**
   * Validate password strength
   */
  private isStrongPassword(password: string): boolean {
    // At least 8 characters, contains uppercase, lowercase, number, and special character
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  }

  /**
   * Get failed attempt information for an account
   */
  public getFailedAttemptInfo(username: string): { count: number; lastAttempt: Date | null; isLocked: boolean; lockExpiry: Date | null } {
    const attempts = this.failedAttempts.get(username);
    const lockExpiry = this.lockedAccounts.get(username);
    
    return {
      count: attempts?.count || 0,
      lastAttempt: attempts?.lastAttempt || null,
      isLocked: this.isAccountLocked(username),
      lockExpiry: lockExpiry || null
    };
  }

  /**
   * Manually unlock an account (for admin management)
   */
  public unlockAccount(username: string): boolean {
    const wasLocked = this.lockedAccounts.has(username);
    this.clearFailedAttempts(username);
    
    if (wasLocked) {
      console.log(`Admin account unlocked: ${username}`);
    }
    
    return wasLocked;
  }

  /**
   * Get admin credentials configuration
   */
  public getConfig(): AdminCredentialsConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<AdminCredentialsConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Test admin authentication (for testing purposes)
   */
  public testAdminAuthentication(): {
    hardcodedAdmin: boolean;
    additionalAdmins: number;
    accountLocking: boolean;
    strongPassword: boolean;
  } {
    return {
      hardcodedAdmin: this.validateHardcodedAdmin(ADMIN_CREDENTIALS.username, ADMIN_CREDENTIALS.password),
      additionalAdmins: this.additionalAdmins.size,
      accountLocking: this.config.enableAccountLocking || false,
      strongPassword: this.config.requireStrongPassword || false
    };
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create default admin credentials manager instance
 */
export const adminCredentialsManager = AdminCredentialsManager.getInstance();

/**
 * Validate admin credentials (convenience function)
 */
export function validateAdminCredentials(username: string, password: string): AuthResult {
  return adminCredentialsManager.validateAdminCredentials(username, password);
}

/**
 * Test admin login functionality
 */
export function testAdminLogin(): boolean {
  const result = adminCredentialsManager.validateAdminCredentials(
    ADMIN_CREDENTIALS.username, 
    ADMIN_CREDENTIALS.password
  );
  return result.success;
}

/**
 * Get admin account information
 */
export function getAdminAccountInfo(): {
  username: string;
  accountsCount: number;
  testResult: boolean;
} {
  const accounts = adminCredentialsManager.listAdminAccounts();
  const testResult = testAdminLogin();
  
  return {
    username: ADMIN_CREDENTIALS.username,
    accountsCount: accounts.length,
    testResult
  };
}
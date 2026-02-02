/**
 * Comprehensive Error Handler for Unified Authentication System
 * 
 * This module provides enhanced error handling with specific error messages,
 * network error handling with retry options, and session expiration notifications.
 * 
 * Requirements: 10.1, 10.2, 10.4
 */

import { AUTH_ERROR_CODES, AUTH_ERROR_MESSAGES, SESSION_CONFIG } from './constants';
import { AuthError, UserRole } from './types';

// ============================================================================
// Error Types and Interfaces
// ============================================================================

export interface NetworkError extends Error {
  code: string;
  retryable: boolean;
  retryCount?: number;
  originalError?: Error;
}

export interface SessionExpirationNotification {
  type: 'warning' | 'expired';
  message: string;
  timeRemaining?: number;
  action?: 'refresh' | 'login';
}

export interface RetryOptions {
  maxAttempts: number;
  delay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

export interface ErrorHandlerConfig {
  enableRetry: boolean;
  retryOptions: RetryOptions;
  enableNotifications: boolean;
  logErrors: boolean;
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: SESSION_CONFIG.MAX_RETRY_ATTEMPTS,
  delay: SESSION_CONFIG.RETRY_DELAY,
  backoffMultiplier: 2,
  retryableErrors: [
    AUTH_ERROR_CODES.NETWORK_ERROR,
    'TIMEOUT',
    'CONNECTION_REFUSED',
    'SERVICE_UNAVAILABLE'
  ]
};

const DEFAULT_CONFIG: ErrorHandlerConfig = {
  enableRetry: true,
  retryOptions: DEFAULT_RETRY_OPTIONS,
  enableNotifications: true,
  logErrors: true
};

// ============================================================================
// Enhanced Error Handler Class
// ============================================================================

export class AuthErrorHandler {
  private config: ErrorHandlerConfig;
  private notificationCallbacks: Set<(notification: SessionExpirationNotification) => void> = new Set();
  private sessionWarningTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Handle authentication errors with enhanced messaging and retry logic
   */
  async handleAuthError(error: any, context?: string): Promise<AuthError> {
    const authError = this.normalizeError(error, context);
    
    if (this.config.logErrors) {
      this.logError(authError, context);
    }

    // Handle specific error types
    switch (authError.code) {
      case AUTH_ERROR_CODES.TOKEN_EXPIRED:
      case AUTH_ERROR_CODES.SESSION_EXPIRED:
        this.handleSessionExpiration();
        break;
      
      case AUTH_ERROR_CODES.NETWORK_ERROR:
        return this.handleNetworkError(authError);
      
      case AUTH_ERROR_CODES.INSUFFICIENT_PERMISSIONS:
        this.handlePermissionError(authError);
        break;
    }

    return authError;
  }

  /**
   * Handle network errors with retry logic
   */
  async handleNetworkError(error: AuthError): Promise<AuthError> {
    if (!this.config.enableRetry) {
      return error;
    }

    const networkError = error as NetworkError;
    const retryCount = networkError.retryCount || 0;

    if (retryCount >= this.config.retryOptions.maxAttempts) {
      return {
        ...error,
        message: `Network error after ${retryCount} attempts. Please check your connection and try again.`,
        details: { ...error.details, maxRetriesExceeded: true }
      };
    }

    // Check if error is retryable
    const isRetryable = this.config.retryOptions.retryableErrors.some(
      retryableCode => error.code.includes(retryableCode) || error.message.includes(retryableCode)
    );

    if (!isRetryable) {
      return error;
    }

    // Calculate delay with exponential backoff
    const delay = this.config.retryOptions.delay * 
      Math.pow(this.config.retryOptions.backoffMultiplier, retryCount);

    return {
      ...error,
      message: `Network error (attempt ${retryCount + 1}/${this.config.retryOptions.maxAttempts}). Retrying in ${delay}ms...`,
      details: { 
        ...error.details, 
        retryCount: retryCount + 1,
        nextRetryDelay: delay,
        retryable: true
      }
    };
  }

  /**
   * Handle session expiration with notifications
   */
  private handleSessionExpiration(): void {
    if (!this.config.enableNotifications) {
      return;
    }

    // Clear any existing warning timer
    if (this.sessionWarningTimer) {
      clearTimeout(this.sessionWarningTimer);
      this.sessionWarningTimer = null;
    }

    // Notify about session expiration
    const notification: SessionExpirationNotification = {
      type: 'expired',
      message: 'Your session has expired. Please log in again to continue.',
      action: 'login'
    };

    this.notifySessionExpiration(notification);
  }

  /**
   * Handle permission errors
   */
  private handlePermissionError(error: AuthError): void {
    if (this.config.logErrors) {
      console.warn('Permission denied:', error);
    }

    // Could trigger additional security measures here
    // such as logging the unauthorized access attempt
  }

  /**
   * Set up session expiration warning
   */
  setupSessionWarning(expirationTime: Date): void {
    if (!this.config.enableNotifications) {
      return;
    }

    // Clear existing timer
    if (this.sessionWarningTimer) {
      clearTimeout(this.sessionWarningTimer);
    }

    const now = new Date().getTime();
    const expiresAt = expirationTime.getTime();
    const timeUntilExpiry = expiresAt - now;
    
    // Set warning for 5 minutes before expiration
    const warningTime = timeUntilExpiry - (5 * 60 * 1000);

    if (warningTime > 0) {
      this.sessionWarningTimer = setTimeout(() => {
        const notification: SessionExpirationNotification = {
          type: 'warning',
          message: 'Your session will expire in 5 minutes. Please save your work.',
          timeRemaining: 5 * 60,
          action: 'refresh'
        };

        this.notifySessionExpiration(notification);
      }, warningTime);
    }
  }

  /**
   * Subscribe to session expiration notifications
   */
  onSessionExpiration(callback: (notification: SessionExpirationNotification) => void): () => void {
    this.notificationCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.notificationCallbacks.delete(callback);
    };
  }

  /**
   * Notify all subscribers about session expiration
   */
  private notifySessionExpiration(notification: SessionExpirationNotification): void {
    this.notificationCallbacks.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in session expiration callback:', error);
      }
    });
  }

  /**
   * Normalize various error types into AuthError format
   */
  private normalizeError(error: any, context?: string): AuthError {
    // If it's already an AuthError, return as is
    if (this.isAuthError(error)) {
      return error;
    }

    // Handle network/fetch errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        code: AUTH_ERROR_CODES.NETWORK_ERROR,
        message: AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.NETWORK_ERROR],
        details: { originalError: error.message, context }
      };
    }

    // Handle timeout errors
    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      return {
        code: 'TIMEOUT',
        message: 'Request timed out. Please try again.',
        details: { originalError: error.message, context }
      };
    }

    // Handle generic errors
    if (error instanceof Error) {
      return {
        code: AUTH_ERROR_CODES.UNKNOWN_ERROR,
        message: error.message || AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.UNKNOWN_ERROR],
        details: { originalError: error.message, context }
      };
    }

    // Handle string errors
    if (typeof error === 'string') {
      return {
        code: AUTH_ERROR_CODES.UNKNOWN_ERROR,
        message: error,
        details: { context }
      };
    }

    // Fallback for unknown error types
    return {
      code: AUTH_ERROR_CODES.UNKNOWN_ERROR,
      message: AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.UNKNOWN_ERROR],
      details: { originalError: String(error), context }
    };
  }

  /**
   * Check if an object is an AuthError
   */
  private isAuthError(error: any): error is AuthError {
    return error && 
           typeof error === 'object' && 
           'code' in error && 
           'message' in error;
  }

  /**
   * Log error with context information
   */
  private logError(error: AuthError, context?: string): void {
    const logData = {
      code: error.code,
      message: error.message,
      context,
      timestamp: new Date().toISOString(),
      details: error.details
    };

    // In production, this would send to a logging service
    console.error('Authentication Error:', logData);
  }

  /**
   * Get user-friendly error message for display
   */
  getUserFriendlyMessage(error: AuthError): string {
    // Check if we have a specific user-friendly message
    if (AUTH_ERROR_MESSAGES[error.code]) {
      return AUTH_ERROR_MESSAGES[error.code];
    }

    // For network errors, provide more specific guidance
    if (error.code === AUTH_ERROR_CODES.NETWORK_ERROR) {
      if (error.details?.retryCount) {
        return `Connection issue (attempt ${error.details.retryCount}). Please check your internet connection.`;
      }
      return 'Unable to connect. Please check your internet connection and try again.';
    }

    // Return the original message or a generic fallback
    return error.message || 'An unexpected error occurred. Please try again.';
  }

  /**
   * Check if an error is retryable
   */
  isRetryableError(error: AuthError): boolean {
    return this.config.retryOptions.retryableErrors.some(
      retryableCode => error.code.includes(retryableCode)
    );
  }

  /**
   * Get retry information for an error
   */
  getRetryInfo(error: AuthError): { canRetry: boolean; nextDelay?: number; attemptsLeft?: number } {
    if (!this.isRetryableError(error)) {
      return { canRetry: false };
    }

    const retryCount = error.details?.retryCount || 0;
    const attemptsLeft = this.config.retryOptions.maxAttempts - retryCount;
    
    if (attemptsLeft <= 0) {
      return { canRetry: false };
    }

    const nextDelay = this.config.retryOptions.delay * 
      Math.pow(this.config.retryOptions.backoffMultiplier, retryCount);

    return {
      canRetry: true,
      nextDelay,
      attemptsLeft
    };
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.sessionWarningTimer) {
      clearTimeout(this.sessionWarningTimer);
      this.sessionWarningTimer = null;
    }
    this.notificationCallbacks.clear();
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a network error with retry information
 */
export function createNetworkError(
  message: string, 
  retryCount: number = 0, 
  originalError?: Error
): NetworkError {
  const error = new Error(message) as NetworkError;
  error.name = 'NetworkError';
  error.code = AUTH_ERROR_CODES.NETWORK_ERROR;
  error.retryable = true;
  error.retryCount = retryCount;
  error.originalError = originalError;
  return error;
}

/**
 * Create a timeout error
 */
export function createTimeoutError(timeoutMs: number): AuthError {
  return {
    code: 'TIMEOUT',
    message: `Request timed out after ${timeoutMs}ms. Please try again.`,
    details: { timeout: timeoutMs }
  };
}

/**
 * Create a session expiration error
 */
export function createSessionExpiredError(): AuthError {
  return {
    code: AUTH_ERROR_CODES.SESSION_EXPIRED,
    message: AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.SESSION_EXPIRED],
    details: { timestamp: new Date().toISOString() }
  };
}

// ============================================================================
// Default Error Handler Instance
// ============================================================================

export const authErrorHandler = new AuthErrorHandler();
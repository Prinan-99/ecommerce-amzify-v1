/**
 * Cookie Service Implementation
 * 
 * Provides secure cookie management for the unified authentication system.
 * Handles HTTP-only cookies for token storage with proper security options.
 */

import { CookieService, CookieOptions } from './types';
import { DEFAULT_COOKIE_OPTIONS } from './constants';

/**
 * Implementation of secure cookie management service
 * Uses document.cookie API with security-first configuration
 */
export class CookieServiceImpl implements CookieService {
  /**
   * Set a secure cookie with the specified options
   */
  setSecureCookie(name: string, value: string, options: Partial<CookieOptions> = {}): void {
    // Merge with default options
    const cookieOptions: CookieOptions = {
      ...DEFAULT_COOKIE_OPTIONS,
      ...options
    };

    // Build cookie string
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    // Add options to cookie string
    if (cookieOptions.maxAge) {
      cookieString += `; Max-Age=${cookieOptions.maxAge}`;
    }

    if (cookieOptions.path) {
      cookieString += `; Path=${cookieOptions.path}`;
    }

    if (cookieOptions.secure) {
      cookieString += '; Secure';
    }

    if (cookieOptions.httpOnly) {
      cookieString += '; HttpOnly';
    }

    if (cookieOptions.sameSite) {
      cookieString += `; SameSite=${cookieOptions.sameSite}`;
    }

    // Set the cookie
    if (typeof document !== 'undefined') {
      document.cookie = cookieString;
    }
  }

  /**
   * Get a secure cookie value by name
   */
  getSecureCookie(name: string): string | null {
    if (typeof document === 'undefined') {
      return null;
    }

    const encodedName = encodeURIComponent(name);
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      const trimmedCookie = cookie.trim();
      if (trimmedCookie.startsWith(`${encodedName}=`)) {
        const value = trimmedCookie.substring(encodedName.length + 1);
        return decodeURIComponent(value);
      }
    }

    return null;
  }

  /**
   * Remove a secure cookie by setting it to expire immediately
   */
  removeSecureCookie(name: string): void {
    this.setSecureCookie(name, '', {
      maxAge: 0,
      path: '/'
    });
  }

  /**
   * Check if cookies are available (browser environment)
   */
  private isCookieAvailable(): boolean {
    return typeof document !== 'undefined' && typeof document.cookie !== 'undefined';
  }

  /**
   * Clear all authentication-related cookies
   */
  clearAllAuthCookies(cookieNames: string[]): void {
    cookieNames.forEach(name => {
      this.removeSecureCookie(name);
    });
  }
}

// Export singleton instance
export const cookieService = new CookieServiceImpl();
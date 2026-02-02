/**
 * Session Manager Implementation
 * 
 * Manages user sessions with secure cookie storage, token validation, and automatic refresh.
 * Implements the SessionManager interface with comprehensive session lifecycle management.
 */

import { SessionManager, SessionData, User, TokenPair, TokenValidationResult } from './types';
import { COOKIE_NAMES, SESSION_CONFIG, AUTH_ERROR_CODES } from './constants';
import { cookieService } from './CookieService';
import { tokenService } from './TokenService';
import { isTokenNearExpiry } from './utils';

/**
 * Implementation of session management with secure storage and validation
 */
export class SessionManagerImpl implements SessionManager {
  private sessionData: SessionData | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  /**
   * Create a new user session with secure token storage
   */
  createSession(user: User, tokens: TokenPair): void {
    try {
      // Calculate expiration time (15 minutes for access token)
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      // Create session data
      this.sessionData = {
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt
      };

      // Store tokens in secure HTTP-only cookies
      cookieService.setSecureCookie(COOKIE_NAMES.ACCESS_TOKEN, tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: '/'
      });

      cookieService.setSecureCookie(COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/'
      });

      // Store user data (non-sensitive) for quick access
      cookieService.setSecureCookie(COOKIE_NAMES.USER_DATA, JSON.stringify({
        id: user.id,
        role: user.role,
        lastLoginAt: user.lastLoginAt
      }), {
        httpOnly: false, // Allow client-side access for user data
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/'
      });

      // Start automatic session validation and refresh
      this.startSessionMonitoring();

    } catch (error) {
      console.error('Failed to create session:', error);
      throw new Error('Session creation failed');
    }
  }

  /**
   * Validate the current session
   */
  async validateSession(): Promise<boolean> {
    try {
      // Check if session data exists
      if (!this.sessionData) {
        await this.restoreSessionFromCookies();
      }

      if (!this.sessionData) {
        return false;
      }

      // Validate access token
      const validationResult = await tokenService.validateAccessToken(this.sessionData.accessToken);
      
      if (validationResult.valid) {
        return true;
      }

      // If token is expired, try to refresh
      if (validationResult.expired) {
        return await this.refreshSession();
      }

      // Token is invalid, clear session
      this.clearSession();
      return false;

    } catch (error) {
      console.error('Session validation failed:', error);
      this.clearSession();
      return false;
    }
  }

  /**
   * Refresh the current session with new tokens
   */
  async refreshSession(): Promise<boolean> {
    try {
      if (!this.sessionData?.refreshToken) {
        return false;
      }

      // Attempt to refresh the access token
      const newAccessToken = await tokenService.refreshAccessToken(this.sessionData.refreshToken);
      
      // Update session with new access token
      this.sessionData.accessToken = newAccessToken;
      this.sessionData.expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      // Update access token cookie
      cookieService.setSecureCookie(COOKIE_NAMES.ACCESS_TOKEN, newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: '/'
      });

      return true;

    } catch (error) {
      console.error('Session refresh failed:', error);
      this.clearSession();
      return false;
    }
  }

  /**
   * Clear the current session and remove all stored data
   */
  clearSession(): void {
    try {
      // Clear in-memory session data
      this.sessionData = null;

      // Stop session monitoring
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
        this.refreshTimer = null;
      }

      // Remove all authentication cookies
      cookieService.clearAllAuthCookies([
        COOKIE_NAMES.ACCESS_TOKEN,
        COOKIE_NAMES.REFRESH_TOKEN,
        COOKIE_NAMES.USER_DATA
      ]);

      // Revoke tokens on the server side
      if (this.sessionData?.user?.id) {
        tokenService.revokeTokens(this.sessionData.user.id).catch(error => {
          console.error('Failed to revoke tokens:', error);
        });
      }

    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  /**
   * Get current session data
   */
  getSessionData(): SessionData | null {
    return this.sessionData;
  }

  /**
   * Restore session from stored cookies (for page refresh scenarios)
   */
  private async restoreSessionFromCookies(): Promise<void> {
    try {
      const accessToken = cookieService.getSecureCookie(COOKIE_NAMES.ACCESS_TOKEN);
      const refreshToken = cookieService.getSecureCookie(COOKIE_NAMES.REFRESH_TOKEN);
      const userDataStr = cookieService.getSecureCookie(COOKIE_NAMES.USER_DATA);

      if (!accessToken || !refreshToken || !userDataStr) {
        return;
      }

      // Validate access token to get full user data
      const validationResult = await tokenService.validateAccessToken(accessToken);
      
      if (validationResult.valid && validationResult.user) {
        // Restore session data
        this.sessionData = {
          user: validationResult.user,
          accessToken,
          refreshToken,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000) // Assume 15 minutes remaining
        };

        // Restart session monitoring
        this.startSessionMonitoring();
      }

    } catch (error) {
      console.error('Failed to restore session from cookies:', error);
      this.clearSession();
    }
  }

  /**
   * Start automatic session monitoring and refresh
   */
  private startSessionMonitoring(): void {
    // Clear existing timer
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    // Set up periodic session validation
    this.refreshTimer = setInterval(async () => {
      if (!this.sessionData) {
        return;
      }

      try {
        // Check if token needs refresh (5 minutes before expiry)
        const timeToExpiry = this.sessionData.expiresAt.getTime() - Date.now();
        
        if (timeToExpiry <= SESSION_CONFIG.REFRESH_THRESHOLD) {
          await this.refreshSession();
        }

      } catch (error) {
        console.error('Session monitoring error:', error);
      }

    }, SESSION_CONFIG.CHECK_INTERVAL);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.sessionData !== null && this.sessionData.expiresAt > new Date();
  }

  /**
   * Get current user from session
   */
  getCurrentUser(): User | null {
    return this.sessionData?.user || null;
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.sessionData?.accessToken || null;
  }

  /**
   * Update user data in session (for profile updates)
   */
  updateUserData(updatedUser: User): void {
    if (this.sessionData) {
      this.sessionData.user = updatedUser;
      
      // Update user data cookie
      cookieService.setSecureCookie(COOKIE_NAMES.USER_DATA, JSON.stringify({
        id: updatedUser.id,
        role: updatedUser.role,
        lastLoginAt: updatedUser.lastLoginAt
      }), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
      });
    }
  }
}

// Export singleton instance
export const sessionManager = new SessionManagerImpl();

// Export class for type compatibility
export { SessionManagerImpl as SessionManager };
/**
 * JWT Token Service Implementation
 * 
 * This service handles JWT token generation, validation, and refresh operations
 * for the unified authentication system.
 */

import jwt from 'jsonwebtoken';
import { 
  TokenService, 
  TokenPair, 
  TokenValidationResult, 
  User, 
  JWTPayload,
  UserRole 
} from './types';
import { 
  TOKEN_CONFIG, 
  AUTH_ERROR_CODES, 
  AUTH_ERROR_MESSAGES,
  ROLE_PERMISSIONS 
} from './constants';
import { createAuthError, getRolePermissions } from './utils';

/**
 * JWT Token Service implementation
 * Handles secure token generation, validation, and refresh operations
 */
export class JWTTokenService implements TokenService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly issuer: string;
  private readonly audience: string;

  constructor(
    accessTokenSecret?: string,
    refreshTokenSecret?: string,
    issuer?: string,
    audience?: string
  ) {
    // Use provided secrets or fallback to environment variables or defaults
    this.accessTokenSecret = accessTokenSecret || 
      process.env.JWT_ACCESS_SECRET || 
      'default-access-secret-change-in-production';
    
    this.refreshTokenSecret = refreshTokenSecret || 
      process.env.JWT_REFRESH_SECRET || 
      'default-refresh-secret-change-in-production';
    
    this.issuer = issuer || TOKEN_CONFIG.ISSUER;
    this.audience = audience || TOKEN_CONFIG.AUDIENCE;

    // Warn if using default secrets in production
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
        console.warn('WARNING: Using default JWT secrets in production. Please set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET environment variables.');
      }
    }
  }

  /**
   * Generate access and refresh token pair for a user
   */
  async generateTokens(user: User): Promise<TokenPair> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const permissions = ROLE_PERMISSIONS[user.role] || [];

      // Create access token payload
      const accessPayload: JWTPayload = {
        sub: user.id,
        role: user.role,
        iat: now,
        exp: now + this.parseExpiryToSeconds(TOKEN_CONFIG.ACCESS_TOKEN_EXPIRY),
        permissions
      };

      // Create refresh token payload (simpler, longer-lived)
      const refreshPayload = {
        sub: user.id,
        role: user.role,
        iat: now,
        exp: now + this.parseExpiryToSeconds(TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY),
        type: 'refresh'
      };

      // Sign tokens
      const accessToken = jwt.sign(accessPayload, this.accessTokenSecret, {
        issuer: this.issuer,
        audience: this.audience,
        algorithm: 'HS256'
      });

      const refreshToken = jwt.sign(refreshPayload, this.refreshTokenSecret, {
        issuer: this.issuer,
        audience: this.audience,
        algorithm: 'HS256'
      });

      return {
        accessToken,
        refreshToken
      };
    } catch (error) {
      console.error('Error generating tokens:', error);
      throw createAuthError(
        AUTH_ERROR_CODES.UNKNOWN_ERROR,
        'Failed to generate authentication tokens',
        error
      );
    }
  }

  /**
   * Validate an access token and return user information
   */
  async validateAccessToken(token: string): Promise<TokenValidationResult> {
    try {
      // Verify and decode the token
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: this.issuer,
        audience: this.audience,
        algorithms: ['HS256']
      }) as JWTPayload;

      // Check if token is expired (additional check beyond jwt.verify)
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        return {
          valid: false,
          expired: true,
          error: AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.TOKEN_EXPIRED]
        };
      }

      // Reconstruct user object from token payload
      const user = await this.reconstructUserFromPayload(decoded);

      return {
        valid: true,
        user,
        expired: false
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return {
          valid: false,
          expired: true,
          error: AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.TOKEN_EXPIRED]
        };
      } else if (error instanceof jwt.JsonWebTokenError) {
        return {
          valid: false,
          expired: false,
          error: AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.TOKEN_INVALID]
        };
      } else {
        console.error('Error validating access token:', error);
        return {
          valid: false,
          expired: false,
          error: AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.UNKNOWN_ERROR]
        };
      }
    }
  }

  /**
   * Refresh an access token using a valid refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      // Verify the refresh token
      const decoded = jwt.verify(refreshToken, this.refreshTokenSecret, {
        issuer: this.issuer,
        audience: this.audience,
        algorithms: ['HS256']
      }) as any;

      // Ensure this is actually a refresh token
      if (decoded.type !== 'refresh') {
        throw createAuthError(
          AUTH_ERROR_CODES.TOKEN_INVALID,
          'Invalid refresh token type'
        );
      }

      // Reconstruct user from refresh token
      const user = await this.reconstructUserFromPayload(decoded);

      // Generate new access token with fresh timestamp
      const now = Math.floor(Date.now() / 1000);
      const accessTokenPayload: JWTPayload = {
        sub: user.id,
        role: user.role,
        iat: now,
        exp: now + this.parseExpiryToSeconds(TOKEN_CONFIG.ACCESS_TOKEN_EXPIRY),
        permissions: getRolePermissions(user.role)
      };

      const accessToken = jwt.sign(accessTokenPayload, this.accessTokenSecret, {
        issuer: this.issuer,
        audience: this.audience,
        algorithm: 'HS256'
      });

      return accessToken;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw createAuthError(
          AUTH_ERROR_CODES.TOKEN_EXPIRED,
          AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.TOKEN_EXPIRED]
        );
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw createAuthError(
          AUTH_ERROR_CODES.TOKEN_INVALID,
          AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.TOKEN_INVALID]
        );
      } else {
        console.error('Error refreshing access token:', error);
        throw createAuthError(
          AUTH_ERROR_CODES.UNKNOWN_ERROR,
          'Failed to refresh access token',
          error
        );
      }
    }
  }

  /**
   * Revoke tokens for a specific user (placeholder implementation)
   * In a production system, this would typically involve a token blacklist
   */
  async revokeTokens(userId: string): Promise<void> {
    try {
      // In a real implementation, you would:
      // 1. Add tokens to a blacklist/revocation list
      // 2. Store revoked tokens in a database or cache
      // 3. Check against this list during token validation
      
      console.log(`Tokens revoked for user: ${userId}`);
      
      // For now, we'll just log the revocation
      // The actual revocation would be handled by the session manager
      // or a separate token blacklist service
    } catch (error) {
      console.error('Error revoking tokens:', error);
      throw createAuthError(
        AUTH_ERROR_CODES.UNKNOWN_ERROR,
        'Failed to revoke tokens',
        error
      );
    }
  }

  /**
   * Parse expiry string (like '15m', '7d') to seconds
   */
  private parseExpiryToSeconds(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1));

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      case 'w': return value * 7 * 24 * 60 * 60;
      default:
        throw new Error(`Invalid expiry format: ${expiry}`);
    }
  }

  /**
   * Reconstruct user object from JWT payload
   * Note: In a real application, you might want to fetch fresh user data from database
   */
  private async reconstructUserFromPayload(payload: JWTPayload): Promise<User> {
    // This is a simplified reconstruction based on the token payload
    // In a production system, you might want to fetch the user from a database
    // to ensure the user still exists and is active
    
    const baseUser = {
      id: payload.sub,
      role: payload.role,
      createdAt: new Date(), // This would come from database in real implementation
      lastLoginAt: new Date(),
      isActive: true
    };

    // Create role-specific user object
    switch (payload.role) {
      case UserRole.CUSTOMER:
        return {
          ...baseUser,
          email: `customer-${payload.sub}@example.com`, // This would come from database
          firstName: 'Customer',
          lastName: 'User',
          role: UserRole.CUSTOMER
        };
      
      case UserRole.SELLER:
        return {
          ...baseUser,
          sellerName: `seller-${payload.sub}`,
          companyName: 'Example Company',
          email: `seller-${payload.sub}@example.com`,
          role: UserRole.SELLER
        };
      
      case UserRole.SUPER_ADMIN:
        return {
          ...baseUser,
          adminUsername: `admin-${payload.sub}`,
          role: UserRole.SUPER_ADMIN
        };
      
      default:
        throw createAuthError(
          AUTH_ERROR_CODES.TOKEN_INVALID,
          `Invalid user role in token: ${payload.role}`
        );
    }
  }

  /**
   * Decode a token without verification (for debugging/inspection)
   * WARNING: This should only be used for debugging purposes
   */
  decodeTokenUnsafe(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Get token expiration time
   */
  getTokenExpiration(token: string): Date | null {
    try {
      const decoded = this.decodeTokenUnsafe(token);
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      console.error('Error getting token expiration:', error);
      return null;
    }
  }

  /**
   * Check if a token is near expiry
   */
  isTokenNearExpiry(token: string, thresholdSeconds: number = 300): boolean {
    try {
      const decoded = this.decodeTokenUnsafe(token);
      if (!decoded || !decoded.exp) {
        return true; // Treat invalid tokens as expired
      }

      const now = Math.floor(Date.now() / 1000);
      return decoded.exp - now < thresholdSeconds;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true; // Treat errors as expired for safety
    }
  }
}

/**
 * Default token service instance
 * Can be used directly or extended for custom implementations
 */
export const tokenService = new JWTTokenService();
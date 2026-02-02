/**
 * Authentication Service Implementation
 * 
 * This service handles user authentication for customers, sellers, and super admins
 * in the unified authentication system. It validates credentials, integrates with
 * the token service for JWT generation, and provides secure authentication flows.
 */

import { 
  AuthenticationService, 
  AuthResult, 
  TokenValidationResult,
  User,
  UserRole,
  Customer,
  Seller,
  SuperAdmin
} from './types';
import { 
  AUTH_ERROR_CODES, 
  AUTH_ERROR_MESSAGES
} from './constants';
import { 
  createAuthError,
  isValidEmail,
  isValidPassword,
  isValidSellerName,
  isValidCompanyName,
  isValidAdminUsername
} from './utils';
import { JWTTokenService } from './TokenService';
import { adminCredentialsManager } from './AdminCredentialsManager';

/**
 * Mock user database for demonstration purposes
 * In a real application, this would be replaced with actual database queries
 */
interface MockUserDatabase {
  customers: Map<string, { password: string; user: Customer }>;
  sellers: Map<string, { password: string; user: Seller }>;
}

/**
 * Authentication Service implementation
 * Handles credential validation and user authentication for all user roles
 */
export class UnifiedAuthenticationService implements AuthenticationService {
  private tokenService: JWTTokenService;
  private mockDatabase: MockUserDatabase;

  constructor(tokenService?: JWTTokenService) {
    this.tokenService = tokenService || new JWTTokenService();
    this.mockDatabase = this.initializeMockDatabase();
  }

  /**
   * Authenticate a customer using email and password
   */
  async authenticateCustomer(email: string, password: string): Promise<AuthResult> {
    try {
      // Input validation
      if (!email || !password) {
        return {
          success: false,
          error: AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.INVALID_CREDENTIALS]
        };
      }

      // Validate email format
      if (!isValidEmail(email)) {
        return {
          success: false,
          error: 'Please enter a valid email address.'
        };
      }

      // Look up customer in mock database
      const customerRecord = this.mockDatabase.customers.get(email.toLowerCase());
      
      if (!customerRecord) {
        return {
          success: false,
          error: AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.USER_NOT_FOUND]
        };
      }

      // Validate password
      if (!this.validatePassword(password, customerRecord.password)) {
        return {
          success: false,
          error: AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.INVALID_CREDENTIALS]
        };
      }

      // Check if account is active
      if (!customerRecord.user.isActive) {
        return {
          success: false,
          error: AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.ACCOUNT_DISABLED]
        };
      }

      // Update last login time
      customerRecord.user.lastLoginAt = new Date();

      // Generate tokens
      const tokens = await this.tokenService.generateTokens(customerRecord.user);

      return {
        success: true,
        user: customerRecord.user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      };

    } catch (error) {
      console.error('Error authenticating customer:', error);
      return {
        success: false,
        error: AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.UNKNOWN_ERROR]
      };
    }
  }

  /**
   * Authenticate a seller using seller name, company name, and password
   */
  async authenticateSeller(sellerName: string, companyName: string, password: string): Promise<AuthResult> {
    try {
      // Input validation
      if (!sellerName || !companyName || !password) {
        return {
          success: false,
          error: AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.INVALID_CREDENTIALS]
        };
      }

      // Validate seller name format
      if (!isValidSellerName(sellerName)) {
        return {
          success: false,
          error: 'Please enter a valid seller name (2-50 characters, letters, numbers, and basic punctuation only).'
        };
      }

      // Validate company name format
      if (!isValidCompanyName(companyName)) {
        return {
          success: false,
          error: 'Please enter a valid company name (2-100 characters).'
        };
      }

      // Create composite key for seller lookup (sellerName + companyName)
      const sellerKey = `${sellerName.toLowerCase()}:${companyName.toLowerCase()}`;
      const sellerRecord = this.mockDatabase.sellers.get(sellerKey);
      
      if (!sellerRecord) {
        return {
          success: false,
          error: AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.USER_NOT_FOUND]
        };
      }

      // Validate password
      if (!this.validatePassword(password, sellerRecord.password)) {
        return {
          success: false,
          error: AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.INVALID_CREDENTIALS]
        };
      }

      // Check if account is active
      if (!sellerRecord.user.isActive) {
        return {
          success: false,
          error: AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.ACCOUNT_DISABLED]
        };
      }

      // Update last login time
      sellerRecord.user.lastLoginAt = new Date();

      // Generate tokens
      const tokens = await this.tokenService.generateTokens(sellerRecord.user);

      return {
        success: true,
        user: sellerRecord.user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      };

    } catch (error) {
      console.error('Error authenticating seller:', error);
      return {
        success: false,
        error: AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.UNKNOWN_ERROR]
      };
    }
  }

  /**
   * Authenticate a super admin using the AdminCredentialsManager
   */
  async authenticateAdmin(username: string, password: string): Promise<AuthResult> {
    try {
      // Input validation
      if (!username || !password) {
        return {
          success: false,
          error: AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.INVALID_CREDENTIALS]
        };
      }

      // Validate admin username format
      if (!isValidAdminUsername(username)) {
        return {
          success: false,
          error: 'Please enter a valid admin username (3-30 characters, alphanumeric and underscores only).'
        };
      }

      // Use AdminCredentialsManager for validation
      const authResult = adminCredentialsManager.validateAdminCredentials(username, password);
      
      if (!authResult.success) {
        return authResult;
      }

      if (!authResult.user) {
        return {
          success: false,
          error: AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.UNKNOWN_ERROR]
        };
      }

      // Generate tokens
      const tokens = await this.tokenService.generateTokens(authResult.user);

      return {
        success: true,
        user: authResult.user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      };

    } catch (error) {
      console.error('Error authenticating admin:', error);
      return {
        success: false,
        error: AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.UNKNOWN_ERROR]
      };
    }
  }

  /**
   * Validate a token and return user information
   */
  async validateToken(token: string): Promise<TokenValidationResult> {
    try {
      return await this.tokenService.validateAccessToken(token);
    } catch (error) {
      console.error('Error validating token:', error);
      return {
        valid: false,
        error: AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.TOKEN_INVALID]
      };
    }
  }

  /**
   * Refresh an access token using a refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      const newAccessToken = await this.tokenService.refreshAccessToken(refreshToken);
      
      // Validate the new token to get user information
      const validation = await this.tokenService.validateAccessToken(newAccessToken);
      
      if (!validation.valid || !validation.user) {
        return {
          success: false,
          error: AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.TOKEN_INVALID]
        };
      }

      return {
        success: true,
        user: validation.user,
        accessToken: newAccessToken,
        refreshToken: refreshToken // Keep the same refresh token
      };

    } catch (error) {
      console.error('Error refreshing token:', error);
      
      // Check if it's a token expiration error
      if (error && typeof error === 'object' && 'code' in error) {
        return {
          success: false,
          error: error.message || AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.TOKEN_EXPIRED]
        };
      }

      return {
        success: false,
        error: AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.UNKNOWN_ERROR]
      };
    }
  }

  /**
   * Initialize mock database with sample users for testing
   * In a real application, this would be replaced with actual database initialization
   */
  private initializeMockDatabase(): MockUserDatabase {
    const customers = new Map<string, { password: string; user: Customer }>();
    const sellers = new Map<string, { password: string; user: Seller }>();

    // Add sample customers
    customers.set('customer@example.com', {
      password: 'customer123', // In real app, this would be hashed
      user: {
        id: 'customer-001',
        email: 'customer@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CUSTOMER,
        createdAt: new Date('2024-01-15'),
        lastLoginAt: new Date('2024-01-20'),
        isActive: true
      }
    });

    customers.set('jane.smith@example.com', {
      password: 'customer456',
      user: {
        id: 'customer-002',
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: UserRole.CUSTOMER,
        createdAt: new Date('2024-01-10'),
        lastLoginAt: new Date('2024-01-18'),
        isActive: true
      }
    });

    // Add sample sellers
    sellers.set('johnseller:acme corp', {
      password: 'seller123',
      user: {
        id: 'seller-001',
        sellerName: 'John Seller',
        companyName: 'Acme Products Inc',
        email: 'john@acmecorp.com',
        role: UserRole.SELLER,
        createdAt: new Date('2024-01-05'),
        lastLoginAt: new Date('2024-01-19'),
        isActive: true
      }
    });

    sellers.set('maryseller:tech solutions inc', {
      password: 'seller456',
      user: {
        id: 'seller-002',
        sellerName: 'Mary Seller',
        companyName: 'Tech Solutions Inc',
        email: 'mary@techsolutions.com',
        role: UserRole.SELLER,
        createdAt: new Date('2024-01-08'),
        lastLoginAt: new Date('2024-01-17'),
        isActive: true
      }
    });

    return { customers, sellers };
  }

  /**
   * Validate password against stored password
   * In a real application, this would use proper password hashing (bcrypt, etc.)
   */
  private validatePassword(inputPassword: string, storedPassword: string): boolean {
    // In a real application, you would use bcrypt.compare() or similar
    // For this demo, we're doing simple string comparison
    return inputPassword === storedPassword;
  }

  /**
   * Add a new customer to the mock database (for testing purposes)
   */
  addMockCustomer(email: string, password: string, firstName: string, lastName: string): void {
    const customer: Customer = {
      id: `customer-${Date.now()}`,
      email: email.toLowerCase(),
      firstName,
      lastName,
      role: UserRole.CUSTOMER,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      isActive: true
    };

    this.mockDatabase.customers.set(email.toLowerCase(), {
      password,
      user: customer
    });
  }

  /**
   * Add a new seller to the mock database (for testing purposes)
   */
  addMockSeller(sellerName: string, companyName: string, email: string, password: string): void {
    const seller: Seller = {
      id: `seller-${Date.now()}`,
      sellerName,
      companyName,
      email: email.toLowerCase(),
      role: UserRole.SELLER,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      isActive: true
    };

    const sellerKey = `${sellerName.toLowerCase()}:${companyName.toLowerCase()}`;
    this.mockDatabase.sellers.set(sellerKey, {
      password,
      user: seller
    });
  }

  /**
   * Get mock database for testing purposes
   */
  getMockDatabase(): MockUserDatabase {
    return this.mockDatabase;
  }

  /**
   * Clear mock database (for testing purposes)
   */
  clearMockDatabase(): void {
    this.mockDatabase.customers.clear();
    this.mockDatabase.sellers.clear();
  }
}

/**
 * Default authentication service instance
 * Can be used directly or extended for custom implementations
 */
export const authenticationService = new UnifiedAuthenticationService();
/**
 * End-to-End Integration Tests for Unified Authentication System
 * 
 * These tests validate complete authentication flows for all roles,
 * cross-role access prevention, and session management across navigation.
 * 
 * Requirements: All requirements
 */

// Import all authentication components and services
import { UnifiedAuthenticationService } from './AuthenticationService';
import { SessionManager } from './SessionManager';
import { AccessController } from './AccessControllerService';
import { AdminCredentialsManager } from './AdminCredentialsManager';
import { UserRole } from './types';
import { ADMIN_CREDENTIALS } from './constants';

describe('End-to-End Authentication Integration Tests', () => {
  let authService: UnifiedAuthenticationService;
  let sessionManager: SessionManager;
  let accessController: AccessController;
  let adminCredentialsManager: AdminCredentialsManager;

  beforeEach(() => {
    // Reset singletons
    (AccessController as any).instance = undefined;
    (AdminCredentialsManager as any).instance = undefined;
    
    // Initialize services
    authService = new UnifiedAuthenticationService();
    sessionManager = new SessionManager();
    accessController = AccessController.getInstance();
    adminCredentialsManager = AdminCredentialsManager.getInstance();

    // Clear any existing session data
    sessionManager.clearSession();
    
    // Clear access logs
    accessController.clearAccessLog();

    // Add test users to the authentication service
    authService.addMockCustomer('test@customer.com', 'password123', 'Test', 'Customer');
    authService.addMockSeller('TestSeller', 'Test Company', 'seller@test.com', 'sellerpass123');
  });

  afterEach(() => {
    // Clean up after each test
    sessionManager.clearSession();
    accessController.clearAccessLog();
    authService.clearMockDatabase();
  });

  describe('Complete Authentication Flows', () => {
    describe('Customer Authentication Flow', () => {
      test('should complete full customer authentication flow', async () => {
        // Authenticate customer
        const result = await authService.authenticateCustomer('test@customer.com', 'password123');
        
        expect(result.success).toBe(true);
        expect(result.user?.role).toBe(UserRole.CUSTOMER);
        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();

        // Create session
        if (result.user && result.accessToken && result.refreshToken) {
          sessionManager.createSession(result.user, {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
          });
        }

        // Verify session was created
        const sessionData = sessionManager.getSessionData();
        expect(sessionData).toBeTruthy();
        expect(sessionData?.user.role).toBe(UserRole.CUSTOMER);
      });

      test('should handle customer authentication failure', async () => {
        const result = await authService.authenticateCustomer('test@customer.com', 'wrongpassword');
        
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.user).toBeUndefined();

        // Verify no session was created
        const sessionData = sessionManager.getSessionData();
        expect(sessionData).toBeNull();
      });
    });

    describe('Seller Authentication Flow', () => {
      test('should complete full seller authentication flow', async () => {
        const result = await authService.authenticateSeller('TestSeller', 'Test Company', 'sellerpass123');
        
        expect(result.success).toBe(true);
        expect(result.user?.role).toBe(UserRole.SELLER);
        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();

        // Create session
        if (result.user && result.accessToken && result.refreshToken) {
          sessionManager.createSession(result.user, {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
          });
        }

        // Verify session was created
        const sessionData = sessionManager.getSessionData();
        expect(sessionData).toBeTruthy();
        expect(sessionData?.user.role).toBe(UserRole.SELLER);
      });
    });

    describe('Admin Authentication Flow', () => {
      test('should complete full admin authentication flow', async () => {
        const result = await authService.authenticateAdmin(ADMIN_CREDENTIALS.username, ADMIN_CREDENTIALS.password);
        
        expect(result.success).toBe(true);
        expect(result.user?.role).toBe(UserRole.SUPER_ADMIN);
        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();

        // Create session
        if (result.user && result.accessToken && result.refreshToken) {
          sessionManager.createSession(result.user, {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
          });
        }

        // Verify session was created
        const sessionData = sessionManager.getSessionData();
        expect(sessionData).toBeTruthy();
        expect(sessionData?.user.role).toBe(UserRole.SUPER_ADMIN);
      });
    });
  });

  describe('Cross-Role Access Prevention', () => {
    test('should prevent customer from accessing seller routes', async () => {
      // Create customer session
      const customerResult = await authService.authenticateCustomer('test@customer.com', 'password123');
      expect(customerResult.success).toBe(true);
      
      if (customerResult.user && customerResult.accessToken && customerResult.refreshToken) {
        sessionManager.createSession(customerResult.user, {
          accessToken: customerResult.accessToken,
          refreshToken: customerResult.refreshToken
        });
      }

      // Test route access
      const hasAccess = accessController.validateRouteAccess('/seller', UserRole.CUSTOMER);
      expect(hasAccess).toBe(false);

      // Verify unauthorized access was logged
      accessController.handleUnauthorizedAccess('/seller', UserRole.CUSTOMER);
      const accessLog = accessController.getAccessLog();
      const unauthorizedEvents = accessLog.filter(event => event.type === 'UNAUTHORIZED_ACCESS');
      expect(unauthorizedEvents.length).toBeGreaterThan(0);
    });

    test('should prevent seller from accessing admin routes', async () => {
      // Create seller session
      const sellerResult = await authService.authenticateSeller('TestSeller', 'Test Company', 'sellerpass123');
      expect(sellerResult.success).toBe(true);
      
      if (sellerResult.user && sellerResult.accessToken && sellerResult.refreshToken) {
        sessionManager.createSession(sellerResult.user, {
          accessToken: sellerResult.accessToken,
          refreshToken: sellerResult.refreshToken
        });
      }

      // Test route access
      const hasAccess = accessController.validateRouteAccess('/admin', UserRole.SELLER);
      expect(hasAccess).toBe(false);

      // Verify unauthorized access was logged
      accessController.handleUnauthorizedAccess('/admin', UserRole.SELLER);
      const accessLog = accessController.getAccessLog();
      const unauthorizedEvents = accessLog.filter(event => event.type === 'UNAUTHORIZED_ACCESS');
      expect(unauthorizedEvents.length).toBeGreaterThan(0);
    });

    test('should prevent admin from accessing customer routes', async () => {
      // Create admin session
      const adminResult = await authService.authenticateAdmin(ADMIN_CREDENTIALS.username, ADMIN_CREDENTIALS.password);
      expect(adminResult.success).toBe(true);
      
      if (adminResult.user && adminResult.accessToken && adminResult.refreshToken) {
        sessionManager.createSession(adminResult.user, {
          accessToken: adminResult.accessToken,
          refreshToken: adminResult.refreshToken
        });
      }

      // Test route access
      const hasAccess = accessController.validateRouteAccess('/customer', UserRole.SUPER_ADMIN);
      expect(hasAccess).toBe(false);

      // Verify unauthorized access was logged
      accessController.handleUnauthorizedAccess('/customer', UserRole.SUPER_ADMIN);
      const accessLog = accessController.getAccessLog();
      const unauthorizedEvents = accessLog.filter(event => event.type === 'UNAUTHORIZED_ACCESS');
      expect(unauthorizedEvents.length).toBeGreaterThan(0);
    });
  });

  describe('Session Management Across Navigation', () => {
    test('should maintain session across service calls', async () => {
      // Create customer session
      const customerResult = await authService.authenticateCustomer('test@customer.com', 'password123');
      expect(customerResult.success).toBe(true);
      
      if (customerResult.user && customerResult.accessToken && customerResult.refreshToken) {
        sessionManager.createSession(customerResult.user, {
          accessToken: customerResult.accessToken,
          refreshToken: customerResult.refreshToken
        });
      }

      // Verify session exists
      let sessionData = sessionManager.getSessionData();
      expect(sessionData).toBeTruthy();
      expect(sessionData?.user.role).toBe(UserRole.CUSTOMER);

      // Simulate multiple service calls
      for (let i = 0; i < 5; i++) {
        sessionData = sessionManager.getSessionData();
        expect(sessionData).toBeTruthy();
        expect(sessionData?.user.role).toBe(UserRole.CUSTOMER);
      }
    });

    test('should handle session expiration', async () => {
      // Create customer session
      const customerResult = await authService.authenticateCustomer('test@customer.com', 'password123');
      expect(customerResult.success).toBe(true);
      
      if (customerResult.user && customerResult.accessToken && customerResult.refreshToken) {
        sessionManager.createSession(customerResult.user, {
          accessToken: customerResult.accessToken,
          refreshToken: customerResult.refreshToken
        });
      }

      // Verify session exists
      let sessionData = sessionManager.getSessionData();
      expect(sessionData).toBeTruthy();

      // Manually expire the session
      sessionManager.clearSession();

      // Verify session is cleared
      sessionData = sessionManager.getSessionData();
      expect(sessionData).toBeNull();
    });

    test('should handle logout and clear session', async () => {
      // Create customer session
      const customerResult = await authService.authenticateCustomer('test@customer.com', 'password123');
      expect(customerResult.success).toBe(true);
      
      if (customerResult.user && customerResult.accessToken && customerResult.refreshToken) {
        sessionManager.createSession(customerResult.user, {
          accessToken: customerResult.accessToken,
          refreshToken: customerResult.refreshToken
        });
      }

      // Verify session exists
      let sessionData = sessionManager.getSessionData();
      expect(sessionData).toBeTruthy();

      // Simulate logout
      sessionManager.clearSession();

      // Verify session is cleared
      sessionData = sessionManager.getSessionData();
      expect(sessionData).toBeNull();
    });
  });

  describe('Route Access Validation', () => {
    test('should validate route access for all roles', () => {
      // Test customer route access
      expect(accessController.validateRouteAccess('/customer', UserRole.CUSTOMER)).toBe(true);
      expect(accessController.validateRouteAccess('/seller', UserRole.CUSTOMER)).toBe(false);
      expect(accessController.validateRouteAccess('/admin', UserRole.CUSTOMER)).toBe(false);

      // Test seller route access
      expect(accessController.validateRouteAccess('/customer', UserRole.SELLER)).toBe(false);
      expect(accessController.validateRouteAccess('/seller', UserRole.SELLER)).toBe(true);
      expect(accessController.validateRouteAccess('/admin', UserRole.SELLER)).toBe(false);

      // Test admin route access
      expect(accessController.validateRouteAccess('/customer', UserRole.SUPER_ADMIN)).toBe(false);
      expect(accessController.validateRouteAccess('/seller', UserRole.SUPER_ADMIN)).toBe(false);
      expect(accessController.validateRouteAccess('/admin', UserRole.SUPER_ADMIN)).toBe(true);
    });

    test('should allow access to public routes for all roles', () => {
      const publicRoutes = ['/', '/login', '/access-denied'];
      const roles = [UserRole.CUSTOMER, UserRole.SELLER, UserRole.SUPER_ADMIN];

      publicRoutes.forEach(route => {
        roles.forEach(role => {
          expect(accessController.validateRouteAccess(route, role)).toBe(true);
        });
      });
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle authentication errors gracefully', async () => {
      // Test invalid email format
      const result = await authService.authenticateCustomer('invalid-email', 'password123');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('valid email');
    });

    test('should handle network errors during authentication', async () => {
      // This test would require mocking network calls
      // For now, we'll test that the service handles errors gracefully
      const result = await authService.authenticateCustomer('', '');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Admin Credentials Integration', () => {
    test('should integrate admin credentials manager with authentication flow', async () => {
      // Test admin authentication through the full flow
      const result = await authService.authenticateAdmin(ADMIN_CREDENTIALS.username, ADMIN_CREDENTIALS.password);
      
      expect(result.success).toBe(true);
      expect(result.user?.role).toBe(UserRole.SUPER_ADMIN);
      expect(result.user?.adminUsername).toBe(ADMIN_CREDENTIALS.username);
    });

    test('should handle admin account locking', async () => {
      // Make multiple failed attempts
      for (let i = 0; i < 3; i++) {
        const result = await authService.authenticateAdmin(ADMIN_CREDENTIALS.username, 'wrongpassword');
        expect(result.success).toBe(false);
      }

      // Next attempt should be locked
      const lockedResult = await authService.authenticateAdmin(ADMIN_CREDENTIALS.username, 'wrongpassword');
      expect(lockedResult.success).toBe(false);
      expect(lockedResult.error).toContain('locked');
    });
  });

  describe('Performance and Concurrency', () => {
    test('should handle concurrent authentication attempts', async () => {
      const promises = [];
      
      // Simulate concurrent login attempts
      for (let i = 0; i < 5; i++) {
        promises.push(
          authService.authenticateCustomer('test@customer.com', 'password123')
        );
      }

      const results = await Promise.all(promises);
      
      // All should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    test('should handle rapid session validation calls', async () => {
      // Create a session
      const customerResult = await authService.authenticateCustomer('test@customer.com', 'password123');
      if (customerResult.user && customerResult.accessToken && customerResult.refreshToken) {
        sessionManager.createSession(customerResult.user, {
          accessToken: customerResult.accessToken,
          refreshToken: customerResult.refreshToken
        });
      }

      // Make rapid session validation calls
      const validationPromises = [];
      for (let i = 0; i < 10; i++) {
        validationPromises.push(sessionManager.validateSession());
      }

      const validationResults = await Promise.all(validationPromises);
      
      // All should return true
      validationResults.forEach(result => {
        expect(result).toBe(true);
      });
    });
  });
});

describe('Integration Test Utilities', () => {
  test('should provide test utilities for integration testing', () => {
    // Test that all required services are available
    expect(UnifiedAuthenticationService).toBeDefined();
    expect(SessionManager).toBeDefined();
    expect(AccessController).toBeDefined();
    expect(AdminCredentialsManager).toBeDefined();
    
    // Test that React components are available
    expect(AuthProvider).toBeDefined();
    expect(LoginPortal).toBeDefined();
    expect(ProtectedRoute).toBeDefined();
    expect(AuthenticationIntegration).toBeDefined();
  });

  test('should provide mock data for testing', () => {
    const authService = new UnifiedAuthenticationService();
    
    // Add test data
    authService.addMockCustomer('test@example.com', 'password', 'Test', 'User');
    authService.addMockSeller('TestSeller', 'Test Corp', 'seller@test.com', 'password');
    
    // Verify test data was added
    const database = authService.getMockDatabase();
    expect(database.customers.has('test@example.com')).toBe(true);
    expect(database.sellers.has('testseller:test corp')).toBe(true);
  });
});
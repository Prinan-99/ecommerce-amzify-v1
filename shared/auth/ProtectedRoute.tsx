/**
 * Protected Route Component
 * 
 * This component provides role-based route protection by wrapping child components
 * and validating user permissions before rendering. It integrates with the
 * AccessControllerService to enforce access control policies.
 */

import React from 'react';
import { UserRole, ProtectedRouteProps } from './types';
import { useAuth } from './AuthContext';
import { accessController } from './AccessControllerService';
import AccessDeniedPage from './AccessDeniedPage';

/**
 * Access Denied Component
 * 
 * Displays when a user attempts to access a route they don't have permission for.
 * Provides clear messaging and navigation options.
 */
export const AccessDenied: React.FC<{
  attemptedPath?: string;
  userRole?: UserRole | null;
  onNavigateHome?: () => void;
  onNavigateLogin?: () => void;
}> = ({ 
  attemptedPath, 
  userRole, 
  onNavigateHome, 
  onNavigateLogin 
}) => {
  const { logout } = useAuth();

  const handleGoHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else if (userRole) {
      // Navigate to role-appropriate dashboard
      const redirectPath = accessController.getRedirectPath(userRole);
      window.location.href = redirectPath;
    } else {
      window.location.href = '/';
    }
  };

  const handleGoToLogin = () => {
    if (onNavigateLogin) {
      onNavigateLogin();
    } else {
      logout();
      window.location.href = '/login';
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: '2rem',
      textAlign: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '500px',
        padding: '2rem',
        border: '1px solid #e1e5e9',
        borderRadius: '8px',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '1rem',
          color: '#dc3545'
        }}>
          🚫
        </div>
        
        <h1 style={{
          fontSize: '1.5rem',
          marginBottom: '1rem',
          color: '#212529'
        }}>
          Access Denied
        </h1>
        
        <p style={{
          marginBottom: '1.5rem',
          color: '#6c757d',
          lineHeight: '1.5'
        }}>
          You don't have permission to access this page.
          {attemptedPath && (
            <>
              <br />
              <small>Attempted to access: <code>{attemptedPath}</code></small>
            </>
          )}
          {userRole && (
            <>
              <br />
              <small>Your current role: <strong>{userRole}</strong></small>
            </>
          )}
        </p>
        
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleGoHome}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#0056b3';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#007bff';
            }}
          >
            Go to Dashboard
          </button>
          
          <button
            onClick={handleGoToLogin}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#545b62';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#6c757d';
            }}
          >
            Login as Different User
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Loading Component
 * 
 * Displays while authentication state is being determined.
 */
export const AuthLoading: React.FC = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  }}>
    <div style={{
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #007bff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 1rem'
      }} />
      <p style={{ color: '#6c757d' }}>Loading...</p>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  </div>
);

/**
 * Protected Route Component
 * 
 * Wraps child components with role-based access control.
 * Validates user permissions and renders appropriate content based on access level.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps & {
  path?: string;
  redirectTo?: string;
  onAccessDenied?: (path: string, userRole: UserRole | null) => void;
}> = ({ 
  children, 
  allowedRoles, 
  fallback: FallbackComponent = AccessDeniedPage,
  path,
  redirectTo,
  onAccessDenied
}) => {
  const { user, role, isAuthenticated, isLoading, isInitialized } = useAuth();

  // Show loading while authentication state is being determined
  if (isLoading || !isInitialized) {
    return <AuthLoading />;
  }

  // If user is not authenticated, redirect to login
  if (!isAuthenticated || !user || !role) {
    if (redirectTo) {
      window.location.href = redirectTo;
      return <AuthLoading />;
    }
    
    // Default redirect to login
    window.location.href = '/login';
    return <AuthLoading />;
  }

  // Check if user's role is in the allowed roles
  const hasAccess = allowedRoles.includes(role);

  // If path is provided, also validate route access through AccessController
  if (path && hasAccess) {
    const routeAccess = accessController.validateRouteAccess(path, role);
    if (!routeAccess) {
      // Log the unauthorized access attempt with additional context
      accessController.handleUnauthorizedAccess(path, role, {
        allowedRoles,
        timestamp: new Date().toISOString(),
        component: 'ProtectedRoute'
      });
      
      // Call custom access denied handler if provided
      if (onAccessDenied) {
        onAccessDenied(path, role);
      }

      // Render the new AccessDeniedPage component
      return (
        <AccessDeniedPage 
          attemptedPath={path}
          requiredRole={allowedRoles[0]} // Show the first allowed role as example
        />
      );
    }
  }

  // If user doesn't have access, show access denied
  if (!hasAccess) {
    // Log the unauthorized access attempt with additional context
    if (path) {
      accessController.handleUnauthorizedAccess(path, role, {
        allowedRoles,
        timestamp: new Date().toISOString(),
        component: 'ProtectedRoute'
      });
    }
    
    // Call custom access denied handler if provided
    if (onAccessDenied) {
      onAccessDenied(path || 'unknown', role);
    }

    // Render the new AccessDeniedPage component
    return (
      <AccessDeniedPage 
        attemptedPath={path}
        requiredRole={allowedRoles[0]} // Show the first allowed role as example
      />
    );
  }

  // User has access, render children
  return <>{children}</>;
};

/**
 * Higher-order component for protecting routes
 * 
 * @param allowedRoles - Array of roles that can access the wrapped component
 * @param options - Additional options for route protection
 * @returns A function that wraps a component with protection
 */
export const withRoleProtection = (
  allowedRoles: UserRole[],
  options?: {
    fallback?: React.ComponentType<any>;
    redirectTo?: string;
    onAccessDenied?: (path: string, userRole: UserRole | null) => void;
  }
) => {
  return <P extends object>(Component: React.ComponentType<P>) => {
    const ProtectedComponent: React.FC<P> = (props) => (
      <ProtectedRoute 
        allowedRoles={allowedRoles}
        fallback={options?.fallback || AccessDeniedPage}
        redirectTo={options?.redirectTo}
        onAccessDenied={options?.onAccessDenied}
      >
        <Component {...props} />
      </ProtectedRoute>
    );

    // Set display name for debugging
    ProtectedComponent.displayName = `withRoleProtection(${Component.displayName || Component.name})`;

    return ProtectedComponent;
  };
};

/**
 * Utility hook for checking route access
 * 
 * @param path - The path to check
 * @param requiredRoles - The roles required for access
 * @returns Object with access information
 */
export const useRouteAccess = (path: string, requiredRoles: UserRole[]) => {
  const { user, role, isAuthenticated } = useAuth();

  const hasAccess = React.useMemo(() => {
    if (!isAuthenticated || !role) return false;
    
    const hasRole = requiredRoles.includes(role);
    const hasRouteAccess = accessController.validateRouteAccess(path, role);
    
    return hasRole && hasRouteAccess;
  }, [isAuthenticated, role, path, requiredRoles]);

  const redirectPath = React.useMemo(() => {
    if (!role) return '/login';
    return accessController.getRedirectPath(role);
  }, [role]);

  return {
    hasAccess,
    redirectPath,
    userRole: role,
    isAuthenticated
  };
};

/**
 * Component for role-specific content rendering
 * 
 * Renders different content based on user role without full route protection.
 * Useful for conditional UI elements within a page.
 */
export const RoleBasedContent: React.FC<{
  roles: Partial<Record<UserRole, React.ReactNode>>;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}> = ({ roles, fallback, requireAuth = true }) => {
  const { role, isAuthenticated } = useAuth();

  if (requireAuth && !isAuthenticated) {
    return <>{fallback || null}</>;
  }

  if (!role || !roles[role]) {
    return <>{fallback || null}</>;
  }

  return <>{roles[role]}</>;
};
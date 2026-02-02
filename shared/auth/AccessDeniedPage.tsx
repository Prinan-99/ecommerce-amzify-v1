/**
 * Access Denied Page Component
 * 
 * This component provides a user-friendly access denied page with clear messaging,
 * navigation options, and logging for unauthorized access attempts.
 * 
 * Requirements: 10.3, 7.3
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks';
import { UserRole } from './types';
import { getRoleDisplayName, getDefaultRedirectPath } from './utils';

interface AccessDeniedPageProps {
  attemptedPath?: string;
  requiredRole?: UserRole;
  customMessage?: string;
}

const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({
  attemptedPath,
  requiredRole,
  customMessage
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, isAuthenticated, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get attempted path from props or location state
  const actualAttemptedPath = attemptedPath || location.state?.attemptedPath || location.pathname;
  const actualRequiredRole = requiredRole || location.state?.requiredRole;

  useEffect(() => {
    // Log unauthorized access attempt
    logUnauthorizedAccess(actualAttemptedPath, user?.role, actualRequiredRole);
  }, [actualAttemptedPath, user?.role, actualRequiredRole]);

  /**
   * Log unauthorized access attempt for security monitoring
   */
  const logUnauthorizedAccess = (
    attemptedPath: string,
    userRole?: UserRole,
    requiredRole?: UserRole
  ) => {
    const logData = {
      type: 'UNAUTHORIZED_ACCESS',
      timestamp: new Date().toISOString(),
      attemptedPath,
      userRole: userRole || 'UNAUTHENTICATED',
      requiredRole,
      userId: user?.id,
      userAgent: navigator.userAgent,
      referrer: document.referrer
    };

    // In production, this would send to a security monitoring service
    console.warn('Unauthorized access attempt:', logData);

    // Could also send to analytics or security service
    // securityService.logUnauthorizedAccess(logData);
  };

  /**
   * Handle navigation to user's appropriate dashboard
   */
  const handleGoToDashboard = () => {
    if (isAuthenticated && role) {
      const dashboardPath = getDefaultRedirectPath(role);
      navigate(dashboardPath, { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  /**
   * Handle logout and redirect to login
   */
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
      // Force navigation even if logout fails
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  /**
   * Handle going back to previous page
   */
  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      handleGoToDashboard();
    }
  };

  /**
   * Get appropriate message based on authentication status and role
   */
  const getMessage = () => {
    if (customMessage) {
      return customMessage;
    }

    if (!isAuthenticated) {
      return "You need to log in to access this page.";
    }

    if (actualRequiredRole) {
      return `This page requires ${getRoleDisplayName(actualRequiredRole)} access. You are currently logged in as ${getRoleDisplayName(role!)}.`;
    }

    return "You don't have permission to access this page.";
  };

  /**
   * Get appropriate title based on authentication status
   */
  const getTitle = () => {
    if (!isAuthenticated) {
      return "Authentication Required";
    }
    return "Access Denied";
  };

  /**
   * Get appropriate icon based on authentication status
   */
  const getIcon = () => {
    if (!isAuthenticated) {
      return "🔐";
    }
    return "🚫";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-200 text-center">
        {/* Icon */}
        <div className="text-6xl mb-6">
          {getIcon()}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          {getTitle()}
        </h1>

        {/* Message */}
        <p className="text-slate-600 mb-6 leading-relaxed">
          {getMessage()}
        </p>

        {/* Attempted Path Info (for debugging/support) */}
        {actualAttemptedPath && (
          <div className="bg-slate-100 rounded-lg p-3 mb-6 text-sm">
            <p className="text-slate-500 mb-1">Attempted to access:</p>
            <code className="text-slate-700 font-mono break-all">
              {actualAttemptedPath}
            </code>
          </div>
        )}

        {/* User Info */}
        {isAuthenticated && user && (
          <div className="bg-blue-50 rounded-lg p-3 mb-6 text-sm">
            <p className="text-blue-700">
              Logged in as: <strong>{getRoleDisplayName(role!)}</strong>
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {isAuthenticated ? (
            <>
              {/* Go to Dashboard */}
              <button
                onClick={handleGoToDashboard}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Go to My Dashboard
              </button>

              {/* Go Back */}
              <button
                onClick={handleGoBack}
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Go Back
              </button>

              {/* Logout and Login as Different User */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? 'Logging out...' : 'Login as Different User'}
              </button>
            </>
          ) : (
            <>
              {/* Login */}
              <button
                onClick={() => navigate('/login', { 
                  replace: true,
                  state: { returnTo: actualAttemptedPath }
                })}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Log In
              </button>

              {/* Go to Home */}
              <button
                onClick={() => navigate('/', { replace: true })}
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Go to Home
              </button>
            </>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            Need help? Contact support or check your account permissions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
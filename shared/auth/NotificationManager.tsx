/**
 * Notification Manager for Authentication System
 * 
 * This component provides user-friendly notifications for authentication errors,
 * session expiration warnings, and other authentication-related messages.
 * 
 * Requirements: 10.1, 10.4, 10.5
 */

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { SessionExpirationNotification, AuthError } from './ErrorHandler';
import { authErrorHandler } from './ErrorHandler';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface Notification {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  duration?: number; // Auto-dismiss after this many milliseconds
  persistent?: boolean; // Don't auto-dismiss
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  showError: (error: AuthError, context?: string) => string;
  showSessionWarning: (notification: SessionExpirationNotification) => string;
}

// ============================================================================
// Notification Context
// ============================================================================

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// ============================================================================
// Notification Provider Component
// ============================================================================

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  /**
   * Add a new notification
   */
  const addNotification = useCallback((notification: Omit<Notification, 'id'>): string => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? (notification.persistent ? undefined : 5000)
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-dismiss if duration is set
    if (newNotification.duration && !newNotification.persistent) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  /**
   * Remove a notification by ID
   */
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  /**
   * Clear all notifications
   */
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Show an authentication error notification
   */
  const showError = useCallback((error: AuthError, context?: string): string => {
    const message = authErrorHandler.getUserFriendlyMessage(error);
    const retryInfo = authErrorHandler.getRetryInfo(error);

    const actions: NotificationAction[] = [];

    // Add retry action if error is retryable
    if (retryInfo.canRetry) {
      actions.push({
        label: `Retry (${retryInfo.attemptsLeft} left)`,
        action: () => {
          // This would trigger a retry - implementation depends on context
          console.log('Retry requested for error:', error.code);
        },
        variant: 'primary'
      });
    }

    return addNotification({
      type: 'error',
      title: 'Authentication Error',
      message,
      persistent: error.code === 'NETWORK_ERROR' && retryInfo.canRetry,
      actions: actions.length > 0 ? actions : undefined
    });
  }, [addNotification]);

  /**
   * Show a session expiration notification
   */
  const showSessionWarning = useCallback((notification: SessionExpirationNotification): string => {
    const actions: NotificationAction[] = [];

    if (notification.action === 'refresh') {
      actions.push({
        label: 'Extend Session',
        action: () => {
          // This would trigger a session refresh
          console.log('Session refresh requested');
        },
        variant: 'primary'
      });
    } else if (notification.action === 'login') {
      actions.push({
        label: 'Log In Again',
        action: () => {
          // This would redirect to login
          window.location.href = '/login';
        },
        variant: 'primary'
      });
    }

    return addNotification({
      type: notification.type === 'expired' ? 'error' : 'warning',
      title: notification.type === 'expired' ? 'Session Expired' : 'Session Warning',
      message: notification.message,
      persistent: notification.type === 'expired',
      actions
    });
  }, [addNotification]);

  // Set up session expiration notifications
  useEffect(() => {
    const unsubscribe = authErrorHandler.onSessionExpiration(showSessionWarning);
    return unsubscribe;
  }, [showSessionWarning]);

  const contextValue: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showError,
    showSessionWarning
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// ============================================================================
// Notification Container Component
// ============================================================================

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map(notification => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

// ============================================================================
// Notification Card Component
// ============================================================================

interface NotificationCardProps {
  notification: Notification;
  onClose: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onClose }) => {
  const getTypeStyles = (type: Notification['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIconForType = (type: Notification['type']) => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getButtonStyles = (variant: NotificationAction['variant'] = 'primary') => {
    switch (variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'secondary':
        return 'bg-gray-200 hover:bg-gray-300 text-gray-800';
      case 'primary':
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  return (
    <div className={`p-4 rounded-lg border shadow-lg ${getTypeStyles(notification.type)} animate-slide-in`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <span className="text-lg">{getIconForType(notification.type)}</span>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{notification.title}</h4>
            <p className="text-sm mt-1 opacity-90">{notification.message}</p>
            
            {notification.actions && notification.actions.length > 0 && (
              <div className="flex space-x-2 mt-3">
                {notification.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${getButtonStyles(action.variant)}`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {!notification.persistent && (
          <button
            onClick={onClose}
            className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close notification"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook for showing authentication errors
 */
export const useAuthErrorNotification = () => {
  const { showError } = useNotifications();
  
  return useCallback((error: AuthError, context?: string) => {
    return showError(error, context);
  }, [showError]);
};

/**
 * Hook for showing session warnings
 */
export const useSessionNotification = () => {
  const { showSessionWarning } = useNotifications();
  
  return useCallback((notification: SessionExpirationNotification) => {
    return showSessionWarning(notification);
  }, [showSessionWarning]);
};

/**
 * Hook for showing generic notifications
 */
export const useNotification = () => {
  const { addNotification } = useNotifications();
  
  return useCallback((notification: Omit<Notification, 'id'>) => {
    return addNotification(notification);
  }, [addNotification]);
};

// ============================================================================
// CSS Animation Styles (to be added to global CSS)
// ============================================================================

/*
Add this to your global CSS file:

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
*/
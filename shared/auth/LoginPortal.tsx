/**
 * Unified Login Portal Component
 * 
 * This component provides a unified login interface with three role selection options:
 * Customer, Seller, and Super Admin. It integrates with existing Login.tsx patterns
 * from nexus-admin-console while supporting role-specific form rendering.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole, LoginCredentials } from './types';
import { useAuth } from './hooks';
import { LoginForm } from './LoginForms';

interface LoginPortalProps {
  onRoleSelect?: (role: UserRole) => void;
  selectedRole?: UserRole | null;
}

const LoginPortal: React.FC<LoginPortalProps> = ({ 
  onRoleSelect, 
  selectedRole: externalSelectedRole 
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(externalSelectedRole || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect authenticated users away from login
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
    onRoleSelect?.(role);
  };

  const handleSubmit = async (credentials: LoginCredentials) => {
    if (!selectedRole) return;

    setIsLoading(true);
    setError(null);

    try {
      await login(credentials, selectedRole);
      // Navigation will be handled by the auth context after successful login
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case UserRole.CUSTOMER:
        return 'Customer';
      case UserRole.SELLER:
        return 'Seller';
      case UserRole.SUPER_ADMIN:
        return 'Super Admin';
      default:
        return role;
    }
  };

  const getRoleDescription = (role: UserRole): string => {
    switch (role) {
      case UserRole.CUSTOMER:
        return 'Shop and manage your orders';
      case UserRole.SELLER:
        return 'Manage products and business operations';
      case UserRole.SUPER_ADMIN:
        return 'Platform administration and management';
      default:
        return '';
    }
  };

  const getRoleIcon = (role: UserRole): string => {
    switch (role) {
      case UserRole.CUSTOMER:
        return '🛍️';
      case UserRole.SELLER:
        return '🏪';
      case UserRole.SUPER_ADMIN:
        return '⚙️';
      default:
        return '👤';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div className="text-center mb-8">
          <div className="inline-block w-12 h-12 bg-blue-600 rounded-xl mb-4 text-white flex items-center justify-center text-2xl font-bold">
            U
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Unified Portal</h1>
          <p className="text-slate-500">Choose your login type</p>
        </div>

        {!selectedRole ? (
          // Role Selection View
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Select Your Role</h2>
            {Object.values(UserRole).map((role) => (
              <button
                key={role}
                onClick={() => handleRoleSelect(role)}
                className="w-full p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getRoleIcon(role)}</span>
                  <div>
                    <div className="font-medium text-slate-900 group-hover:text-blue-700">
                      {getRoleDisplayName(role)}
                    </div>
                    <div className="text-sm text-slate-500">
                      {getRoleDescription(role)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          // Login Form View - Use role-specific form components
          <div>
            <div className="flex items-center justify-center mb-6">
              <button
                onClick={() => handleRoleSelect(null as any)}
                className="text-sm text-slate-500 hover:text-slate-700 underline flex items-center space-x-1"
              >
                <span>←</span>
                <span>Back to Role Selection</span>
              </button>
            </div>

            <LoginForm
              role={selectedRole}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              error={error}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPortal;
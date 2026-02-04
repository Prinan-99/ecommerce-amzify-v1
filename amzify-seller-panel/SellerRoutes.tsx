import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/RealAuthContext';

// Import landing page components
import SellerHub from './amzify-seller-hub/App';

// Import auth components
import LoginPortal from './components/LoginPortal';
import SellerRegistration from './components/SellerRegistration';

// Import dashboard
import Dashboard from './App';

/**
 * Protected Route wrapper - redirects to login if not authenticated
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'seller') {
    return <Navigate to="/seller/login" replace />;
  }

  return <>{children}</>;
};

/**
 * Public Route wrapper - redirects to dashboard if already authenticated
 */
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user?.role === 'seller') {
    return <Navigate to="/seller/dashboard" replace />;
  }

  return <>{children}</>;
};

/**
 * Main routing component for Seller Panel
 */
const SellerRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Landing Page - Seller Hub */}
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <SellerHub />
            </PublicRoute>
          } 
        />

        {/* Login Page */}
        <Route 
          path="/seller/login" 
          element={
            <PublicRoute>
              <LoginPortal />
            </PublicRoute>
          } 
        />

        {/* Register Page - Currently redirects to login, will be enhanced later */}
        <Route 
          path="/seller/register" 
          element={
            <PublicRoute>
              <SellerRegistration />
            </PublicRoute>
          } 
        />

        {/* Protected Dashboard */}
        <Route 
          path="/seller/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Fallback - redirect to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default SellerRoutes;

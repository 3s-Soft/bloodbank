import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAuth = true, redirectTo = '/login' }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect logic based on authentication requirement
  if (requireAuth && !currentUser) {
    // Save the attempted location for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (!requireAuth && currentUser) {
    // If user is logged in but trying to access auth pages (login/register)
    // Redirect to dashboard or home
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;

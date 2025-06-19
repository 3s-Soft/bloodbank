import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { currentUser } = useAuth();

  // Check if user is logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // For demo purposes, we'll check if user email contains 'admin' or specific admin emails
  // In a real app, you'd have a proper role-based system
  const isAdmin = currentUser.email?.includes('admin') || 
                  currentUser.email === 'admin@bloodbank.org' ||
                  currentUser.email === 'administrator@example.com';

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-4xl font-bold text-error mb-4">Access Denied</h1>
          <p className="text-lg mb-6">You don't have permission to access this area.</p>
          <p className="text-sm text-base-content/70 mb-6">
            Only administrators can access the admin dashboard.
          </p>
          <div className="space-x-4">
            <button 
              onClick={() => window.history.back()}
              className="btn btn-outline"
            >
              Go Back
            </button>
            <a href="/" className="btn btn-primary">
              Go Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;

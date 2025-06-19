import React from 'react';
import { Link } from 'react-router';
import { FaSignInAlt, FaUserPlus, FaExclamationTriangle } from 'react-icons/fa';

const LoginPrompt = ({ message = "Please login to access this feature" }) => {
  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-300">
        <div className="card-body text-center">
          <div className="text-6xl mb-4">
            <FaExclamationTriangle className="text-warning mx-auto" />
          </div>
          
          <h2 className="card-title justify-center text-2xl mb-2">
            Authentication Required
          </h2>
          
          <p className="text-base-content/70 mb-6">
            {message}
          </p>
          
          <div className="card-actions flex-col gap-3 w-full">
            <Link 
              to="/login" 
              className="btn btn-primary w-full gap-2"
            >
              <FaSignInAlt />
              Login to Continue
            </Link>
            
            <Link 
              to="/register" 
              className="btn btn-outline w-full gap-2"
            >
              <FaUserPlus />
              Create New Account
            </Link>
            
            <Link 
              to="/" 
              className="btn btn-ghost w-full"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt;

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { FaEye, FaEyeSlash, FaSignInAlt, FaEnvelope, FaLock, FaGoogle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the intended destination from location state
  const from = location.state?.from?.pathname || '/dashboard';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      
      Swal.fire({
        title: 'Success!',
        text: 'You have been logged in successfully.',
        icon: 'success',
        confirmButtonText: 'Continue',
        confirmButtonColor: '#ef4444'
      });
      
      // Redirect to intended page or dashboard
      navigate(from, { replace: true });
    } catch (error) {
      let errorMessage = 'Failed to log in. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      }

      Swal.fire({
        title: 'Login Failed',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Try Again',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);

    try {
      await loginWithGoogle();
      
      Swal.fire({
        title: 'Success!',
        text: 'You have been logged in with Google successfully.',
        icon: 'success',
        confirmButtonText: 'Continue',
        confirmButtonColor: '#ef4444'
      });
      
      // Redirect to intended page or dashboard
      navigate(from, { replace: true });
    } catch (error) {
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in popup was closed. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Sign-in popup was blocked. Please allow popups and try again.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Another sign-in popup is already open.';
      }

      Swal.fire({
        title: 'Google Sign-In Failed',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Try Again',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-base-content">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-base-content/70">
            Welcome back to BloodBank Management System
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="space-y-4">
                {/* Email Field */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Email Address</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="h-5 w-5 text-base-content/40" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input input-bordered w-full pl-10"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Password</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="h-5 w-5 text-base-content/40" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="input input-bordered w-full pl-10 pr-10"
                      placeholder="Enter your password"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <input type="checkbox" className="checkbox checkbox-primary" />
                      <span className="label-text ml-2">Remember me</span>
                    </label>
                  </div>
                  <div className="text-sm">
                    <Link to="/forgot-password" className="link link-primary">
                      Forgot your password?
                    </Link>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="card-actions justify-center mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className={`btn btn-primary btn-wide ${loading ? 'loading' : ''}`}
                >
                  {loading ? (
                    'Signing in...'
                  ) : (
                    <>
                      <FaSignInAlt className="mr-2" />
                      Sign In with Email
                    </>
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="divider">OR</div>

              {/* Google Sign-In Button */}
              <div className="card-actions justify-center">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className={`btn btn-outline btn-wide ${loading ? 'loading' : ''}`}
                >
                  {loading ? (
                    'Signing in...'
                  ) : (
                    <>
                      <FaGoogle className="mr-2 text-red-500" />
                      Continue with Google
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-base-content/70">
            Don't have an account?{' '}
            <Link to="/register" className="link link-primary font-medium">
              Sign up here
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-sm">Demo Credentials</h3>
            <div className="text-sm space-y-1">
              <p><strong>Email:</strong> demo@bloodbank.org</p>
              <p><strong>Password:</strong> demo123456</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

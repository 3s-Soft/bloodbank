import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { FaEye, FaEyeSlash, FaUserPlus, FaEnvelope, FaLock, FaUser, FaTint, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'donor',
    bloodType: '',
    phone: '',
    city: '',
    age: '',
    terms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        title: 'Password Mismatch',
        text: 'Passwords do not match. Please try again.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
      return false;
    }

    if (formData.password.length < 6) {
      Swal.fire({
        title: 'Weak Password',
        text: 'Password must be at least 6 characters long.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
      return false;
    }

    if (!formData.terms) {
      Swal.fire({
        title: 'Terms Required',
        text: 'Please accept the terms and conditions to continue.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      await signup(formData.email, formData.password, formData.fullName);
      
      // Here you would typically save additional user data to your database
      const userData = {
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        bloodType: formData.bloodType,
        phone: formData.phone,
        city: formData.city,
        age: parseInt(formData.age),
        createdAt: new Date().toISOString()
      };
      
      console.log('User data to save:', userData);
      // TODO: Save to MongoDB via API call
      
      Swal.fire({
        title: 'Registration Successful!',
        text: 'Please check your email to verify your account.',
        icon: 'success',
        confirmButtonText: 'Continue',
        confirmButtonColor: '#ef4444'
      });
      
      navigate('/dashboard');
    } catch (error) {
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      }

      Swal.fire({
        title: 'Registration Failed',
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
    <div className="min-h-screen bg-base-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-base-content">
            Join Our Life-Saving Community
          </h2>
          <p className="mt-2 text-sm text-base-content/70">
            Register as a donor or recipient to start saving lives
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Personal Information */}
              <div className="md:col-span-2">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <FaUser className="mr-2 text-primary" />
                  Personal Information
                </h3>
              </div>

              {/* Full Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Full Name *</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-base-content/40" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="input input-bordered w-full pl-10"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email Address *</span>
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

              {/* Phone */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Phone Number *</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="h-5 w-5 text-base-content/40" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input input-bordered w-full pl-10"
                    placeholder="+880 1234 567890"
                    required
                  />
                </div>
              </div>

              {/* Age */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Age *</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  placeholder="Your age"
                  min="18"
                  max="65"
                  required
                />
              </div>

              {/* Role Selection */}
              <div className="md:col-span-2">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <FaTint className="mr-2 text-red-500" />
                  Account Type
                </h3>
              </div>

              {/* Role */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">I want to register as *</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="donor">Blood Donor</option>
                  <option value="recipient">Blood Recipient</option>
                  <option value="both">Both Donor & Recipient</option>
                </select>
              </div>

              {/* Blood Type */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Blood Type *</span>
                </label>
                <select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="">Select Blood Type</option>
                  {bloodTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-medium">City *</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="h-5 w-5 text-base-content/40" />
                  </div>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="input input-bordered w-full pl-10"
                    placeholder="Enter your city"
                    required
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="md:col-span-2">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <FaLock className="mr-2 text-yellow-500" />
                  Security
                </h3>
              </div>

              {/* Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Password *</span>
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
                    placeholder="Enter password"
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

              {/* Confirm Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Confirm Password *</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-base-content/40" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="input input-bordered w-full pl-10 pr-10"
                    placeholder="Confirm password"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="form-control md:col-span-2">
                <label className="label cursor-pointer justify-start">
                  <input
                    type="checkbox"
                    name="terms"
                    checked={formData.terms}
                    onChange={handleInputChange}
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text ml-3">
                    I agree to the{' '}
                    <Link to="/terms" className="link link-primary">
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="link link-primary">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
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
                  'Creating Account...'
                ) : (
                  <>
                    <FaUserPlus className="mr-2" />
                    Create Account
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-base-content/70">
            Already have an account?{' '}
            <Link to="/login" className="link link-primary font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

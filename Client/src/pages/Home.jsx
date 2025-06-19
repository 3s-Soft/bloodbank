import React from 'react';
import { Link } from 'react-router';
import { FaTint, FaUsers, FaHandHoldingHeart, FaCalendarAlt, FaHeart, FaStar, FaSignInAlt, FaUserPlus, FaSearch } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero Section */}
      <div className="hero min-h-screen bg-gradient-to-r from-red-500 to-pink-600">
        <div className="hero-overlay bg-opacity-60"></div>
        <div className="hero-content text-center text-neutral-content">
          <div className="max-w-md">
            <h1 className="mb-5 text-5xl font-bold">Save Lives</h1>
            <p className="mb-5 text-xl">
              Connect blood donors with recipients in rural Chittagong. 
              Every donation can save up to 3 lives.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/donate" className="btn btn-primary btn-lg">
                Donate Blood
              </Link>
              <Link to="/request" className="btn btn-outline btn-lg">
                Request Blood
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-base-200">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <FaHandHoldingHeart className="text-5xl text-red-500 mb-4" />
                <h3 className="card-title">Register as Donor</h3>
                <p>Sign up and create your donor profile with blood type and location</p>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <FaSearch className="text-5xl text-blue-500 mb-4" />
                <h3 className="card-title">Find Donors</h3>
                <p>Search for compatible donors near your location</p>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <FaCalendarAlt className="text-5xl text-green-500 mb-4" />
                <h3 className="card-title">Blood Drives</h3>
                <p>Participate in organized blood donation events</p>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <FaUsers className="text-5xl text-purple-500 mb-4" />
                <h3 className="card-title">Community</h3>
                <p>Be part of a life-saving community</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="stats shadow w-full">
            <div className="stat">
              <div className="stat-figure text-primary">
                <FaHandHoldingHeart className="text-3xl" />
              </div>
              <div className="stat-title">Total Donors</div>
              <div className="stat-value text-primary">1,200+</div>
              <div className="stat-desc">Active blood donors</div>
            </div>
            
            <div className="stat">
              <div className="stat-figure text-secondary">
                <FaUsers className="text-3xl" />
              </div>
              <div className="stat-title">Lives Saved</div>
              <div className="stat-value text-secondary">3,600+</div>
              <div className="stat-desc">Through blood donations</div>
            </div>
            
            <div className="stat">
              <div className="stat-figure text-accent">
                <FaCalendarAlt className="text-3xl" />
              </div>
              <div className="stat-title">Blood Drives</div>
              <div className="stat-value text-accent">45</div>
              <div className="stat-desc">Organized events</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-red-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">Ready to Save Lives?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our community of heroes and make a difference in someone's life today.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register" className="btn btn-primary btn-lg">
              Join as Donor
            </Link>
            <Link to="/about" className="btn btn-outline btn-lg">
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

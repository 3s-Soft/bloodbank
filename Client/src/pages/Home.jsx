import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { 
  FaTint, 
  FaUsers, 
  FaHandHoldingHeart, 
  FaCalendarAlt, 
  FaHeart, 
  FaStar,
  FaSignInAlt, 
  FaUserPlus, 
  FaSearch,
  FaShieldAlt,
  FaGlobe,
  FaAward,
  FaArrowRight,
  FaPlay,
  FaCheckCircle,
  FaSparkles,
  FaBolt,
  FaRocket,
  FaMagic
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    donors: 0,
    livesSaved: 0,
    bloodDrives: 0,
    hospitals: 0
  });

  // Animate numbers on load
  useEffect(() => {
    const animateStats = () => {
      const finalStats = { donors: 12500, livesSaved: 37500, bloodDrives: 450, hospitals: 150 };
      const duration = 2000;
      const steps = 60;
      const interval = duration / steps;
      
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        
        setStats({
          donors: Math.floor(finalStats.donors * progress),
          livesSaved: Math.floor(finalStats.livesSaved * progress),
          bloodDrives: Math.floor(finalStats.bloodDrives * progress),
          hospitals: Math.floor(finalStats.hospitals * progress)
        });
        
        if (step >= steps) {
          clearInterval(timer);
          setStats(finalStats);
        }
      }, interval);
    };
    
    const timer = setTimeout(animateStats, 500);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: FaUsers,
      title: 'Smart Donor Matching',
      description: 'AI-powered system connects you with compatible donors instantly',
      gradient: 'from-blue-500 to-cyan-500',
      delay: '0s'
    },
    {
      icon: FaBolt,
      title: 'Emergency Response',
      description: '24/7 emergency blood request system with real-time notifications',
      gradient: 'from-red-500 to-pink-500',
      delay: '0.2s'
    },
    {
      icon: FaShieldAlt,
      title: 'Secure & Private',
      description: 'Bank-level security ensures your data is always protected',
      gradient: 'from-green-500 to-emerald-500',
      delay: '0.4s'
    },
    {
      icon: FaGlobe,
      title: 'Community Network',
      description: 'Connect with thousands of verified donors across Bangladesh',
      gradient: 'from-purple-500 to-indigo-500',
      delay: '0.6s'
    }
  ];

  const testimonials = [
    {
      name: 'Ahmed Rahman',
      role: 'Grateful Parent',
      content: 'This platform saved my daughter\'s life. Found compatible donors within hours during an emergency.',
      avatar: 'A',
      rating: 5
    },
    {
      name: 'Dr. Fatima Khan',
      role: 'Medical Professional',
      content: 'Incredible system! Has revolutionized how we handle blood requests at our hospital.',
      avatar: 'F',
      rating: 5
    },
    {
      name: 'Mohammad Ali',
      role: 'Regular Donor',
      content: 'Easy to use, transparent process. Proud to be part of this life-saving community.',
      avatar: 'M',
      rating: 5
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Sign Up',
      description: 'Create your account and complete your donor profile',
      icon: FaUserPlus
    },
    {
      step: '02',
      title: 'Get Verified',
      description: 'Quick verification process ensures authenticity',
      icon: FaCheckCircle
    },
    {
      step: '03',
      title: 'Start Saving',
      description: 'Begin helping others or request help when needed',
      icon: FaHeart
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="fade-in-up">
            {/* Hero Badge */}
            <div className="inline-flex items-center px-6 py-3 rounded-full modern-card mb-8 group">
              <FaSparkles className="w-4 h-4 text-yellow-400 mr-2 animate-pulse" />
              <span className="text-sm font-medium bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Trusted by 12,500+ donors across Bangladesh
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-bold text-white mb-6 text-modern-bold">
              Save Lives with
              <span className="block bg-gradient-to-r from-red-500 via-pink-500 to-red-600 bg-clip-text text-transparent">
                Every Drop
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto text-modern">
              Connect blood donors with recipients instantly. Our AI-powered platform makes 
              life-saving donations faster, safer, and more efficient than ever before.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              {currentUser ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white font-semibold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 interactive flex items-center justify-center space-x-2"
                  >
                    <FaTachometerAlt className="w-5 h-5" />
                    <span>Go to Dashboard</span>
                    <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    to="/request" 
                    className="group px-8 py-4 border-2 border-white/20 rounded-2xl text-white font-semibold text-lg hover:bg-white/10 transition-all duration-300 interactive flex items-center justify-center space-x-2"
                  >
                    <FaHandHoldingHeart className="w-5 h-5" />
                    <span>Request Blood</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/register" 
                    className="group px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl text-white font-semibold text-lg shadow-2xl hover:shadow-red-500/25 transition-all duration-300 interactive flex items-center justify-center space-x-2"
                  >
                    <FaUserPlus className="w-5 h-5" />
                    <span>Join as Donor</span>
                    <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    to="/donors" 
                    className="group px-8 py-4 border-2 border-white/20 rounded-2xl text-white font-semibold text-lg hover:bg-white/10 transition-all duration-300 interactive flex items-center justify-center space-x-2"
                  >
                    <FaSearch className="w-5 h-5" />
                    <span>Find Donors</span>
                  </Link>
                </>
              )}
            </div>

            {/* Demo Video Button */}
            <button className="group flex items-center justify-center mx-auto text-white/80 hover:text-white transition-colors duration-300">
              <div className="w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center mr-4 group-hover:border-white/50 transition-colors duration-300 group-hover:scale-110 transition-transform">
                <FaPlay className="w-6 h-6 ml-1" />
              </div>
              <span className="text-lg font-medium">Watch how it works</span>
            </button>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full blur-xl floating"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl floating animation-delay-2000"></div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'Active Donors', value: stats.donors, icon: FaUsers, suffix: '+' },
              { label: 'Lives Saved', value: stats.livesSaved, icon: FaHeart, suffix: '+' },
              { label: 'Blood Drives', value: stats.bloodDrives, icon: FaCalendarAlt, suffix: '+' },
              { label: 'Partner Hospitals', value: stats.hospitals, icon: FaShieldAlt, suffix: '+' }
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="modern-card p-8 mb-4 group hover:scale-105 transition-all duration-300">
                    <IconComponent className="w-8 h-8 text-white mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                      {stat.value.toLocaleString()}{stat.suffix}
                    </div>
                    <div className="text-gray-300 font-medium">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 text-modern-bold">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto text-modern">
              Advanced technology meets compassionate care to create the most efficient 
              blood donation network in Bangladesh.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div 
                  key={index} 
                  className="modern-card p-8 group hover:scale-105 transition-all duration-300"
                  style={{ animationDelay: feature.delay }}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 text-modern-bold">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto text-modern">
              Getting started is simple. Follow these three steps to join our life-saving community.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-black font-bold text-sm">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 text-modern-bold">
              Stories of Hope
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto text-modern">
              Real stories from real people whose lives have been touched by our community.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="modern-card p-8 group hover:scale-105 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{testimonial.name}</h4>
                    <p className="text-gray-300">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed mb-6">"{testimonial.content}"</p>
                <div className="flex space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="w-5 h-5 text-yellow-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="modern-card p-12">
            <FaRocket className="w-16 h-16 text-white mx-auto mb-8 floating" />
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 text-modern-bold">
              Ready to Save Lives?
            </h2>
            <p className="text-xl text-gray-300 mb-12 text-modern">
              Join thousands of heroes who are making a difference every day. 
              Your contribution could be someone's second chance at life.
            </p>
            
            {!currentUser && (
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link 
                  to="/register" 
                  className="group px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl text-white font-semibold text-lg shadow-2xl hover:shadow-red-500/25 transition-all duration-300 interactive flex items-center justify-center space-x-2"
                >
                  <FaUserPlus className="w-5 h-5" />
                  <span>Become a Donor</span>
                  <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/login" 
                  className="group px-8 py-4 border-2 border-white/20 rounded-2xl text-white font-semibold text-lg hover:bg-white/10 transition-all duration-300 interactive flex items-center justify-center space-x-2"
                >
                  <FaSignInAlt className="w-5 h-5" />
                  <span>Login</span>
                </Link>
              </div>
            )}

            {currentUser && (
              <Link 
                to="/request" 
                className="group px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl text-white font-semibold text-lg shadow-2xl hover:shadow-red-500/25 transition-all duration-300 interactive flex items-center justify-center space-x-2 mx-auto max-w-xs"
              >
                <FaHandHoldingHeart className="w-5 h-5" />
                <span>Request Blood</span>
                <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { 
  FaHeart, 
  FaBars, 
  FaTimes, 
  FaSignInAlt, 
  FaUserPlus, 
  FaSignOutAlt, 
  FaTachometerAlt,
  FaUser,
  FaCog,
  FaSun, 
  FaMoon,
  FaHome,
  FaUsers,
  FaCalendarAlt,
  FaHandHoldingHeart,
  FaInfoCircle,
  FaUserShield,
  FaChevronDown,
  FaStar
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  // Check if user is admin
  const isAdmin = currentUser?.email?.includes('admin') || 
                  currentUser?.email === 'admin@bloodbank.org' ||
                  currentUser?.email === 'administrator@example.com';

  // Modern navigation items with enhanced design
  const navigationItems = [
    { 
      name: 'Home', 
      path: '/', 
      icon: FaHome, 
      public: true,
      gradient: 'from-blue-500 via-purple-500 to-blue-600',
      description: 'Welcome page'
    },
    { 
      name: 'Find Donors', 
      path: '/donors', 
      icon: FaUsers, 
      public: true,
      gradient: 'from-green-500 via-emerald-500 to-teal-600',
      description: 'Search donors'
    },
    { 
      name: 'Blood Drives', 
      path: '/events', 
      icon: FaCalendarAlt, 
      public: true,
      gradient: 'from-purple-500 via-pink-500 to-red-500',
      description: 'Events & drives'
    },
    { 
      name: 'Request Blood', 
      path: '/request', 
      icon: FaHandHoldingHeart, 
      private: true, 
      highlight: true,
      gradient: 'from-red-500 via-pink-500 to-red-600',
      description: 'Emergency requests'
    },
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: FaTachometerAlt, 
      private: true,
      gradient: 'from-indigo-500 via-blue-500 to-cyan-500',
      description: 'Your dashboard'
    },
    { 
      name: 'About', 
      path: '/about', 
      icon: FaInfoCircle, 
      public: true,
      gradient: 'from-amber-500 via-orange-500 to-yellow-500',
      description: 'Learn about us'
    }
  ];

  const adminItems = [
    { 
      name: 'Admin Panel', 
      path: '/admin', 
      icon: FaUserShield, 
      admin: true,
      gradient: 'from-red-600 via-red-700 to-red-800',
      description: 'System admin'
    }
  ];

  // Get filtered navigation items
  const getVisibleItems = () => {
    let items = navigationItems.filter(item => 
      item.public || (item.private && currentUser)
    );
    
    if (isAdmin) {
      items = [...items, ...adminItems];
    }
    
    return items;
  };

  const isActive = (path) => location.pathname === path;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setIsDarkMode(savedTheme === 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
      setIsUserMenuOpen(false);
      Swal.fire({
        title: 'Logged Out',
        text: 'You have been successfully logged out.',
        icon: 'success',
        confirmButtonColor: '#667eea',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsMenuOpen(false);
  };

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'glass backdrop-blur-xl shadow-2xl' 
        : 'glass backdrop-blur-lg'
    }`}>
      {/* Navigation Background with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          {/* Modern Logo Section */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="flex items-center space-x-3 group relative"
              onClick={closeAllMenus}
            >
              {/* Animated Logo Container */}
              <div className="relative">
                <div className="w-12 h-12 lg:w-14 lg:h-14 modern-card glow flex items-center justify-center group-hover:scale-110 transition-all duration-500">
                  <FaHeart className="text-white text-xl lg:text-2xl pulse-slow" />
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-600 rounded-full opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                {/* Floating particles effect */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full animate-ping animation-delay-1000"></div>
              </div>
              
              <div className="hidden sm:block">
                <h1 className="text-xl lg:text-3xl text-modern-bold gradient-text">
                  BloodBank
                </h1>
                <p className="text-xs lg:text-sm text-base-content/60 -mt-1 font-light">
                  Save Lives Together
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {getVisibleItems().map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.path);
              
              return (
                <div key={item.path} className="relative group">
                  <Link
                    to={item.path}
                    className={`
                      relative px-6 py-3 rounded-2xl transition-all duration-300 flex items-center space-x-2 interactive
                      ${active 
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg scale-105` 
                        : 'hover:bg-white/10 hover:scale-105'
                      }
                      ${item.highlight && !active ? 'ring-2 ring-red-500/30 bg-red-500/10' : ''}
                      ${item.admin && !active ? 'ring-2 ring-amber-500/30 bg-amber-500/10' : ''}
                    `}
                  >
                    <IconComponent className={`w-4 h-4 ${active ? 'text-white' : ''} transition-all duration-300`} />
                    <span className="font-medium text-sm">{item.name}</span>
                    
                    {/* Active indicator */}
                    {active && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg"></div>
                    )}
                    
                    {/* Special badges */}
                    {item.highlight && !active && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                        <FaStar className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </Link>
                  
                  {/* Hover tooltip */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-black/80 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                    {item.description}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45"></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            
            {/* Modern Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-3 rounded-2xl modern-card interactive glow group"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <FaSun className="w-5 h-5 text-yellow-500 group-hover:rotate-180 transition-transform duration-500" />
              ) : (
                <FaMoon className="w-5 h-5 text-blue-600 group-hover:rotate-12 transition-transform duration-300" />
              )}
            </button>

            {/* User Section */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-3 p-3 rounded-2xl modern-card interactive glow group"
                >
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm lg:text-base shadow-lg">
                    {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="font-semibold text-sm truncate max-w-24">
                      {currentUser.displayName || 'User'}
                    </p>
                    <p className="text-xs opacity-70 truncate max-w-24">
                      {isAdmin ? 'Admin' : 'Member'}
                    </p>
                  </div>
                  <FaChevronDown className={`w-3 h-3 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Modern User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-72 modern-card scale-in z-50">
                    {/* User Info Header */}
                    <div className="p-6 border-b border-white/10">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-lg truncate">{currentUser.displayName || 'User'}</p>
                          <p className="text-sm opacity-70 truncate">{currentUser.email}</p>
                          <div className="inline-flex items-center px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium mt-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                            Online
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      {[
                        { name: 'Profile', path: '/profile', icon: FaUser, color: 'text-blue-400' },
                        { name: 'Settings', path: '/settings', icon: FaCog, color: 'text-gray-400' }
                      ].map((item) => {
                        const IconComponent = item.icon;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={closeAllMenus}
                            className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-300 interactive group"
                          >
                            <IconComponent className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform duration-300`} />
                            <span className="font-medium">{item.name}</span>
                          </Link>
                        );
                      })}
                      
                      <div className="border-t border-white/10 my-2"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-500/20 text-red-400 transition-all duration-300 interactive group"
                      >
                        <FaSignOutAlt className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-6 py-3 rounded-2xl border-2 border-white/20 text-white hover:bg-white/10 transition-all duration-300 font-medium flex items-center space-x-2 interactive"
                >
                  <FaSignInAlt className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-2xl transition-all duration-300 font-medium flex items-center space-x-2 interactive"
                >
                  <FaUserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}

            {/* Modern Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-3 rounded-2xl modern-card interactive group"
            >
              {isMenuOpen ? (
                <FaTimes className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
              ) : (
                <FaBars className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>

        {/* Modern Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-6 fade-in-up">
            <div className="modern-card p-6 space-y-4">
              
              {/* Mobile Navigation Items */}
              {getVisibleItems().map((item) => {
                const IconComponent = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeAllMenus}
                    className={`
                      flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 interactive
                      ${active 
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg` 
                        : 'hover:bg-white/10'
                      }
                    `}
                  >
                    <IconComponent className="w-6 h-6" />
                    <div>
                      <div className="font-medium text-lg">{item.name}</div>
                      <div className="text-sm opacity-70">{item.description}</div>
                    </div>
                    {item.highlight && (
                      <div className="ml-auto">
                        <FaStar className="w-4 h-4 text-yellow-400" />
                      </div>
                    )}
                  </Link>
                );
              })}

              {/* Mobile User Section */}
              {currentUser ? (
                <div className="border-t border-white/10 pt-6 mt-6">
                  <div className="flex items-center space-x-4 p-4 modern-card mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                      {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-lg">{currentUser.displayName || 'User'}</p>
                      <p className="text-sm opacity-70 truncate">{currentUser.email}</p>
                      <div className="inline-flex items-center px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium mt-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                        Online
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {[
                      { name: 'Profile', path: '/profile', icon: FaUser, color: 'text-blue-400' },
                      { name: 'Settings', path: '/settings', icon: FaCog, color: 'text-gray-400' }
                    ].map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={closeAllMenus}
                          className="flex items-center space-x-3 p-4 rounded-2xl hover:bg-white/10 transition-all duration-300 interactive"
                        >
                          <IconComponent className={`w-5 h-5 ${item.color}`} />
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      );
                    })}
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 p-4 rounded-2xl hover:bg-red-500/20 text-red-400 transition-all duration-300 interactive"
                    >
                      <FaSignOutAlt className="w-5 h-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-white/10 pt-6 mt-6 space-y-3">
                  <Link
                    to="/login"
                    onClick={closeAllMenus}
                    className="flex items-center justify-center space-x-3 p-4 rounded-2xl border-2 border-white/20 hover:bg-white/10 transition-all duration-300 font-medium interactive"
                  >
                    <FaSignInAlt className="w-5 h-5" />
                    <span>Login to Your Account</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeAllMenus}
                    className="flex items-center justify-center space-x-3 p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white transition-all duration-300 font-medium shadow-lg interactive"
                  >
                    <FaUserPlus className="w-5 h-5" />
                    <span>Create New Account</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

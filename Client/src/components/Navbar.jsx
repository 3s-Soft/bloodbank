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
  FaBell,
  FaSearch,
  FaChevronDown
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

  // Navigation items with modern design
  const navigationItems = [
    { 
      name: 'Home', 
      path: '/', 
      icon: FaHome, 
      public: true,
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      name: 'Find Donors', 
      path: '/donors', 
      icon: FaUsers, 
      public: true,
      gradient: 'from-green-500 to-emerald-500'
    },
    { 
      name: 'Blood Drives', 
      path: '/events', 
      icon: FaCalendarAlt, 
      public: true,
      gradient: 'from-purple-500 to-violet-500'
    },
    { 
      name: 'Request Blood', 
      path: '/request', 
      icon: FaHandHoldingHeart, 
      private: true, 
      highlight: true,
      gradient: 'from-red-500 to-pink-500'
    },
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: FaTachometerAlt, 
      private: true,
      gradient: 'from-indigo-500 to-blue-500'
    },
    { 
      name: 'About', 
      path: '/about', 
      icon: FaInfoCircle, 
      public: true,
      gradient: 'from-amber-500 to-orange-500'
    }
  ];

  const adminItems = [
    { 
      name: 'Admin Panel', 
      path: '/admin', 
      icon: FaUserShield, 
      admin: true,
      gradient: 'from-red-600 to-red-700'
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
        confirmButtonColor: '#ef4444',
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

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.navbar-container')) {
        closeAllMenus();
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-base-100/80 backdrop-blur-xl shadow-2xl border-b border-base-300/50' 
        : 'bg-base-100/95 backdrop-blur-lg shadow-lg'
    }`}>
      <div className="navbar-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="flex items-center space-x-3 group"
              onClick={closeAllMenus}
            >
              <div className="relative">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <FaHeart className="text-white text-lg lg:text-xl animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  BloodBank
                </h1>
                <p className="text-xs text-base-content/60 -mt-1">Save Lives Together</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {getVisibleItems().map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    relative group px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2
                    ${active 
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg scale-105` 
                      : 'hover:bg-base-200 hover:scale-105'
                    }
                    ${item.highlight && !active ? 'ring-2 ring-red-500/30 bg-red-50 hover:bg-red-100' : ''}
                    ${item.admin && !active ? 'ring-2 ring-amber-500/30 bg-amber-50 hover:bg-amber-100' : ''}
                  `}
                >
                  <IconComponent className={`w-4 h-4 ${active ? 'animate-pulse' : 'group-hover:scale-110'} transition-transform duration-300`} />
                  <span className="font-medium text-sm xl:text-base">{item.name}</span>
                  {active && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 lg:p-3 rounded-xl bg-base-200 hover:bg-base-300 transition-all duration-300 hover:scale-110 group"
            >
              {isDarkMode ? (
                <FaSun className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-500 group-hover:rotate-180 transition-transform duration-500" />
              ) : (
                <FaMoon className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 group-hover:rotate-12 transition-transform duration-300" />
              )}
            </button>

            {/* User Section */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 rounded-xl bg-gradient-to-r from-primary to-primary-focus hover:from-primary-focus hover:to-secondary text-primary-content transition-all duration-300 hover:scale-105 shadow-lg group"
                >
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <span className="font-bold text-sm lg:text-base">
                      {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="font-semibold text-sm truncate max-w-24">
                      {currentUser.displayName || 'User'}
                    </p>
                    <p className="text-xs opacity-80 truncate max-w-24">
                      {isAdmin ? 'Admin' : 'Member'}
                    </p>
                  </div>
                  <FaChevronDown className={`w-3 h-3 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-base-100 rounded-2xl shadow-2xl border border-base-300 overflow-hidden z-50 animate-scale-in">
                    {/* User Info Header */}
                    <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-base-300">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-content font-bold text-lg">
                          {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold">{currentUser.displayName || 'User'}</p>
                          <p className="text-sm opacity-70 truncate max-w-36">{currentUser.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      {[
                        { name: 'Profile', path: '/profile', icon: FaUser, color: 'text-blue-500' },
                        { name: 'Settings', path: '/settings', icon: FaCog, color: 'text-gray-500' }
                      ].map((item) => {
                        const IconComponent = item.icon;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={closeAllMenus}
                            className="flex items-center space-x-3 p-3 rounded-xl hover:bg-base-200 transition-all duration-300 group"
                          >
                            <IconComponent className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform duration-300`} />
                            <span className="font-medium">{item.name}</span>
                          </Link>
                        );
                      })}
                      
                      <div className="divider my-1"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-50 text-red-600 transition-all duration-300 group"
                      >
                        <FaSignOutAlt className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-primary-content transition-all duration-300 font-medium flex items-center space-x-2 group"
                >
                  <FaSignInAlt className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-content hover:from-primary-focus hover:to-secondary-focus transition-all duration-300 font-medium shadow-lg hover:shadow-xl flex items-center space-x-2 group"
                >
                  <FaUserPlus className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  <span>Register</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-xl bg-base-200 hover:bg-base-300 transition-all duration-300 group"
            >
              {isMenuOpen ? (
                <FaTimes className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
              ) : (
                <FaBars className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 animate-slide-down">
            <div className="bg-base-200/50 backdrop-blur-lg rounded-2xl p-4 space-y-2">
              
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
                      flex items-center space-x-3 p-4 rounded-xl transition-all duration-300
                      ${active 
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg` 
                        : 'hover:bg-base-300'
                      }
                    `}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                    {item.highlight && (
                      <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">Hot</span>
                    )}
                    {item.admin && (
                      <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded-full">Admin</span>
                    )}
                  </Link>
                );
              })}

              {/* Mobile User Section */}
              {currentUser ? (
                <div className="border-t border-base-300 pt-4 mt-4">
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-content font-bold">
                      {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold">{currentUser.displayName || 'User'}</p>
                      <p className="text-sm opacity-70">{currentUser.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Link
                      to="/profile"
                      onClick={closeAllMenus}
                      className="flex items-center space-x-3 p-3 rounded-xl hover:bg-base-300 transition-all duration-300"
                    >
                      <FaUser className="w-5 h-5 text-blue-500" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={closeAllMenus}
                      className="flex items-center space-x-3 p-3 rounded-xl hover:bg-base-300 transition-all duration-300"
                    >
                      <FaCog className="w-5 h-5 text-gray-500" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-50 text-red-600 transition-all duration-300"
                    >
                      <FaSignOutAlt className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-base-300 pt-4 mt-4 space-y-3">
                  <Link
                    to="/login"
                    onClick={closeAllMenus}
                    className="flex items-center justify-center space-x-3 p-4 rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-primary-content transition-all duration-300 font-medium"
                  >
                    <FaSignInAlt className="w-5 h-5" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeAllMenus}
                    className="flex items-center justify-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-content transition-all duration-300 font-medium shadow-lg"
                  >
                    <FaUserPlus className="w-5 h-5" />
                    <span>Register</span>
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

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
  FaSun, 
  FaMoon, 
  FaSearch,
  FaBell,
  FaUser,
  FaCog,
  FaChevronDown,
  FaHome,
  FaUsers,
  FaCalendarAlt,
  FaHandHoldingHeart,
  FaInfoCircle,
  FaUserShield
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/api';
import Swal from 'sweetalert2';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  // Check if user is admin
  const isAdmin = currentUser?.email?.includes('admin') || 
                  currentUser?.email === 'admin@bloodbank.org' ||
                  currentUser?.email === 'administrator@example.com';

  const navItems = [
    { name: 'Home', path: '/', icon: FaHome },
    { name: 'Find Donors', path: '/donors', icon: FaUsers },
    { name: 'Blood Drives', path: '/events', icon: FaCalendarAlt },
    { name: 'Request Blood', path: '/request', icon: FaHandHoldingHeart, highlight: true },
    { name: 'About', path: '/about', icon: FaInfoCircle },
    ...(isAdmin ? [{ name: 'Admin', path: '/admin', icon: FaUserShield, admin: true }] : [])
  ];

  // Mock notifications fallback
  const mockNotifications = [
    { id: 1, title: 'New donor registered', message: 'Ahmed Rahman registered as O+ donor', time: '2 min ago', unread: true },
    { id: 2, title: 'Blood request fulfilled', message: 'Emergency request completed successfully', time: '1 hour ago', unread: true },
    { id: 3, title: 'Blood drive reminder', message: 'Upcoming drive at Medical College tomorrow', time: '3 hours ago', unread: false },
  ];

  const isActive = (path) => location.pathname === path;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
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
      setIsProfileDropdownOpen(false);
      await logout();
      Swal.fire({
        title: 'Logged Out',
        text: 'You have been successfully logged out.',
        icon: 'success',
        confirmButtonColor: '#ef4444'
      });
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const closeAllDropdowns = () => {
    setIsProfileDropdownOpen(false);
    setIsNotificationDropdownOpen(false);
    setIsMenuOpen(false);
  };

  // Fetch notifications when user is logged in
  useEffect(() => {
    const fetchNotifications = async () => {
      if (currentUser) {
        try {
          // For now, use mock notifications until we have proper user-to-database mapping
          console.log('User logged in, using mock notifications for now');
          setNotifications(mockNotifications);
        } catch (error) {
          console.error('Error fetching notifications:', error);
          // Fallback to mock notifications
          setNotifications(mockNotifications);
        }
      } else {
        setNotifications([]);
      }
    };

    fetchNotifications();
  }, [currentUser]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdowns if clicking outside dropdown or mobile menu
      if (!event.target.closest('.dropdown') && !event.target.closest('.mobile-menu')) {
        setIsProfileDropdownOpen(false);
        setIsNotificationDropdownOpen(false);
      }
      
      // Close mobile menu if clicking outside
      if (!event.target.closest('.mobile-menu') && !event.target.closest('.mobile-menu-button')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Handle search functionality
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/donors?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <header className={`navbar transition-all duration-300 sticky top-0 z-50 px-4 lg:px-8 ${
      scrolled 
        ? 'bg-base-100/95 backdrop-blur-lg shadow-xl border-b border-base-300' 
        : 'bg-base-100 shadow-lg'
    }`}>
      <div className="navbar-start">
        {/* Logo */}
        <Link to="/" className="btn btn-ghost text-xl lg:text-2xl hover:bg-transparent group">
          <FaHeart className="text-red-500 mr-2 heart-animation group-hover:scale-110 transition-transform duration-300" />
          <span className="text-gradient font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            BloodBank
          </span>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-2">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    transition-all duration-300 rounded-xl px-4 py-3 flex items-center gap-2 group
                    hover:scale-105 hover:shadow-lg
                    ${isActive(item.path)
                      ? 'bg-gradient-to-r from-primary to-primary-focus text-primary-content shadow-lg transform scale-105'
                      : item.highlight
                        ? 'bg-gradient-to-r from-error to-error-focus text-error-content hover:from-error-focus hover:to-error shadow-md'
                        : 'hover:bg-base-200 hover:text-primary'
                    }
                  `}
                >
                  <IconComponent className={`w-4 h-4 transition-all duration-300 ${
                    isActive(item.path) || item.highlight ? 'animate-pulse' : 'group-hover:scale-110'
                  }`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="navbar-end gap-3">
        {/* Search Bar (Desktop) */}
        <div className="hidden xl:flex">
          <div className="form-control">
            <div className="input-group">
              <input
                type="text"
                placeholder="Search donors..."
                className="input input-bordered input-sm w-64 focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
              />
              <button 
                className="btn btn-square btn-sm btn-primary hover:scale-105 transition-transform duration-300"
                onClick={handleSearch}
              >
                <FaSearch />
              </button>
            </div>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="tooltip tooltip-bottom" data-tip={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-circle hover:scale-110 hover:rotate-12 transition-all duration-300"
          >
            {isDarkMode ? (
              <FaSun className="h-5 w-5 text-yellow-500 animate-pulse" />
            ) : (
              <FaMoon className="h-5 w-5 text-blue-500" />
            )}
          </button>
        </div>

        {currentUser ? (
          <>
            {/* Notifications */}
            <div className="dropdown dropdown-end">
              <div className="tooltip tooltip-bottom" data-tip="Notifications">
                <button
                  className="btn btn-ghost btn-circle indicator hover:scale-110 transition-transform duration-300"
                  onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                >
                  <FaBell className="h-5 w-5" />
                  {notifications.filter(n => n.unread).length > 0 && (
                    <span className="badge badge-xs badge-primary indicator-item animate-bounce">
                      {notifications.filter(n => n.unread).length}
                    </span>
                  )}
                </button>
              </div>
              {isNotificationDropdownOpen && (
                <div className="dropdown-content z-[1] mt-3 w-80 shadow-2xl bg-base-100 rounded-2xl border border-base-300 overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-primary-focus/10 border-b border-base-300">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <FaBell className="text-primary" />
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-base-content/70">
                        <FaBell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-base-200 cursor-pointer border-b border-base-200 transition-colors duration-200 ${
                            notification.unread ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{notification.title}</p>
                              <p className="text-xs text-base-content/70 mt-1">{notification.message}</p>
                            </div>
                            {notification.unread && (
                              <div className="w-3 h-3 bg-primary rounded-full mt-1 ml-2 animate-pulse"></div>
                            )}
                          </div>
                          <p className="text-xs text-base-content/50 mt-2">{notification.time}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 bg-base-200 border-t">
                    <button className="btn btn-ghost btn-sm w-full hover:bg-primary hover:text-primary-content transition-colors duration-300">
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="dropdown dropdown-end">
              <div className="tooltip tooltip-bottom" data-tip="Profile Menu">
                <button
                  className="btn btn-ghost btn-circle avatar placeholder hover:scale-110 transition-transform duration-300"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                >
                  <div className="bg-gradient-to-br from-primary to-primary-focus text-primary-content rounded-full w-10 ring-2 ring-primary/20 ring-offset-2 ring-offset-base-100">
                    <span className="text-sm font-bold">
                      {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                </button>
              </div>
              {isProfileDropdownOpen && (
                <div className="dropdown-content z-[1] mt-3 w-80 shadow-2xl bg-base-100 rounded-2xl border border-base-300 overflow-hidden">
                  {/* Profile Header */}
                  <div className="p-6 bg-gradient-to-br from-primary/10 to-primary-focus/10 border-b border-base-300">
                    <div className="flex items-center gap-4">
                      <div className="avatar placeholder">
                        <div className="bg-gradient-to-br from-primary to-primary-focus text-primary-content rounded-full w-16 ring-4 ring-primary/20">
                          <span className="text-xl font-bold">
                            {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-lg truncate">
                          {currentUser.displayName || 'User'}
                        </p>
                        <p className="text-sm text-base-content/70 truncate">
                          {currentUser.email}
                        </p>
                        <div className="badge badge-success badge-sm mt-1">Active</div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Menu */}
                  <div className="p-2">
                    {[
                      { to: "/dashboard", icon: FaTachometerAlt, label: "Dashboard", color: "text-blue-500" },
                      { to: "/profile", icon: FaUser, label: "Profile", color: "text-green-500" },
                      { to: "/settings", icon: FaCog, label: "Settings", color: "text-gray-500" }
                    ].map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="flex items-center gap-3 p-3 hover:bg-base-200 rounded-xl transition-all duration-300 hover:scale-105 group"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <item.icon className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform duration-300`} />
                        <span className="font-medium">{item.label}</span>
                        <FaChevronDown className="w-3 h-3 ml-auto opacity-50 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    ))}
                    <div className="divider my-2"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 p-3 hover:bg-error/10 rounded-xl w-full text-left text-error transition-all duration-300 hover:scale-105 group"
                    >
                      <FaSignOutAlt className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Guest User Actions */
          <div className="hidden lg:flex gap-2">
            <Link to="/login" className="btn btn-ghost hover:scale-105 transition-transform duration-300">
              <FaSignInAlt className="mr-2" />
              Login
            </Link>
            <Link to="/register" className="btn btn-primary hover:scale-105 transition-transform duration-300 shadow-lg">
              <FaUserPlus className="mr-2" />
              Register
            </Link>
          </div>
        )}

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button
            className="btn btn-ghost btn-circle hover:scale-110 transition-transform duration-300 mobile-menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? 
              <FaTimes className="h-6 w-6" /> : 
              <FaBars className="h-6 w-6" />
            }
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu lg:hidden absolute top-full left-0 right-0 bg-base-100/95 backdrop-blur-lg shadow-2xl border-t border-base-300 z-40 animate-fade-in">
          <div className="p-6">
            {/* Mobile Search */}
            <div className="form-control mb-6">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Search donors..."
                  className="input input-bordered w-full focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                />
                <button 
                  className="btn btn-square btn-primary hover:scale-105 transition-transform duration-300"
                  onClick={handleSearch}
                >
                  <FaSearch />
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="space-y-2 mb-6">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center gap-3 p-4 rounded-xl transition-all duration-300 hover:scale-105
                      ${isActive(item.path)
                        ? 'bg-gradient-to-r from-primary to-primary-focus text-primary-content shadow-lg'
                        : item.highlight
                          ? 'bg-gradient-to-r from-error to-error-focus text-error-content'
                          : 'hover:bg-base-200'
                      }
                    `}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="divider"></div>

            {/* Mobile Theme Toggle */}
            <button
              onClick={() => { toggleTheme(); setIsMenuOpen(false); }}
              className="flex items-center gap-3 p-4 hover:bg-base-200 rounded-xl w-full transition-all duration-300 hover:scale-105"
            >
              {isDarkMode ? (
                <>
                  <FaSun className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">Light Mode</span>
                </>
              ) : (
                <>
                  <FaMoon className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Dark Mode</span>
                </>
              )}
            </button>

            {currentUser ? (
              <div className="space-y-2 mt-4">
                <div className="p-4 bg-gradient-to-r from-primary/10 to-primary-focus/10 rounded-xl border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-gradient-to-br from-primary to-primary-focus text-primary-content rounded-full w-12">
                        <span className="font-bold">
                          {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="font-bold">{currentUser.displayName || 'User'}</p>
                      <p className="text-sm text-base-content/70">{currentUser.email}</p>
                    </div>
                  </div>
                </div>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 p-4 hover:bg-base-200 rounded-xl transition-all duration-300 hover:scale-105"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaTachometerAlt className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Dashboard</span>
                </Link>
                <button
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="flex items-center gap-3 p-4 hover:bg-error/10 rounded-xl w-full text-left text-error transition-all duration-300 hover:scale-105"
                >
                  <FaSignOutAlt className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 mt-4">
                <Link
                  to="/login"
                  className="flex items-center gap-3 p-4 hover:bg-base-200 rounded-xl transition-all duration-300 hover:scale-105"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaSignInAlt className="w-5 h-5" />
                  <span className="font-medium">Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary to-primary-focus text-primary-content rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUserPlus className="w-5 h-5" />
                  <span className="font-medium">Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

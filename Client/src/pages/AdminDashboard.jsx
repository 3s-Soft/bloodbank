import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaTint, 
  FaCalendarAlt, 
  FaHandHoldingHeart,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaDownload,
  FaChartBar,
  FaBell,
  FaUserShield,
  FaCog,
  FaSearch,
  FaFilter,
  FaUserPlus,
  FaSave,
  FaTimes,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/api';
import Swal from 'sweetalert2';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonors: 0,
    activeRequests: 0,
    upcomingEvents: 0,
    totalDonations: 0,
    livesSaved: 0
  });

  // Data states
  const [users, setUsers] = useState([]);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // UI states
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form data for adding/editing users
  const [userFormData, setUserFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    bloodType: '',
    city: '',
    age: '',
    gender: '',
    role: 'donor',
    isAvailable: true
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const cities = ['Chittagong', 'Dhaka', 'Sylhet', 'Rajshahi', 'Barisal', 'Khulna', 'Rangpur'];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load all data
      const [statsData, usersData, requestsData, eventsData] = await Promise.all([
        ApiService.getStatistics().catch(() => ({
          totalUsers: 156,
          totalDonors: 89,
          activeRequests: 12,
          upcomingEvents: 4,
          totalDonations: 234,
          livesSaved: 702
        })),
        ApiService.getUsers().catch(() => mockUsers),
        ApiService.getBloodRequests().catch(() => mockRequests),
        ApiService.getEvents().catch(() => mockEvents)
      ]);

      setStats(statsData);
      setUsers(usersData);
      setBloodRequests(requestsData);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for fallback
  const mockUsers = [
    { id: 1, fullName: 'Ahmed Rahman', email: 'ahmed@example.com', phone: '+880 1712345678', bloodType: 'O+', city: 'Chittagong', role: 'donor', isAvailable: true, totalDonations: 5 },
    { id: 2, fullName: 'Fatima Khan', email: 'fatima@example.com', phone: '+880 1823456789', bloodType: 'A+', city: 'Dhaka', role: 'recipient', isAvailable: false, totalDonations: 0 },
    { id: 3, fullName: 'Mohammad Ali', email: 'ali@example.com', phone: '+880 1934567890', bloodType: 'B+', city: 'Sylhet', role: 'both', isAvailable: true, totalDonations: 8 }
  ];

  const mockRequests = [
    { id: 1, patientName: 'John Doe', bloodType: 'O+', units: 2, urgency: 'emergency', hospital: { name: 'Chittagong Medical College', city: 'Chittagong' }, status: 'active', createdAt: '2024-06-20' },
    { id: 2, patientName: 'Jane Smith', bloodType: 'A-', units: 1, urgency: 'urgent', hospital: { name: 'Dhaka Medical College', city: 'Dhaka' }, status: 'fulfilled', createdAt: '2024-06-19' }
  ];

  const mockEvents = [
    { id: 1, title: 'Blood Donation Camp', date: '2024-06-25', location: 'Chittagong University', targetDonors: 50, registeredDonors: 23, status: 'upcoming' },
    { id: 2, title: 'Emergency Blood Drive', date: '2024-06-22', location: 'Medical College', targetDonors: 30, registeredDonors: 28, status: 'upcoming' }
  ];

  const handleAddUser = async () => {
    try {
      const newUser = {
        ...userFormData,
        createdAt: new Date().toISOString(),
        totalDonations: 0
      };

      // Here you would call your API
      console.log('Adding user:', newUser);
      
      // For demo, just add to local state
      setUsers(prev => [...prev, { ...newUser, id: Date.now() }]);
      
      Swal.fire({
        title: 'Success!',
        text: 'User added successfully.',
        icon: 'success',
        confirmButtonColor: '#ef4444'
      });

      setShowAddUserModal(false);
      resetUserForm();
    } catch (error) {
      console.error('Error adding user:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to add user. Please try again.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      bloodType: user.bloodType || '',
      city: user.city || '',
      age: user.age || '',
      gender: user.gender || '',
      role: user.role || 'donor',
      isAvailable: user.isAvailable !== false
    });
    setShowAddUserModal(true);
  };

  const handleDeleteUser = (userId) => {
    Swal.fire({
      title: 'Delete User?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444'
    }).then((result) => {
      if (result.isConfirmed) {
        setUsers(prev => prev.filter(user => user.id !== userId));
        Swal.fire('Deleted!', 'User has been deleted.', 'success');
      }
    });
  };

  const resetUserForm = () => {
    setUserFormData({
      fullName: '',
      email: '',
      phone: '',
      bloodType: '',
      city: '',
      age: '',
      gender: '',
      role: 'donor',
      isAvailable: true
    });
    setSelectedUser(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || user.role === filterType;
    return matchesSearch && matchesFilter;
  });

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'emergency': return 'badge-error';
      case 'urgent': return 'badge-warning';
      default: return 'badge-info';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'fulfilled': return 'badge-info';
      case 'expired': return 'badge-error';
      default: return 'badge-ghost';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartBar },
    { id: 'users', label: 'Users', icon: FaUsers },
    { id: 'requests', label: 'Blood Requests', icon: FaHandHoldingHeart },
    { id: 'events', label: 'Events', icon: FaCalendarAlt },
    { id: 'notifications', label: 'Notifications', icon: FaBell }
  ];

  return (
    <div className="min-h-screen bg-base-100 transition-colors duration-300">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-primary to-primary-focus text-primary-content p-4 sm:p-6">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold flex items-center gap-2 sm:gap-3">
                <FaUserShield className="text-3xl sm:text-4xl" />
                <span className="break-words">Admin Dashboard</span>
              </h1>
              <p className="mt-2 opacity-90 text-sm sm:text-base">
                Welcome back, <span className="font-medium">{currentUser?.displayName || 'Administrator'}</span>. Manage your blood bank system.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="stats bg-base-100/10 backdrop-blur-sm shadow-lg">
                <div className="stat p-3 sm:p-4">
                  <div className="stat-title text-primary-content/70 text-xs sm:text-sm">System Status</div>
                  <div className="stat-value text-success text-lg sm:text-xl">Online</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-base-200 border-b transition-colors duration-300">
        <div className="container mx-auto">
          <div className="overflow-x-auto">
            <div className="tabs tabs-boxed bg-transparent p-3 sm:p-4 min-w-max">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`tab tab-sm sm:tab-md lg:tab-lg gap-1 sm:gap-2 transition-all duration-300 ${
                      activeTab === tab.id ? 'tab-active' : ''
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <IconComponent className="text-sm sm:text-base" />
                    <span className="hidden xs:inline sm:text-sm lg:text-base">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: FaUsers, color: 'text-primary' },
                { label: 'Total Donors', value: stats.totalDonors, icon: FaTint, color: 'text-error' },
                { label: 'Active Requests', value: stats.activeRequests, icon: FaHandHoldingHeart, color: 'text-warning' },
                { label: 'Upcoming Events', value: stats.upcomingEvents, icon: FaCalendarAlt, color: 'text-info' },
                { label: 'Total Donations', value: stats.totalDonations, icon: FaPlus, color: 'text-success' },
                { label: 'Lives Saved', value: stats.livesSaved, icon: FaCheck, color: 'text-accent' }
              ].map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="card bg-base-100 shadow-xl">
                    <div className="card-body p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-70">{stat.label}</p>
                          <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                        <IconComponent className={`text-3xl ${stat.color}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-primary">Recent Blood Requests</h2>
                  <div className="space-y-3">
                    {bloodRequests.slice(0, 5).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                        <div>
                          <p className="font-medium">{request.patientName}</p>
                          <p className="text-sm opacity-70">{request.bloodType} • {request.units} units</p>
                        </div>
                        <div className="text-right">
                          <div className={`badge ${getUrgencyColor(request.urgency)}`}>
                            {request.urgency}
                          </div>
                          <p className="text-xs opacity-70 mt-1">{request.createdAt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-success">Recent Users</h2>
                  <div className="space-y-3">
                    {users.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-primary text-primary-content rounded-full w-10">
                              <span className="text-sm">{user.fullName?.charAt(0) || 'U'}</span>
                            </div>
                          </div>
                          <div>
                            <p className="font-medium">{user.fullName}</p>
                            <p className="text-sm opacity-70">{user.bloodType} • {user.city}</p>
                          </div>
                        </div>
                        <div className="badge badge-outline">{user.role}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* User Management Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">User Management</h2>
                <p className="text-base-content/70">Manage donors, recipients, and system users</p>
              </div>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="btn btn-primary"
              >
                <FaUserPlus className="mr-2" />
                Add New User
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="form-control flex-1">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="input input-bordered w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn btn-square btn-primary">
                    <FaSearch />
                  </button>
                </div>
              </div>
              <div className="form-control">
                <select
                  className="select select-bordered"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Users</option>
                  <option value="donor">Donors</option>
                  <option value="recipient">Recipients</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Contact</th>
                    <th>Blood Type</th>
                    <th>Location</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Donations</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-primary text-primary-content rounded-full w-10">
                              <span className="text-sm">{user.fullName?.charAt(0) || 'U'}</span>
                            </div>
                          </div>
                          <div>
                            <div className="font-bold">{user.fullName}</div>
                            <div className="text-sm opacity-50">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{user.phone}</td>
                      <td>
                        <span className="badge badge-error">{user.bloodType}</span>
                      </td>
                      <td>{user.city}</td>
                      <td>
                        <span className="badge badge-outline">{user.role}</span>
                      </td>
                      <td>
                        <span className={`badge ${user.isAvailable ? 'badge-success' : 'badge-error'}`}>
                          {user.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td>{user.totalDonations || 0}</td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="btn btn-ghost btn-xs"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="btn btn-ghost btn-xs text-error"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Blood Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Blood Requests Management</h2>
              <div className="flex gap-2">
                <button className="btn btn-outline">
                  <FaDownload className="mr-2" />
                  Export
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Blood Type</th>
                    <th>Units</th>
                    <th>Urgency</th>
                    <th>Hospital</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bloodRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="font-medium">{request.patientName}</td>
                      <td>
                        <span className="badge badge-error">{request.bloodType}</span>
                      </td>
                      <td>{request.units}</td>
                      <td>
                        <span className={`badge ${getUrgencyColor(request.urgency)}`}>
                          {request.urgency}
                        </span>
                      </td>
                      <td>
                        <div>
                          <div className="font-medium">{request.hospital?.name}</div>
                          <div className="text-sm opacity-70">{request.hospital?.city}</div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td>{request.createdAt}</td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-ghost btn-xs">
                            <FaEye />
                          </button>
                          <button className="btn btn-ghost btn-xs">
                            <FaEdit />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Events Management</h2>
              <button className="btn btn-primary">
                <FaPlus className="mr-2" />
                Create Event
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {events.map((event) => (
                <div key={event.id} className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h3 className="card-title">{event.title}</h3>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2">
                        <FaCalendarAlt className="text-primary" />
                        {event.date}
                      </p>
                      <p className="flex items-center gap-2">
                        <FaUsers className="text-success" />
                        {event.location}
                      </p>
                      <div className="flex justify-between">
                        <span>Progress:</span>
                        <span>{event.registeredDonors}/{event.targetDonors} donors</span>
                      </div>
                      <progress 
                        className="progress progress-primary w-full" 
                        value={event.registeredDonors} 
                        max={event.targetDonors}
                      ></progress>
                    </div>
                    <div className="card-actions justify-end mt-4">
                      <button className="btn btn-ghost btn-sm">
                        <FaEdit />
                      </button>
                      <button className="btn btn-ghost btn-sm text-error">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">System Notifications</h2>
              <button className="btn btn-primary">
                <FaPlus className="mr-2" />
                Send Notification
              </button>
            </div>

            <div className="alert alert-info">
              <FaBell className="stroke-current shrink-0 h-6 w-6" />
              <div>
                <h3 className="font-bold">Notification Center</h3>
                <div className="text-xs">Manage system-wide notifications and alerts</div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <p className="text-center py-8 text-base-content/70">
                  Notification management interface coming soon...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit User Modal */}
      {showAddUserModal && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              {selectedUser ? 'Edit User' : 'Add New User'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Full Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={userFormData.fullName}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Phone</span>
                </label>
                <input
                  type="tel"
                  className="input input-bordered"
                  value={userFormData.phone}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+880 1XXXXXXXXX"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Blood Type</span>
                </label>
                <select
                  className="select select-bordered"
                  value={userFormData.bloodType}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, bloodType: e.target.value }))}
                >
                  <option value="">Select Blood Type</option>
                  {bloodTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">City</span>
                </label>
                <select
                  className="select select-bordered"
                  value={userFormData.city}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, city: e.target.value }))}
                >
                  <option value="">Select City</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Age</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={userFormData.age}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="Enter age"
                  min="18"
                  max="65"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Gender</span>
                </label>
                <select
                  className="select select-bordered"
                  value={userFormData.gender}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, gender: e.target.value }))}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Role</span>
                </label>
                <select
                  className="select select-bordered"
                  value={userFormData.role}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, role: e.target.value }))}
                >
                  <option value="donor">Donor</option>
                  <option value="recipient">Recipient</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div className="form-control md:col-span-2">
                <label className="label cursor-pointer justify-start gap-4">
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={userFormData.isAvailable}
                    onChange={(e) => setUserFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                  />
                  <span className="label-text">Available for donation</span>
                </label>
              </div>
            </div>

            <div className="modal-action">
              <button
                onClick={() => {
                  setShowAddUserModal(false);
                  resetUserForm();
                }}
                className="btn btn-ghost"
              >
                <FaTimes className="mr-2" />
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="btn btn-primary"
              >
                <FaSave className="mr-2" />
                {selectedUser ? 'Update' : 'Add'} User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

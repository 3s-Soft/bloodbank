import React, { useState, useEffect } from 'react';
import { FaUser, FaTint, FaCalendarAlt, FaEdit, FaHistory, FaAward, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [donationHistory, setDonationHistory] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock user profile data
  const mockProfile = {
    id: 1,
    name: currentUser?.displayName || 'John Doe',
    email: currentUser?.email || 'john.doe@email.com',
    phone: '+880 1712345678',
    bloodType: 'O+',
    age: 28,
    weight: 75,
    city: 'Chittagong',
    address: 'Nasirabad, Chittagong',
    role: 'donor',
    joinDate: '2024-01-15',
    lastDonation: '2024-11-20',
    nextEligibleDate: '2025-02-20',
    totalDonations: 8,
    profileComplete: 85,
    isAvailable: true,
    healthStatus: 'Excellent'
  };

  // Mock donation history
  const mockDonationHistory = [
    {
      id: 1,
      date: '2024-11-20',
      type: 'Whole Blood',
      location: 'Chittagong Medical College',
      recipient: 'Emergency Patient',
      units: 1,
      status: 'Completed'
    },
    {
      id: 2,
      date: '2024-08-15',
      type: 'Platelets',
      location: 'Apollo Hospital',
      recipient: 'Cancer Patient',
      units: 1,
      status: 'Completed'
    },
    {
      id: 3,
      date: '2024-05-10',
      type: 'Whole Blood',
      location: 'Hope Foundation',
      recipient: 'Accident Victim',
      units: 1,
      status: 'Completed'
    }
  ];

  // Mock blood requests
  const mockRequests = [
    {
      id: 1,
      patientName: 'Ahmed Rahman',
      bloodType: 'O+',
      units: 2,
      urgency: 'Emergency',
      hospital: 'Chittagong Medical College',
      requestDate: '2024-12-18',
      status: 'Active'
    },
    {
      id: 2,
      patientName: 'Fatima Khan',
      bloodType: 'O+',
      units: 1,
      urgency: 'Urgent',
      hospital: 'Apollo Hospital',
      requestDate: '2024-12-15',
      status: 'Fulfilled'
    }
  ];

  const updateAvailability = () => {
    const newStatus = !userProfile.isAvailable;
    setUserProfile(prev => ({ ...prev, isAvailable: newStatus }));
    
    Swal.fire({
      title: 'Availability Updated',
      text: `You are now ${newStatus ? 'available' : 'unavailable'} for blood donation.`,
      icon: 'success',
      confirmButtonColor: '#ef4444'
    });
  };

  const editProfile = () => {
    Swal.fire({
      title: 'Edit Profile',
      text: 'Profile editing functionality will be available soon.',
      icon: 'info',
      confirmButtonColor: '#ef4444'
    });
  };

  const getDaysUntilEligible = () => {
    const nextDate = new Date(userProfile.nextEligibleDate);
    const today = new Date();
    const diffTime = nextDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency.toLowerCase()) {
      case 'emergency':
        return 'badge-error';
      case 'urgent':
        return 'badge-warning';
      case 'normal':
        return 'badge-success';
      default:
        return 'badge-neutral';
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'badge-primary';
      case 'fulfilled':
        return 'badge-success';
      case 'expired':
        return 'badge-error';
      default:
        return 'badge-neutral';
    }
  };

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setUserProfile(mockProfile);
      setDonationHistory(mockDonationHistory);
      setRequests(mockRequests);
      setLoading(false);
    }, 1000);
  }, [currentUser, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Profile not found</h1>
          <p>Please complete your registration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
            <p className="text-base-content/70">Manage your blood donation profile and history</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="card-title">
                      <FaUser className="mr-2" />
                      Profile
                    </h2>
                    <button onClick={editProfile} className="btn btn-ghost btn-sm">
                      <FaEdit />
                    </button>
                  </div>

                  <div className="text-center mb-6">
                    <div className="avatar placeholder mb-4">
                      <div className="bg-primary text-primary-content rounded-full w-20">
                        <span className="text-2xl">{userProfile.name.charAt(0)}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold">{userProfile.name}</h3>
                    <p className="text-base-content/70 capitalize">{userProfile.role}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <FaTint className="mr-3 text-red-500" />
                      <span className="font-semibold text-lg">{userProfile.bloodType}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <FaEnvelope className="mr-3 text-blue-500" />
                      <span className="text-sm">{userProfile.email}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <FaPhone className="mr-3 text-green-500" />
                      <span className="text-sm">{userProfile.phone}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="mr-3 text-purple-500" />
                      <span className="text-sm">{userProfile.city}</span>
                    </div>
                  </div>

                  <div className="divider"></div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{userProfile.totalDonations}</div>
                      <div className="text-sm text-base-content/70">Total Donations</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-secondary">{userProfile.profileComplete}%</div>
                      <div className="text-sm text-base-content/70">Profile Complete</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Availability Status</span>
                      <button
                        onClick={updateAvailability}
                        className={`btn btn-sm ${userProfile.isAvailable ? 'btn-success' : 'btn-error'}`}
                      >
                        {userProfile.isAvailable ? 'Available' : 'Unavailable'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Donation Stats */}
              <div className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body">
                  <h3 className="card-title">
                    <FaAward className="mr-2" />
                    Donation Stats
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Last Donation</span>
                        <span>{new Date(userProfile.lastDonation).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Next Eligible</span>
                        <span>{new Date(userProfile.nextEligibleDate).toLocaleDateString()}</span>
                      </div>
                      <div className="text-xs text-base-content/70">
                        {getDaysUntilEligible() > 0 
                          ? `${getDaysUntilEligible()} days remaining`
                          : 'Eligible now!'
                        }
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Health Status</span>
                        <span className="badge badge-success">{userProfile.healthStatus}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Recent Requests */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">
                    <FaTint className="mr-2" />
                    Recent Blood Requests
                  </h2>
                  
                  <div className="overflow-x-auto">
                    <table className="table table-zebra">
                      <thead>
                        <tr>
                          <th>Patient</th>
                          <th>Blood Type</th>
                          <th>Urgency</th>
                          <th>Hospital</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map(request => (
                          <tr key={request.id}>
                            <td>{request.patientName}</td>
                            <td>
                              <span className="badge badge-error">{request.bloodType}</span>
                            </td>
                            <td>
                              <span className={`badge ${getUrgencyColor(request.urgency)}`}>
                                {request.urgency}
                              </span>
                            </td>
                            <td>{request.hospital}</td>
                            <td>
                              <span className={`badge ${getStatusColor(request.status)}`}>
                                {request.status}
                              </span>
                            </td>
                            <td>
                              {request.status === 'Active' && (
                                <button className="btn btn-primary btn-xs">
                                  Respond
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Donation History */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">
                    <FaHistory className="mr-2" />
                    Donation History
                  </h2>
                  
                  <div className="timeline timeline-vertical">
                    {donationHistory.map((donation, index) => (
                      <div key={donation.id} className="timeline-item">
                        <div className="timeline-start timeline-box">
                          <div className="text-sm font-semibold">{new Date(donation.date).toLocaleDateString()}</div>
                          <div className="text-xs text-base-content/70">{donation.type}</div>
                        </div>
                        <div className="timeline-middle">
                          <FaTint className="text-red-500" />
                        </div>
                        <div className="timeline-end timeline-box">
                          <div className="font-medium">{donation.location}</div>
                          <div className="text-sm text-base-content/70">
                            For: {donation.recipient} • {donation.units} unit(s)
                          </div>
                          <span className="badge badge-success badge-sm">{donation.status}</span>
                        </div>
                        {index < donationHistory.length - 1 && <hr />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content shadow-xl">
                <div className="card-body">
                  <h2 className="card-title mb-4">Quick Actions</h2>
                  <div className="flex flex-wrap gap-4">
                    <button className="btn btn-accent">
                      <FaTint className="mr-2" />
                      Donate Blood
                    </button>
                    <button className="btn btn-accent btn-outline">
                      <FaCalendarAlt className="mr-2" />
                      Schedule Donation
                    </button>
                    <button className="btn btn-accent btn-outline">
                      <FaUser className="mr-2" />
                      Update Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

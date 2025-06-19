import React, { useState, useEffect } from 'react';
import { FaUser, FaEdit, FaSave, FaTimes, FaTint, FaMapMarkerAlt, FaPhone, FaEnvelope, FaCalendarAlt, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';

const Profile = () => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    bloodType: '',
    city: '',
    age: '',
    gender: '',
    address: '',
    emergencyContact: '',
    lastDonation: '',
    totalDonations: 0,
    availability: true
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    if (currentUser) {
      setProfileData(prev => ({
        ...prev,
        fullName: currentUser.displayName || '',
        email: currentUser.email || '',
        // Initialize with sample data for demo
        phone: '+880 1712345678',
        bloodType: 'O+',
        city: 'Chittagong',
        age: '25',
        gender: 'Male',
        address: 'Agrabad, Chittagong',
        emergencyContact: '+880 1987654321',
        lastDonation: '2024-03-15',
        totalDonations: 5
      }));
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    try {
      // Here you would typically save to your backend
      console.log('Saving profile data:', profileData);
      
      Swal.fire({
        title: 'Success!',
        text: 'Profile updated successfully.',
        icon: 'success',
        confirmButtonColor: '#ef4444'
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update profile. Please try again.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data if needed
  };

  const calculateProfileCompletion = () => {
    const requiredFields = ['fullName', 'email', 'phone', 'bloodType', 'city', 'age'];
    const completedFields = requiredFields.filter(field => profileData[field]);
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  return (
    <div className="min-h-screen bg-base-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">User Profile</h1>
            <p className="text-lg text-base-content/70">
              Manage your personal information and donation preferences
            </p>
          </div>

          {/* Profile Completion */}
          <div className="card bg-base-100 shadow-xl mb-8">
            <div className="card-body">
              <h2 className="card-title text-primary mb-4">Profile Completion</h2>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Profile Completion</span>
                    <span>{profileCompletion}%</span>
                  </div>
                  <progress 
                    className="progress progress-primary w-full" 
                    value={profileCompletion} 
                    max="100"
                  ></progress>
                </div>
                <div className="radial-progress text-primary" style={{ "--value": profileCompletion }}>
                  {profileCompletion}%
                </div>
              </div>
              <p className="text-sm text-base-content/70 mt-2">
                Complete your profile to help us match you with blood requests better.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Picture & Basic Info */}
            <div className="lg:col-span-1">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body items-center text-center">
                  <div className="avatar placeholder mb-4">
                    <div className="bg-gradient-to-br from-primary to-primary-focus text-primary-content rounded-full w-32">
                      <span className="text-4xl font-bold">
                        {profileData.fullName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold">{profileData.fullName || 'User'}</h3>
                  <p className="text-base-content/70">{profileData.email}</p>
                  
                  {profileData.bloodType && (
                    <div className="badge badge-error badge-lg mt-2">
                      <FaTint className="mr-1" />
                      {profileData.bloodType}
                    </div>
                  )}
                  
                  <div className="stats stats-vertical shadow mt-4 w-full">
                    <div className="stat">
                      <div className="stat-title">Total Donations</div>
                      <div className="stat-value text-primary">{profileData.totalDonations}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Lives Saved</div>
                      <div className="stat-value text-success">{profileData.totalDonations * 3}</div>
                    </div>
                  </div>

                  <div className="form-control w-full mt-4">
                    <label className="label cursor-pointer">
                      <span className="label-text">Available for donation</span>
                      <input 
                        type="checkbox" 
                        name="availability"
                        checked={profileData.availability}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="toggle toggle-primary" 
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="card-title">
                      <FaUser className="mr-2" />
                      Personal Information
                    </h2>
                    {!isEditing ? (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="btn btn-primary btn-sm"
                      >
                        <FaEdit className="mr-2" />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={handleSave}
                          className="btn btn-success btn-sm"
                        >
                          <FaSave className="mr-2" />
                          Save
                        </button>
                        <button 
                          onClick={handleCancel}
                          className="btn btn-ghost btn-sm"
                        >
                          <FaTimes className="mr-2" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Full Name</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={profileData.fullName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="input input-bordered"
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Email */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Email</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        disabled={true} // Email usually shouldn't be editable
                        className="input input-bordered"
                        placeholder="Your email address"
                      />
                    </div>

                    {/* Phone */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Phone Number</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="input input-bordered"
                        placeholder="+880 1XXXXXXXXX"
                      />
                    </div>

                    {/* Blood Type */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Blood Type</span>
                      </label>
                      <select
                        name="bloodType"
                        value={profileData.bloodType}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="select select-bordered"
                      >
                        <option value="">Select Blood Type</option>
                        {bloodTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {/* Age */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Age</span>
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={profileData.age}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="input input-bordered"
                        placeholder="Your age"
                        min="18"
                        max="65"
                      />
                    </div>

                    {/* Gender */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Gender</span>
                      </label>
                      <select
                        name="gender"
                        value={profileData.gender}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="select select-bordered"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* City */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">City</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={profileData.city}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="input input-bordered"
                        placeholder="Your city"
                      />
                    </div>

                    {/* Emergency Contact */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Emergency Contact</span>
                      </label>
                      <input
                        type="tel"
                        name="emergencyContact"
                        value={profileData.emergencyContact}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="input input-bordered"
                        placeholder="+880 1XXXXXXXXX"
                      />
                    </div>

                    {/* Address */}
                    <div className="form-control md:col-span-2">
                      <label className="label">
                        <span className="label-text font-medium">Address</span>
                      </label>
                      <textarea
                        name="address"
                        value={profileData.address}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="textarea textarea-bordered"
                        placeholder="Your full address"
                        rows="3"
                      ></textarea>
                    </div>

                    {/* Last Donation */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Last Donation Date</span>
                      </label>
                      <input
                        type="date"
                        name="lastDonation"
                        value={profileData.lastDonation}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="input input-bordered"
                      />
                    </div>
                  </div>

                  {!isEditing && (
                    <div className="alert alert-info mt-6">
                      <FaUserCircle className="stroke-current shrink-0 h-6 w-6" />
                      <div>
                        <h3 className="font-bold">Keep your profile updated!</h3>
                        <div className="text-xs">
                          Updated information helps us connect you with relevant blood requests.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

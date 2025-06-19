import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { FaSearch, FaMapMarkerAlt, FaTint, FaPhone, FaEnvelope, FaFilter, FaUserCheck } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/api';
import Swal from 'sweetalert2';

const FindDonors = () => {
  const [searchFilters, setSearchFilters] = useState({
    bloodType: '',
    city: '',
    availability: 'all'
  });
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const location = useLocation();

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Mock donor data for demonstration
  const mockDonors = [
    {
      id: 1,
      name: 'Ahmed Rahman',
      bloodType: 'O+',
      city: 'Chittagong',
      phone: '+880 1712345678',
      email: 'ahmed.rahman@email.com',
      lastDonation: '2024-03-15',
      availability: 'available',
      donationCount: 12
    },
    {
      id: 2,
      name: 'Fatima Khan',
      bloodType: 'A+',
      city: 'Chittagong',
      phone: '+880 1823456789',
      email: 'fatima.khan@email.com',
      lastDonation: '2024-02-20',
      availability: 'available',
      donationCount: 8
    },
    {
      id: 3,
      name: 'Mohammad Ali',
      bloodType: 'B+',
      city: 'Dhaka',
      phone: '+880 1934567890',
      email: 'mohammad.ali@email.com',
      lastDonation: '2024-04-01',
      availability: 'recently_donated',
      donationCount: 15
    },
    {
      id: 4,
      name: 'Rashida Begum',
      bloodType: 'AB+',
      city: 'Chittagong',
      phone: '+880 1545678901',
      email: 'rashida.begum@email.com',
      lastDonation: '2024-01-10',
      availability: 'available',
      donationCount: 6
    },
    {
      id: 5,
      name: 'Karim Hassan',
      bloodType: 'O-',
      city: 'Sylhet',
      phone: '+880 1656789012',
      email: 'karim.hassan@email.com',
      lastDonation: '2024-03-25',
      availability: 'available',
      donationCount: 20
    }
  ];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const searchDonors = async () => {
    setLoading(true);
    
    try {
      const filters = {};
      
      if (searchFilters.bloodType) {
        filters.bloodType = searchFilters.bloodType;
      }
      
      if (searchFilters.city) {
        filters.city = searchFilters.city;
      }
      
      if (searchFilters.availability !== 'all') {
        filters.availability = searchFilters.availability;
      }
      
      const response = await ApiService.getUsers(filters);
      
      // Transform the data to match the component's expected format
      const transformedDonors = response.map(user => ({
        id: user._id,
        name: user.fullName || user.displayName || 'Unknown',
        bloodType: user.bloodType,
        city: user.city,
        phone: user.phone,
        email: user.email,
        lastDonation: user.lastDonation || '2024-01-01',
        availability: isUserAvailable(user.lastDonation) ? 'available' : 'recently_donated',
        donationCount: user.totalDonations || 0
      }));
      
      setDonors(transformedDonors);
    } catch (error) {
      console.error('Error fetching donors:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to fetch donors. Please try again.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
      // Fallback to mock data if API fails
      setDonors(mockDonors);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if user is available for donation
  const isUserAvailable = (lastDonationDate) => {
    if (!lastDonationDate) return true;
    
    const lastDonation = new Date(lastDonationDate);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    return lastDonation < threeMonthsAgo;
  };

  const contactDonor = (donor) => {
    if (!currentUser) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please login to contact donors.',
        icon: 'warning',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    Swal.fire({
      title: 'Contact Donor',
      html: `
        <div class="text-left">
          <p><strong>Name:</strong> ${donor.name}</p>
          <p><strong>Blood Type:</strong> ${donor.bloodType}</p>
          <p><strong>Phone:</strong> ${donor.phone}</p>
          <p><strong>Email:</strong> ${donor.email}</p>
          <p><strong>City:</strong> ${donor.city}</p>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Call Now',
      cancelButtonText: 'Send Email',
      confirmButtonColor: '#ef4444'
    }).then((result) => {
      if (result.isConfirmed) {
        window.open(`tel:${donor.phone}`, '_self');
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        window.open(`mailto:${donor.email}?subject=Blood Donation Request&body=Hello ${donor.name}, I found your contact through BloodBank platform and would like to request blood donation. Please let me know if you're available.`, '_blank');
      }
    });
  };

  // Handle URL search parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get('search');
    
    if (searchParam) {
      setSearchFilters(prev => ({
        ...prev,
        city: searchParam
      }));
    }
  }, [location.search]);

  // Initial load and search when filters change
  useEffect(() => {
    searchDonors();
  }, []); // Empty dependency array for initial load only

  return (
    <div className="min-h-screen bg-base-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Find Blood Donors</h1>
            <p className="text-lg text-base-content/70">
              Search for compatible blood donors in your area
            </p>
          </div>

          {/* Search Filters */}
          <div className="card bg-base-100 shadow-xl mb-8">
            <div className="card-body">
              <h2 className="card-title mb-4">
                <FaFilter className="mr-2" />
                Search Filters
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Blood Type</span>
                  </label>
                  <select
                    name="bloodType"
                    value={searchFilters.bloodType}
                    onChange={handleFilterChange}
                    className="select select-bordered w-full"
                  >
                    <option value="">All Blood Types</option>
                    {bloodTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">City</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={searchFilters.city}
                    onChange={handleFilterChange}
                    className="input input-bordered w-full"
                    placeholder="Enter city name"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Availability</span>
                  </label>
                  <select
                    name="availability"
                    value={searchFilters.availability}
                    onChange={handleFilterChange}
                    className="select select-bordered w-full"
                  >
                    <option value="all">All Donors</option>
                    <option value="available">Available Now</option>
                    <option value="recently_donated">Recently Donated</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">&nbsp;</span>
                  </label>
                  <button
                    onClick={searchDonors}
                    className={`btn btn-primary ${loading ? 'loading' : ''}`}
                    disabled={loading}
                  >
                    {loading ? 'Searching...' : (
                      <>
                        <FaSearch className="mr-2" />
                        Search
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">
              Search Results ({donors.length} donors found)
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="loading loading-spinner loading-lg"></div>
            </div>
          ) : donors.length === 0 ? (
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body text-center">
                <h3 className="text-xl font-semibold mb-2">No donors found</h3>
                <p>Try adjusting your search filters to find more donors.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {donors.map(donor => (
                <div key={donor.id} className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="card-title">{donor.name}</h3>
                      <div className={`badge ${
                        donor.availability === 'available' 
                          ? 'badge-success' 
                          : 'badge-warning'
                      }`}>
                        {donor.availability === 'available' ? 'Available' : 'Recently Donated'}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center">
                        <FaTint className="mr-2 text-red-500" />
                        <span className="font-semibold text-lg">{donor.bloodType}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-blue-500" />
                        <span>{donor.city}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <FaUserCheck className="mr-2 text-green-500" />
                        <span>{donor.donationCount} donations</span>
                      </div>
                      
                      <div className="text-sm text-base-content/70">
                        Last donation: {new Date(donor.lastDonation).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="card-actions justify-end mt-4">
                      <button
                        onClick={() => contactDonor(donor)}
                        className="btn btn-primary btn-sm"
                        disabled={donor.availability !== 'available'}
                      >
                        <FaPhone className="mr-2" />
                        Contact
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Emergency Contact */}
          <div className="mt-8 card bg-error text-error-content shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Emergency Blood Request</h3>
              <p>For urgent blood requirements, contact our 24/7 helpline:</p>
              <div className="text-2xl font-bold">+880 1234 567890</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindDonors;

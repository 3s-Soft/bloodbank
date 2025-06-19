import React, { useState } from 'react';
import { FaTint, FaMapMarkerAlt, FaUser, FaPhone, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaSave, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/api';
import Swal from 'sweetalert2';

const BloodRequest = () => {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bloodType: '',
    urgency: '',
    units: 1,
    patientName: '',
    patientAge: '',
    hospital: '',
    city: '',
    contactName: currentUser?.displayName || '',
    contactPhone: '',
    contactEmail: currentUser?.email || '',
    neededBy: '',
    additionalNotes: ''
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels = [
    { value: 'emergency', label: 'Emergency (Within 24 hours)', color: 'text-error', icon: FaExclamationTriangle },
    { value: 'urgent', label: 'Urgent (Within 3 days)', color: 'text-warning', icon: FaInfoCircle },
    { value: 'normal', label: 'Normal (Within 1 week)', color: 'text-success', icon: FaCheckCircle }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Prepare request data
      const requestData = {
        ...formData,
        requesterId: currentUser?.uid,
        status: 'active',
        createdAt: new Date().toISOString(),
        hospital: {
          name: formData.hospital,
          city: formData.city
        }
      };

      // Submit to API
      await ApiService.createBloodRequest(requestData);
      
      Swal.fire({
        title: 'Request Submitted Successfully!',
        text: 'We will search for compatible donors and contact you soon.',
        icon: 'success',
        confirmButtonColor: '#ef4444'
      });

      // Reset form
      setFormData({
        bloodType: '',
        urgency: '',
        units: 1,
        patientName: '',
        patientAge: '',
        hospital: '',
        city: '',
        contactName: currentUser?.displayName || '',
        contactPhone: '',
        contactEmail: currentUser?.email || '',
        neededBy: '',
        additionalNotes: ''
      });

    } catch (error) {
      console.error('Error submitting blood request:', error);
      Swal.fire({
        title: 'Submission Failed',
        text: 'Failed to submit blood request. Please try again.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyIcon = (urgency) => {
    const level = urgencyLevels.find(l => l.value === urgency);
    return level ? level.icon : FaInfoCircle;
  };

  const getUrgencyColor = (urgency) => {
    const level = urgencyLevels.find(l => l.value === urgency);
    return level ? level.color : 'text-base-content';
  };

  return (
    <div className="min-h-screen bg-base-100 transition-colors duration-300 py-4 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <FaTint className="inline-block mr-2 text-red-500" />
              Request Blood
            </h1>
            <p className="text-base sm:text-lg text-base-content/70 max-w-3xl mx-auto">
              Fill out this form to request blood for yourself or someone you know.
              We'll help connect you with compatible donors in your area.
            </p>
          </div>

          {/* Login prompt for non-authenticated users */}
          {!currentUser && (
            <div className="alert alert-warning mb-6">
              <FaInfoCircle className="stroke-current shrink-0 h-6 w-6" />
              <div>
                <h3 className="font-bold">Login Recommended</h3>
                <div className="text-xs">
                  Please login to auto-fill your contact information and track your requests.
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body p-4 sm:p-6 lg:p-8">
              {/* Blood Requirements Section */}
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4 flex items-center">
                  <FaTint className="mr-2 text-red-500" />
                  Blood Requirements
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Units Needed *</span>
                    </label>
                    <input
                      type="number"
                      name="units"
                      value={formData.units}
                      onChange={handleInputChange}
                      min="1"
                      max="10"
                      className="input input-bordered w-full"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Urgency Level *</span>
                    </label>
                    <select
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleInputChange}
                      className="select select-bordered w-full"
                      required
                    >
                      <option value="">Select Urgency</option>
                      {urgencyLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-control mt-4">
                  <label className="label">
                    <span className="label-text font-medium">Needed By Date *</span>
                  </label>
                  <input
                    type="date"
                    name="neededBy"
                    value={formData.neededBy}
                    onChange={handleInputChange}
                    className="input input-bordered w-full max-w-xs"
                    required
                  />
                </div>
              </div>

              {/* Patient Information Section */}
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4 flex items-center">
                  <FaUser className="mr-2 text-blue-500" />
                  Patient Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Patient Name *</span>
                    </label>
                    <input
                      type="text"
                      name="patientName"
                      value={formData.patientName}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                      placeholder="Enter patient's full name"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Patient Age *</span>
                    </label>
                    <input
                      type="number"
                      name="patientAge"
                      value={formData.patientAge}
                      onChange={handleInputChange}
                      min="1"
                      max="120"
                      className="input input-bordered w-full"
                      placeholder="Age"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Location Information Section */}
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-green-500" />
                  Location Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Hospital/Clinic *</span>
                    </label>
                    <input
                      type="text"
                      name="hospital"
                      value={formData.hospital}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                      placeholder="Hospital or clinic name"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">City *</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                      placeholder="City"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4 flex items-center">
                  <FaPhone className="mr-2 text-purple-500" />
                  Contact Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Contact Person Name *</span>
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Phone Number *</span>
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                      placeholder="+880 1234 567890"
                      required
                    />
                  </div>

                  <div className="form-control md:col-span-2">
                    <label className="label">
                      <span className="label-text font-medium">Email Address</span>
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Notes Section */}
              <div className="mb-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Additional Notes</span>
                  </label>
                  <textarea
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleInputChange}
                    className="textarea textarea-bordered h-24"
                    placeholder="Any additional information about the request..."
                  ></textarea>
                </div>
              </div>

              {/* Urgency Display */}
              {formData.urgency && (
                <div className="alert alert-info mb-6">
                  <div className="flex items-center">
                    {React.createElement(getUrgencyIcon(formData.urgency), { 
                      className: `mr-2 ${getUrgencyColor(formData.urgency)}` 
                    })}
                    <div>
                      <h3 className="font-bold">Request Urgency</h3>
                      <div className="text-sm">
                        {urgencyLevels.find(l => l.value === formData.urgency)?.label}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="card-actions justify-center pt-4">
                <button 
                  type="submit" 
                  className={`btn btn-primary btn-lg min-w-64 ${isSubmitting ? 'loading' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="mr-2 animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Submit Blood Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Information Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h3 className="card-title text-primary">What Happens Next?</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>We'll search for compatible donors in your area</li>
                  <li>Donors will be notified about your request</li>
                  <li>We'll contact you when donors respond</li>
                  <li>Coordinate donation logistics with willing donors</li>
                </ul>
              </div>
            </div>

            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h3 className="card-title text-secondary">Emergency Contact</h3>
                <p>For emergency blood requests, call:</p>
                <div className="text-2xl font-bold text-error">+880 1234 567890</div>
                <p className="text-sm">Available 24/7 for critical cases</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodRequest;

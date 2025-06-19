import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaUsers, FaUserPlus, FaInfoCircle, FaPlus } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';

const BloodDrives = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const { currentUser } = useAuth();

  // Mock blood drive events
  const mockEvents = [
    {
      id: 1,
      title: 'Chittagong Medical College Blood Drive',
      description: 'Annual blood donation camp organized by medical students',
      date: '2025-01-15',
      time: '09:00 AM - 05:00 PM',
      location: 'Chittagong Medical College Hospital',
      address: 'Chittagong Medical College Rd, Chittagong',
      organizer: 'Chittagong Medical College',
      expectedDonors: 200,
      registeredDonors: 145,
      status: 'upcoming',
      requirements: ['Age 18-65', 'Weight above 50kg', 'Good health condition'],
      contact: '+880 1712345678'
    },
    {
      id: 2,
      title: 'Hope Foundation Blood Camp',
      description: 'Community blood donation drive for emergency blood bank',
      date: '2025-01-20',
      time: '10:00 AM - 04:00 PM',
      location: 'Hope Foundation Center',
      address: 'Nasirabad, Chittagong',
      organizer: 'Hope Foundation',
      expectedDonors: 100,
      registeredDonors: 67,
      status: 'upcoming',
      requirements: ['Valid ID required', 'Fasting not required', 'Bring water bottle'],
      contact: '+880 1823456789'
    },
    {
      id: 3,
      title: 'University of Chittagong Blood Drive',
      description: 'Student-led initiative for community health',
      date: '2024-12-20',
      time: '08:00 AM - 06:00 PM',
      location: 'University of Chittagong Campus',
      address: 'University of Chittagong, Hathazari',
      organizer: 'Student Blood Donation Society',
      expectedDonors: 300,
      registeredDonors: 298,
      status: 'completed',
      requirements: ['Student/Staff ID', 'Health certificate', 'Registration required'],
      contact: '+880 1934567890'
    },
    {
      id: 4,
      title: 'Corporate Blood Donation Drive',
      description: 'Multi-company blood donation initiative',
      date: '2025-02-01',
      time: '09:00 AM - 03:00 PM',
      location: 'World Trade Center Chittagong',
      address: 'Agrabad Commercial Area, Chittagong',
      organizer: 'Chittagong Chamber of Commerce',
      expectedDonors: 150,
      registeredDonors: 23,
      status: 'upcoming',
      requirements: ['Employee ID', 'Medical clearance', 'Prior registration'],
      contact: '+880 1545678901'
    }
  ];

  const joinEvent = (event) => {
    if (!currentUser) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please login to join blood drive events.',
        icon: 'warning',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    if (event.status !== 'upcoming') {
      Swal.fire({
        title: 'Registration Closed',
        text: 'This event is no longer accepting registrations.',
        icon: 'info',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    Swal.fire({
      title: 'Join Blood Drive',
      html: `
        <div class="text-left space-y-2">
          <p><strong>Event:</strong> ${event.title}</p>
          <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${event.time}</p>
          <p><strong>Location:</strong> ${event.location}</p>
          <div class="mt-4">
            <strong>Requirements:</strong>
            <ul class="list-disc list-inside mt-2">
              ${event.requirements.map(req => `<li>${req}</li>`).join('')}
            </ul>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Join Event',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444'
    }).then((result) => {
      if (result.isConfirmed) {
        // Simulate registration
        setEvents(prevEvents => 
          prevEvents.map(e => 
            e.id === event.id 
              ? { ...e, registeredDonors: e.registeredDonors + 1 }
              : e
          )
        );

        Swal.fire({
          title: 'Registration Successful!',
          text: 'You have been registered for this blood drive. You will receive a confirmation SMS.',
          icon: 'success',
          confirmButtonColor: '#ef4444'
        });
      }
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'upcoming':
        return <div className="badge badge-primary">Upcoming</div>;
      case 'completed':
        return <div className="badge badge-success">Completed</div>;
      case 'cancelled':
        return <div className="badge badge-error">Cancelled</div>;
      default:
        return <div className="badge badge-neutral">Unknown</div>;
    }
  };

  const filteredEvents = events.filter(event => {
    if (filterType === 'all') return true;
    return event.status === filterType;
  });

  const createNewEvent = () => {
    if (!currentUser) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please login to create blood drive events.',
        icon: 'warning',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    Swal.fire({
      title: 'Create New Blood Drive',
      text: 'Contact our team to organize a blood drive in your area.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Contact Team',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444'
    }).then((result) => {
      if (result.isConfirmed) {
        window.open('mailto:events@bloodbank.org?subject=New Blood Drive Request&body=I would like to organize a blood drive event. Please contact me for further details.', '_blank');
      }
    });
  };

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setEvents(mockEvents);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-base-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Blood Drive Events</h1>
            <p className="text-lg text-base-content/70">
              Join community blood donation drives and help save lives
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-outline'}`}
              >
                All Events
              </button>
              <button
                onClick={() => setFilterType('upcoming')}
                className={`btn btn-sm ${filterType === 'upcoming' ? 'btn-primary' : 'btn-outline'}`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setFilterType('completed')}
                className={`btn btn-sm ${filterType === 'completed' ? 'btn-primary' : 'btn-outline'}`}
              >
                Completed
              </button>
            </div>

            <button
              onClick={createNewEvent}
              className="btn btn-primary"
            >
              <FaPlus className="mr-2" />
              Create Event
            </button>
          </div>

          {/* Events List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="loading loading-spinner loading-lg"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredEvents.map(event => (
                <div key={event.id} className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="card-title text-xl">{event.title}</h3>
                          {getStatusBadge(event.status)}
                        </div>
                        
                        <p className="text-base-content/70 mb-4">{event.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <FaCalendarAlt className="mr-2 text-primary" />
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            
                            <div className="flex items-center">
                              <FaClock className="mr-2 text-secondary" />
                              <span>{event.time}</span>
                            </div>
                            
                            <div className="flex items-center">
                              <FaMapMarkerAlt className="mr-2 text-accent" />
                              <div>
                                <div className="font-medium">{event.location}</div>
                                <div className="text-sm text-base-content/70">{event.address}</div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center">
                              <FaUsers className="mr-2 text-info" />
                              <span>
                                {event.registeredDonors}/{event.expectedDonors} registered
                              </span>
                            </div>
                            
                            <div className="text-sm text-base-content/70">
                              Organized by: {event.organizer}
                            </div>
                            
                            <div className="text-sm text-base-content/70">
                              Contact: {event.contact}
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Registration Progress</span>
                            <span>{Math.round((event.registeredDonors / event.expectedDonors) * 100)}%</span>
                          </div>
                          <progress 
                            className="progress progress-primary w-full" 
                            value={event.registeredDonors} 
                            max={event.expectedDonors}
                          ></progress>
                        </div>

                        {/* Requirements */}
                        <div className="collapse collapse-arrow bg-base-200">
                          <input type="checkbox" />
                          <div className="collapse-title text-sm font-medium">
                            <FaInfoCircle className="inline mr-2" />
                            View Requirements & Guidelines
                          </div>
                          <div className="collapse-content">
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              {event.requirements.map((req, index) => (
                                <li key={index}>{req}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => joinEvent(event)}
                          className={`btn ${event.status === 'upcoming' ? 'btn-primary' : 'btn-disabled'}`}
                          disabled={event.status !== 'upcoming'}
                        >
                          <FaUserPlus className="mr-2" />
                          {event.status === 'upcoming' ? 'Join Event' : 'Registration Closed'}
                        </button>
                        
                        <button className="btn btn-outline btn-sm">
                          <FaInfoCircle className="mr-2" />
                          More Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredEvents.length === 0 && (
                <div className="card bg-base-200 shadow-lg">
                  <div className="card-body text-center">
                    <h3 className="text-xl font-semibold mb-2">No events found</h3>
                    <p>No blood drive events match your current filter.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-12 card bg-gradient-to-r from-primary to-secondary text-primary-content shadow-xl">
            <div className="card-body text-center">
              <h3 className="text-2xl font-bold mb-4">Want to Organize a Blood Drive?</h3>
              <p className="mb-6">
                Help your community by organizing a blood donation drive at your workplace, 
                school, or community center. We provide all the support you need.
              </p>
              <button 
                onClick={createNewEvent}
                className="btn btn-accent btn-lg"
              >
                <FaPlus className="mr-2" />
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodDrives;

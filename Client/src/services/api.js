const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body !== 'string') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // ========== USER METHODS ==========
  async getUsers(filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.bloodType) queryParams.append('bloodType', filters.bloodType);
    if (filters.city) queryParams.append('city', filters.city);
    if (filters.availability) queryParams.append('availability', filters.availability);
    
    const endpoint = `/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async getUserById(id) {
    return this.request(`/users/${id}`);
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: userData,
    });
  }

  async updateUser(id, updates) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }

  // ========== BLOOD REQUEST METHODS ==========
  async getBloodRequests(filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.bloodType) queryParams.append('bloodType', filters.bloodType);
    if (filters.urgency) queryParams.append('urgency', filters.urgency);
    
    const endpoint = `/requests${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async createBloodRequest(requestData) {
    return this.request('/requests', {
      method: 'POST',
      body: requestData,
    });
  }

  async updateRequestStatus(id, status) {
    return this.request(`/requests/${id}`, {
      method: 'PUT',
      body: { status },
    });
  }

  // ========== EVENT METHODS ==========
  async getEvents(filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.status) queryParams.append('status', filters.status);
    
    const endpoint = `/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async createEvent(eventData) {
    return this.request('/events', {
      method: 'POST',
      body: eventData,
    });
  }

  async registerForEvent(eventId, userId) {
    return this.request(`/events/${eventId}/register`, {
      method: 'POST',
      body: { userId },
    });
  }

  // ========== NOTIFICATION METHODS ==========
  async getUserNotifications(userId) {
    return this.request(`/notifications/${userId}`);
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  // ========== DONATION HISTORY METHODS ==========
  async getUserDonations(userId) {
    return this.request(`/donations/${userId}`);
  }

  async recordDonation(donationData) {
    return this.request('/donations', {
      method: 'POST',
      body: donationData,
    });
  }

  // ========== STATISTICS METHODS ==========
  async getStatistics() {
    return this.request('/stats');
  }
}

export default new ApiService();

const API_BASE_URL = window.location.origin;

const api = {
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: this.getHeaders()
    });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'login.html';
      return;
    }
    
    return response.json();
  },

  async login(username, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  async getSummary(from, to) {
    let url = '/api/reports/summary';
    if (from && to) {
      url += `?from=${from}&to=${to}`;
    }
    return this.request(url);
  },

  async getAvailableVehicles(type) {
    let url = '/api/bookings/available-vehicles';
    if (type) {
      url += `?type=${type}`;
    }
    return this.request(url);
  },

  async calculateFare(data) {
    return this.request('/api/bookings/calculate-fare', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async createBooking(data) {
    return this.request('/api/bookings/create-booking', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async assignVehicle(bookingId, vehicleId) {
    return this.request('/api/bookings/assign-vehicle', {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId, vehicle_id: vehicleId })
    });
  },

  async getVendors() {
    return this.request('/api/vendors');
  },

  async getVehicles() {
    return this.request('/api/vehicles');
  },

  exportCSV(from, to) {
    let url = `${API_BASE_URL}/api/reports/export/csv`;
    if (from && to) {
      url += `?from=${from}&to=${to}`;
    }
    window.open(url, '_blank');
  },

  exportExcel(from, to) {
    let url = `${API_BASE_URL}/api/reports/export/excel`;
    if (from && to) {
      url += `?from=${from}&to=${to}`;
    }
    window.open(url, '_blank');
  }
};

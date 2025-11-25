// Global State
let currentRange = 'today';
let currentStartDate = null;
let currentEndDate = null;
let charts = {};

// Get API base URL (for Replit proxy)
const API_BASE = window.location.origin + '/api';

// Auth Check
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/dashboard/login.html';
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/dashboard/login.html';
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
  initializeApp();
});

function initializeApp() {
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const page = this.dataset.page;
      navigateToPage(page);
    });
  });

  // Filter controls
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      if (this.dataset.range === 'custom') {
        document.getElementById('customDatePicker').style.display = 'flex';
      } else {
        document.getElementById('customDatePicker').style.display = 'none';
        currentRange = this.dataset.range;
        currentStartDate = null;
        currentEndDate = null;
        
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        loadDashboard();
      }
    });
  });

  // Bookings Filter Events
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) statusFilter.addEventListener('change', loadBookings);
  
  const vehicleFilter = document.getElementById('vehicleFilter');
  if (vehicleFilter) vehicleFilter.addEventListener('change', loadBookings);

  // Theme Toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      document.body.classList.toggle('dark-theme');
      this.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
      localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });
  }

  // Load saved theme
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.textContent = '☀️';
  }

  // Initialize user data
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    const userEl = document.getElementById('currentUser');
    if (userEl) userEl.textContent = userData.username;
  }
  
  const apiUrl = document.getElementById('apiUrl');
  if (apiUrl) apiUrl.value = API_BASE;
  
  const lastUpdated = document.getElementById('lastUpdated');
  if (lastUpdated) lastUpdated.textContent = new Date().toLocaleString();

  // Load initial dashboard
  loadDashboard();
}

function toggleSubmenu(element) {
  const submenu = element.nextElementSibling;
  submenu.style.display = submenu.style.display === 'none' ? 'block' : 'none';
}

function navigateToPage(page) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  
  // Show selected page
  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) {
    pageEl.classList.add('active');
  }

  // Update active nav
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`[data-page="${page}"]`)?.classList.add('active');

  // Load page data
  if (page === 'dashboard') {
    loadDashboard();
  } else if (page === 'bookings') {
    loadBookings();
  } else if (page.startsWith('drivers')) {
    loadDrivers(page.replace('drivers-', ''));
  } else if (page.startsWith('cars')) {
    loadCars(page.replace('cars-', ''));
  }
}

function applyCustomRange() {
  const start = document.getElementById('startDate').value;
  const end = document.getElementById('endDate').value;
  
  if (!start || !end) {
    alert('Please select both dates');
    return;
  }

  currentStartDate = start;
  currentEndDate = end;
  currentRange = 'custom';
  
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.filter-btn')[4].classList.add('active');
  
  loadDashboard();
}

// API Calls
async function fetchStats() {
  try {
    let url = `${API_BASE}/stats/summary?range=${currentRange}`;
    if (currentStartDate && currentEndDate) {
      url = `${API_BASE}/stats/summary?start=${currentStartDate}&end=${currentEndDate}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch stats');
    return await response.json();
  } catch (error) {
    console.error('Stats fetch error:', error);
    return null;
  }
}

async function fetchBookings(filters = {}) {
  try {
    let url = `${API_BASE}/stats/bookings?range=${currentRange}`;
    if (currentStartDate && currentEndDate) {
      url = `${API_BASE}/stats/bookings?start=${currentStartDate}&end=${currentEndDate}`;
    }
    
    if (filters.status) url += `&status=${filters.status}`;
    if (filters.vehicle_type) url += `&vehicle_type=${filters.vehicle_type}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return await response.json();
  } catch (error) {
    console.error('Bookings fetch error:', error);
    return null;
  }
}

async function fetchDrivers() {
  try {
    const response = await fetch(`${API_BASE}/vendors`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch drivers');
    return await response.json();
  } catch (error) {
    console.error('Drivers fetch error:', error);
    return null;
  }
}

async function fetchCars() {
  try {
    const response = await fetch(`${API_BASE}/vehicles`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch cars');
    return await response.json();
  } catch (error) {
    console.error('Cars fetch error:', error);
    return null;
  }
}

// Dashboard Loading
async function loadDashboard() {
  const stats = await fetchStats();
  if (!stats) return;

  const summary = stats.summary || {};
  const trend = stats.trend || [];
  const revenueByType = stats.revenueByType || [];
  const driverStats = stats.driverStats || [];

  // Update Summary Cards
  const el = (id) => document.getElementById(id);
  if (el('stat-bookings')) el('stat-bookings').textContent = summary.total_bookings || 0;
  if (el('stat-completed')) el('stat-completed').textContent = summary.completed_bookings || 0;
  if (el('stat-pending')) el('stat-pending').textContent = summary.pending_bookings || 0;
  if (el('stat-cancelled')) el('stat-cancelled').textContent = summary.cancelled_bookings || 0;
  if (el('stat-revenue')) el('stat-revenue').textContent = `AED ${parseFloat(summary.total_revenue || 0).toFixed(2)}`;
  if (el('stat-cash')) el('stat-cash').textContent = `AED ${parseFloat(summary.cash_revenue || 0).toFixed(2)}`;
  if (el('stat-card')) el('stat-card').textContent = `AED ${parseFloat(summary.card_revenue || 0).toFixed(2)}`;

  // Update Charts
  updateBookingsChart(trend);
  updateRevenueChart(revenueByType);
  updateDriversList(driverStats);
  updateAlerts();
}

// Chart Updates
function updateBookingsChart(data) {
  const ctx = document.getElementById('bookingsChart');
  if (!ctx) return;

  if (charts.bookings) charts.bookings.destroy();

  const labels = data.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  
  charts.bookings = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Total Bookings',
          data: data.map(d => d.bookings),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Completed',
          data: data.map(d => d.completed),
          borderColor: '#34C759',
          backgroundColor: 'rgba(52, 199, 89, 0.1)',
          tension: 0.4,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'top' } },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function updateRevenueChart(data) {
  const ctx = document.getElementById('revenueChart');
  if (!ctx) return;

  if (charts.revenue) charts.revenue.destroy();

  const colors = ['#667eea', '#764ba2', '#f093fb'];
  
  charts.revenue = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.vehicle_type.toUpperCase()),
      datasets: [{
        label: 'Revenue (AED)',
        data: data.map(d => parseFloat(d.revenue)),
        backgroundColor: colors
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function updateDriversList(data) {
  const container = document.getElementById('driversStats');
  if (!container) return;

  if (data.length === 0) {
    container.innerHTML = '<p style="color: var(--text-secondary);">No driver data</p>';
    return;
  }

  container.innerHTML = data.slice(0, 5).map(driver => `
    <div class="driver-stat-item">
      <div class="driver-info">
        <strong>${driver.name}</strong>
        <span class="driver-status ${driver.status}">${driver.status}</span>
      </div>
      <div class="driver-metrics">
        <span>${driver.trips} trips</span>
        <span>AED ${parseFloat(driver.earnings).toFixed(2)}</span>
      </div>
    </div>
  `).join('');
}

function updateAlerts() {
  const container = document.getElementById('alertsList');
  const fullList = document.getElementById('alertsFullList');
  
  const alerts = [
    { type: 'info', message: 'System is running normally' },
    { type: 'success', message: '98% uptime this week' }
  ];

  if (container) {
    container.innerHTML = alerts.map(a => `
      <div class="alert alert-${a.type}">
        <span>${a.message}</span>
      </div>
    `).join('');
  }

  if (fullList) {
    fullList.innerHTML = alerts.map(a => `
      <div class="alert alert-${a.type}">
        <span>${a.message}</span>
      </div>
    `).join('');
  }
}

// Bookings Loading
async function loadBookings() {
  const status = document.getElementById('statusFilter')?.value || '';
  const vehicleType = document.getElementById('vehicleFilter')?.value || '';
  
  const data = await fetchBookings({ status, vehicle_type: vehicleType });
  if (!data) return;

  const tbody = document.getElementById('bookings-table-body');
  if (!tbody) return;

  if (!data.bookings || data.bookings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="13" style="text-align: center;">No bookings found</td></tr>';
    return;
  }

  tbody.innerHTML = data.bookings.map(b => `
    <tr>
      <td>#${b.id}</td>
      <td>${b.customer_name}</td>
      <td>${b.customer_phone}</td>
      <td>${b.pickup_location || '-'}</td>
      <td>${b.dropoff_location || '-'}</td>
      <td>${b.distance_km}</td>
      <td><span class="badge badge-${b.vehicle_type}">${b.vehicle_type}</span></td>
      <td>AED ${b.fare_aed}</td>
      <td>AED ${b.fare_aed}</td>
      <td>${b.driver_name || '-'}</td>
      <td>${b.payment_method || '-'}</td>
      <td><span class="badge badge-${b.status}">${b.status}</span></td>
      <td>${new Date(b.created_at).toLocaleDateString()}</td>
    </tr>
  `).join('');
}

// Drivers Loading
async function loadDrivers(filter = 'all') {
  const data = await fetchDrivers();
  if (!data) return;

  const tbody = document.getElementById('drivers-table-body');
  if (!tbody) return;

  let drivers = data.vendors || [];

  if (filter === 'online') drivers = drivers.filter(d => d.status === 'online');
  if (filter === 'offline') drivers = drivers.filter(d => d.status === 'offline');

  if (drivers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No drivers found</td></tr>';
    return;
  }

  tbody.innerHTML = drivers.slice(0, 10).map(d => `
    <tr>
      <td>#${d.id}</td>
      <td>${d.name || 'N/A'}</td>
      <td>${d.phone || 'N/A'}</td>
      <td><span class="badge badge-${d.status || 'offline'}">${d.status || 'offline'}</span></td>
      <td>--</td>
      <td>--</td>
      <td>0</td>
      <td><button class="btn btn-small" onclick="alert('View driver details')">View</button></td>
    </tr>
  `).join('');
}

// Cars Loading
async function loadCars(filter = 'all') {
  const data = await fetchCars();
  if (!data) return;

  const container = document.getElementById('carsGrid');
  if (!container) return;

  let vehicles = data.vehicles || [];

  if (filter && filter !== 'all') {
    vehicles = vehicles.filter(v => v.vehicle_type === filter);
  }

  if (vehicles.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No vehicles found</p>';
    return;
  }

  container.innerHTML = `<div class="table-container"><table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Plate</th>
        <th>Model</th>
        <th>Type</th>
        <th>Status</th>
        <th>Driver</th>
      </tr>
    </thead>
    <tbody>
      ${vehicles.map(v => `
        <tr>
          <td>#${v.id}</td>
          <td>${v.license_plate || '-'}</td>
          <td>${v.model || '-'}</td>
          <td><span class="badge badge-${v.vehicle_type}">${v.vehicle_type}</span></td>
          <td><span class="badge badge-${v.status || 'available'}">${v.status || 'available'}</span></td>
          <td>--</td>
        </tr>
      `).join('')}
    </tbody>
  </table></div>`;
}

// Export
function exportBookings(format) {
  alert(`Export ${format.toUpperCase()} feature coming soon`);
}

// Fare Calculator
function calculateTestFare() {
  const distance = parseFloat(document.getElementById('calcDistance').value) || 10;
  const vehicleType = document.getElementById('calcVehicleType').value;
  const bookingType = document.getElementById('calcType').value;

  const rates = {
    sedan: { km: 3.5, hourly: 75 },
    suv: { km: 4.5, hourly: 90 },
    luxury: { km: 6.5, hourly: 150 }
  };

  let fare = 5; // Base fare
  if (bookingType === 'point-to-point') {
    fare += distance * rates[vehicleType].km;
  } else {
    const minHours = 2;
    fare = rates[vehicleType].hourly * minHours;
  }

  document.getElementById('calcResult').textContent = `Result: AED ${fare.toFixed(2)}`;
}

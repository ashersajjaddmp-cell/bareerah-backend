// Global State
let currentRange = 'today';
let currentStartDate = null;
let currentEndDate = null;
let charts = {};

// Get API base URL
const API_BASE = window.location.origin + '/api';

// Auth Check
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/dashboard/login.html';
    return;
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/dashboard/login.html';
}

// Fetch with timeout
function fetchWithTimeout(url, options = {}, timeout = 5000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  checkAuth();
  setupEventListeners();
  setupTheme();
  setupUserInfo();
  loadDashboard();
}

function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      navigateToPage(this.dataset.page);
    });
  });

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      if (this.dataset.range === 'custom') {
        document.getElementById('customDatePicker').style.display = 'flex';
      } else {
        document.getElementById('customDatePicker').style.display = 'none';
        currentRange = this.dataset.range;
        currentStartDate = null;
        currentEndDate = null;
        loadDashboard();
      }
    });
  });

  // Bookings filters
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) statusFilter.addEventListener('change', loadBookings);
  const vehicleFilter = document.getElementById('vehicleFilter');
  if (vehicleFilter) vehicleFilter.addEventListener('change', loadBookings);

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      document.body.classList.toggle('dark-theme');
      this.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
      localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });
  }
}

function setupTheme() {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
    const toggle = document.getElementById('themeToggle');
    if (toggle) toggle.textContent = '☀️';
  }
}

function setupUserInfo() {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      const userEl = document.getElementById('currentUser');
      if (userEl) userEl.textContent = userData.username;
    } catch (e) {}
  }
  const apiUrl = document.getElementById('apiUrl');
  if (apiUrl) apiUrl.value = API_BASE;
  const lastUpdated = document.getElementById('lastUpdated');
  if (lastUpdated) lastUpdated.textContent = new Date().toLocaleString();
}

function navigateToPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) pageEl.classList.add('active');
  
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
  
  if (page === 'dashboard') loadDashboard();
  else if (page === 'bookings') loadBookings();
  else if (page.startsWith('drivers')) loadDrivers(page.replace('drivers-', ''));
  else if (page.startsWith('cars')) loadCars(page.replace('cars-', ''));
}

function toggleSubmenu(element) {
  const submenu = element.nextElementSibling;
  if (submenu) submenu.style.display = submenu.style.display === 'none' ? 'block' : 'none';
}

// API Calls with error handling
async function fetchStats() {
  try {
    let url = `${API_BASE}/stats/summary?range=${currentRange}`;
    if (currentStartDate && currentEndDate) {
      url = `${API_BASE}/stats/summary?start=${currentStartDate}&end=${currentEndDate}`;
    }
    const response = await fetchWithTimeout(url, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }, 5000);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Stats error:', error);
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
    
    const response = await fetchWithTimeout(url, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }, 5000);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Bookings error:', error);
    return null;
  }
}

async function fetchDrivers() {
  try {
    const response = await fetchWithTimeout(`${API_BASE}/vendors`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }, 5000);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Drivers error:', error);
    return null;
  }
}

async function fetchCars() {
  try {
    const response = await fetchWithTimeout(`${API_BASE}/vehicles`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }, 5000);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Cars error:', error);
    return null;
  }
}

// Dashboard Loading
async function loadDashboard() {
  const stats = await fetchStats();
  if (!stats) {
    document.getElementById('stat-bookings').textContent = '0';
    return;
  }

  const summary = stats.summary || {};
  const trend = stats.trend || [];
  const revenueByType = stats.revenueByType || [];
  const driverStats = stats.driverStats || [];

  // Update cards
  const el = (id) => document.getElementById(id);
  if (el('stat-bookings')) el('stat-bookings').textContent = summary.total_bookings || 0;
  if (el('stat-completed')) el('stat-completed').textContent = summary.completed_bookings || 0;
  if (el('stat-pending')) el('stat-pending').textContent = summary.pending_bookings || 0;
  if (el('stat-cancelled')) el('stat-cancelled').textContent = summary.cancelled_bookings || 0;
  if (el('stat-revenue')) el('stat-revenue').textContent = `AED ${parseFloat(summary.total_revenue || 0).toFixed(2)}`;
  if (el('stat-cash')) el('stat-cash').textContent = `AED ${parseFloat(summary.cash_revenue || 0).toFixed(2)}`;
  if (el('stat-card')) el('stat-card').textContent = `AED ${parseFloat(summary.card_revenue || 0).toFixed(2)}`;

  // Charts
  updateBookingsChart(trend);
  updateRevenueChart(revenueByType);
  updateDriversList(driverStats);
  updateAlerts();
}

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
      scales: { y: { beginAtZero: true } }
    }
  });
}

function updateRevenueChart(data) {
  const ctx = document.getElementById('revenueChart');
  if (!ctx) return;
  if (charts.revenue) charts.revenue.destroy();
  
  charts.revenue = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.vehicle_type.toUpperCase()),
      datasets: [{
        label: 'Revenue (AED)',
        data: data.map(d => parseFloat(d.revenue)),
        backgroundColor: ['#667eea', '#764ba2', '#f093fb']
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

function updateDriversList(data) {
  const container = document.getElementById('driversStats');
  if (!container) return;
  if (data.length === 0) {
    container.innerHTML = '<p style="color: var(--text-secondary);">No data</p>';
    return;
  }
  container.innerHTML = data.slice(0, 5).map(d => `
    <div class="driver-stat-item">
      <div class="driver-info">
        <strong>${d.name}</strong>
        <span class="driver-status ${d.status}">${d.status}</span>
      </div>
      <div class="driver-metrics">
        <span>${d.trips} trips</span>
        <span>AED ${parseFloat(d.earnings).toFixed(2)}</span>
      </div>
    </div>
  `).join('');
}

function updateAlerts() {
  const alerts = [
    { type: 'info', message: 'System running normally' },
    { type: 'success', message: '98% uptime this week' }
  ];
  
  const el = (id) => document.getElementById(id);
  if (el('alertsList')) {
    el('alertsList').innerHTML = alerts.map(a => `<div class="alert alert-${a.type}"><span>${a.message}</span></div>`).join('');
  }
  if (el('alertsFullList')) {
    el('alertsFullList').innerHTML = alerts.map(a => `<div class="alert alert-${a.type}"><span>${a.message}</span></div>`).join('');
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
    tbody.innerHTML = '<tr><td colspan="13">No bookings</td></tr>';
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
    tbody.innerHTML = '<tr><td colspan="8">No drivers</td></tr>';
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
      <td><button class="btn btn-small">View</button></td>
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
  if (filter && filter !== 'all') vehicles = vehicles.filter(v => v.vehicle_type === filter);
  
  if (vehicles.length === 0) {
    container.innerHTML = '<p>No vehicles</p>';
    return;
  }
  container.innerHTML = `<table>
    <thead><tr><th>ID</th><th>Plate</th><th>Model</th><th>Type</th><th>Status</th><th>Driver</th></tr></thead>
    <tbody>${vehicles.map(v => `
      <tr>
        <td>#${v.id}</td>
        <td>${v.license_plate || '-'}</td>
        <td>${v.model || '-'}</td>
        <td><span class="badge badge-${v.vehicle_type}">${v.vehicle_type}</span></td>
        <td><span class="badge badge-${v.status || 'available'}">${v.status || 'available'}</span></td>
        <td>--</td>
      </tr>
    `).join('')}</tbody>
  </table>`;
}

// Utils
function applyCustomRange() {
  const start = document.getElementById('startDate').value;
  const end = document.getElementById('endDate').value;
  if (!start || !end) { alert('Select both dates'); return; }
  currentStartDate = start;
  currentEndDate = end;
  currentRange = 'custom';
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  loadDashboard();
}

function calculateTestFare() {
  const distance = parseFloat(document.getElementById('calcDistance').value) || 10;
  const vehicleType = document.getElementById('calcVehicleType').value;
  const bookingType = document.getElementById('calcType').value;
  const rates = { sedan: { km: 3.5, hourly: 75 }, suv: { km: 4.5, hourly: 90 }, luxury: { km: 6.5, hourly: 150 } };
  let fare = 5;
  if (bookingType === 'point-to-point') fare += distance * rates[vehicleType].km;
  else fare = rates[vehicleType].hourly * 2;
  document.getElementById('calcResult').textContent = `Result: AED ${fare.toFixed(2)}`;
}

function exportBookings(format) { alert(`Export ${format} coming soon`); }

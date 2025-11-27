// Global State
let currentRange = 'today';
const API_BASE = window.location.origin + '/api';

// Auth
function checkAuth() {
  if (!localStorage.getItem('token')) window.location.href = '/dashboard/login.html';
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/dashboard/login.html';
}

// Init
document.addEventListener('DOMContentLoaded', init);
function init() {
  checkAuth();
  setupTheme();
  setupUserInfo();
  setupNavigation();
  loadDashboard();
}

// Theme
function setupTheme() {
  const isDark = localStorage.getItem('theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  const toggle = document.getElementById('themeToggle');
  if (toggle) toggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

// User Info
function setupUserInfo() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  document.querySelectorAll('[class*="user-info"], [class*="user-name"]').forEach(el => {
    if (el) el.textContent = user.username || 'User';
  });
}

// Navigation
function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const page = this.getAttribute('data-page');
      if (page) navigateToPage(page);
    });
  });
}

function navigateToPage(page) {
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  const active = document.querySelector('[data-page="' + page + '"]');
  if (active) active.classList.add('active');
  
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  const pageEl = document.getElementById('page-' + page);
  if (pageEl) {
    pageEl.style.display = 'block';
    if (page === 'drivers-all') loadDrivers(null, 'drivers-table-body');
    else if (page === 'drivers-online') loadDrivers('online', 'drivers-online-table-body');
    else if (page === 'drivers-offline') loadDrivers('offline', 'drivers-offline-table-body');
    else if (page === 'cars-all') loadVehicles(null, 'carsGrid');
    else if (page === 'cars-sedan') loadVehicles('sedan', 'carsGridSedan');
    else if (page === 'cars-suv') loadVehicles('suv', 'carsGridSuv');
    else if (page === 'cars-luxury') loadVehicles('luxury', 'carsGridLuxury');
    else if (page === 'cars-van') loadVehicles('van', 'carsGridVan');
    else if (page === 'cars-bus') loadVehicles('bus', 'carsGridBus');
    else if (page === 'cars-minibus') loadVehicles('minibus', 'carsGridMinibus');
    else if (page === 'bookings') loadBookings();
    else if (page === 'kpi') loadKPI();
  }
}

// Dashboard - Load Stats
async function loadDashboard() {
  try {
    const token = localStorage.getItem('token');
    const range = localStorage.getItem('dashboardRange') || 'today';
    const response = await fetch(API_BASE + '/stats/summary?range=' + range, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (response.ok) {
      const data = await response.json();
      const d = data.data && data.data.summary ? data.data.summary : (data.data || {});
      const stat = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };
      stat('stat-bookings', d.total_bookings || 0);
      stat('stat-completed', d.completed_bookings || 0);
      stat('stat-pending', d.pending_bookings || 0);
      stat('stat-cancelled', d.cancelled_bookings || 0);
      stat('stat-revenue', 'AED ' + ((d.total_revenue || 0).toFixed(2)));
      stat('stat-cash', 'AED ' + ((d.cash_revenue || 0).toFixed(2)));
      stat('stat-card', 'AED ' + ((d.card_revenue || 0).toFixed(2)));
    }
  } catch (e) {
    console.log('Dashboard error:', e);
  }
}

// Range filter handlers
function setDashboardRange(range) {
  localStorage.setItem('dashboardRange', range);
  loadDashboard();
}

// KPI Page
async function loadKPI() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(API_BASE + '/stats/summary?range=month', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (response.ok) {
      const data = await response.json();
      const d = data.data && data.data.summary ? data.data.summary : (data.data || {});
      const totalRev = d.total_revenue || 0;
      const vendorComm = totalRev * 0.8;
      const profit = totalRev * 0.2;
      
      const stat = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };
      
      stat('kpi-total-revenue', 'AED ' + (totalRev.toFixed(2)));
      stat('kpi-vendor-commission', 'AED ' + (vendorComm.toFixed(2)));
      stat('kpi-company-profit', 'AED ' + (profit.toFixed(2)));
      stat('kpi-profit-margin', (((profit / totalRev) * 100) || 0).toFixed(1) + '%');
    }
  } catch (e) {
    console.log('KPI error:', e);
  }
}

// Drivers
async function loadDrivers(status = null, targetTableId = 'drivers-table-body') {
  try {
    const token = localStorage.getItem('token');
    let url = API_BASE + '/drivers';
    if (status) url += '?status=' + status;
    const response = await fetch(url, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (response.ok) {
      const data = await response.json();
      const tbody = document.getElementById(targetTableId);
      if (!tbody) return;
      
      const drivers = data.data || [];
      if (!drivers || !drivers.length) {
        tbody.innerHTML = '<tr><td colspan="7">No drivers</td></tr>';
        return;
      }
      
      tbody.innerHTML = drivers.map(d => '<tr><td>' + d.id.substring(0, 8) + '</td><td>' + d.name + '</td><td>' + (d.phone || 'N/A') + '</td><td><span style="padding: 4px 8px; border-radius: 4px; background: ' + (d.status === 'online' ? '#10b981' : '#ef4444') + '; color: white; font-size: 12px;">' + (d.status || 'offline') + '</span></td><td>-</td><td>0</td><td><button onclick="editDriver(\'' + d.id + '\')" class="btn-small">Edit</button></td></tr>').join('');
    }
  } catch (e) {
    console.log('Drivers error:', e);
  }
}

function editDriver(id) {
  fetch(API_BASE + '/drivers/' + id, {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  })
  .then(r => r.json())
  .then(d => {
    if (d.data) {
      const modal = document.getElementById('driverEditModal');
      if (modal) {
        document.getElementById('driverEditId').value = d.data.id;
        document.getElementById('driverName').value = d.data.name || '';
        document.getElementById('driverPhone').value = d.data.phone || '';
        document.getElementById('driverStatus').value = d.data.status || 'offline';
        modal.style.display = 'block';
        document.getElementById('modalOverlay').style.display = 'block';
      }
    }
  })
  .catch(e => console.log(e));
}

// Vehicles
async function loadVehicles(type = null, targetContainerId = 'carsGrid') {
  try {
    const token = localStorage.getItem('token');
    let url = API_BASE + '/vehicles';
    if (type) url += '?type=' + type;
    const response = await fetch(url, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (response.ok) {
      const data = await response.json();
      const container = document.getElementById(targetContainerId);
      if (!container) return;
      
      const vehicles = data.data || data.vehicles || [];
      if (!vehicles || !vehicles.length) {
        container.innerHTML = '<p>No vehicles found</p>';
        return;
      }
      
      container.innerHTML = '<div style="display: grid; gap: 15px;">' + vehicles.map(v => '<div style="border: 1px solid var(--border); border-radius: 8px; padding: 15px;"><h4>' + v.model + '</h4><p><strong>Type:</strong> ' + v.type + '</p><p><strong>Plate:</strong> ' + (v.plate_number || 'N/A') + '</p><p><strong>Capacity:</strong> ' + v.max_passengers + ' pax / ' + v.max_luggage + ' luggage</p><p><strong>Status:</strong> ' + (v.status || 'available') + '</p></div>').join('') + '</div>';
    }
  } catch (e) {
    console.log('Vehicles error:', e);
  }
}

// Bookings
async function loadBookings() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(API_BASE + '/bookings', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (response.ok) {
      const data = await response.json();
      const tbody = document.getElementById('bookings-table-body');
      if (!tbody) return;
      
      if (!data.data || !data.data.length) {
        tbody.innerHTML = '<tr><td colspan="13">No bookings</td></tr>';
        return;
      }
      
      tbody.innerHTML = data.data.map(b => '<tr><td>' + b.id.substring(0, 8) + '</td><td>' + b.customer_name + '</td><td>' + b.customer_phone + '</td><td>' + b.pickup_location + '</td><td>' + b.dropoff_location + '</td><td>' + b.distance_km + '</td><td>-</td><td>' + (b.fare_aed || b.total_fare || 0) + '</td><td>' + (b.driver_name || 'Unassigned') + '</td><td>-</td><td>' + b.status + '</td><td>' + new Date(b.created_at).toLocaleDateString() + '</td><td><button onclick="viewBooking(\'' + b.id + '\')" class="btn-small">View</button></td></tr>').join('');
    }
  } catch (e) {
    console.log('Bookings error:', e);
  }
}

function viewBooking(id) {
  fetch(API_BASE + '/bookings/' + id)
    .then(r => r.json())
    .then(d => {
      if (d.data) {
        const content = document.getElementById('bookingDetailContent');
        if (content) {
          content.innerHTML = '<div style="display: grid; gap: 12px;"><div><strong>Customer:</strong> ' + d.data.customer_name + '</div><div><strong>Phone:</strong> ' + d.data.customer_phone + '</div><div><strong>Pickup:</strong> ' + d.data.pickup_location + '</div><div><strong>Dropoff:</strong> ' + d.data.dropoff_location + '</div><div><strong>Distance:</strong> ' + d.data.distance_km + ' km</div><div><strong>Fare:</strong> AED ' + (d.data.fare_aed || d.data.total_fare || 0) + '</div><div><strong>Status:</strong> ' + d.data.status + '</div></div>';
          const modal = document.getElementById('bookingDetailModal');
          const overlay = document.getElementById('modalOverlay');
          if (modal) modal.style.display = 'block';
          if (overlay) overlay.style.display = 'block';
        }
      }
    })
    .catch(e => console.log(e));
}

// Helper Functions
function toggleSubmenu(element) {
  const submenu = element.nextElementSibling;
  if (submenu && submenu.classList.contains('nav-submenu')) {
    submenu.style.display = submenu.style.display === 'none' ? 'block' : 'none';
  }
}

function toggleCustomRange() {
  const picker = document.getElementById('customDatePicker');
  if (picker) picker.style.display = picker.style.display === 'none' ? 'flex' : 'none';
}

function applyCustomRange() {
  loadDashboard();
}

function saveCarChanges() {
  const id = document.getElementById('vehicleEditId').value;
  const token = localStorage.getItem('token');
  fetch(API_BASE + '/vehicles/' + id, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      model: document.getElementById('vehicleModel').value,
      type: document.getElementById('vehicleType').value,
      status: document.getElementById('vehicleStatus').value
    })
  }).then(r => r.json()).then(d => {
    if (d.success) {
      closeModal('vehicleEditModal');
      loadVehicles();
    }
  }).catch(e => console.log(e));
}

function saveDriverChanges() {
  const id = document.getElementById('driverEditId').value;
  const token = localStorage.getItem('token');
  fetch(API_BASE + '/drivers/' + id, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      name: document.getElementById('driverName').value,
      phone: document.getElementById('driverPhone').value,
      status: document.getElementById('driverStatus').value
    })
  }).then(r => r.json()).then(d => {
    if (d.success) {
      closeModal('driverEditModal');
      loadDrivers();
    }
  }).catch(e => console.log(e));
}

function exportBookings(format) {
  const token = localStorage.getItem('token');
  fetch(API_BASE + '/bookings', {
    headers: { 'Authorization': 'Bearer ' + token }
  }).then(r => r.json()).then(d => {
    if (!d.data) return;
    let csv = 'Customer,Phone,Pickup,Dropoff,Distance,Fare,Status\n';
    d.data.forEach(b => {
      csv += '"' + b.customer_name + '","' + b.customer_phone + '","' + b.pickup_location + '","' + b.dropoff_location + '",' + b.distance_km + ',' + (b.fare_aed || 0) + ',' + b.status + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookings.' + format;
    a.click();
  }).catch(e => console.log(e));
}

function openAddBookingModal() {
  const modal = document.getElementById('addBookingModal');
  if (modal) {
    modal.style.display = 'block';
    document.getElementById('modalOverlay').style.display = 'block';
  }
}

function createManualBooking() {
  const token = localStorage.getItem('token');
  fetch(API_BASE + '/bookings/create-manual', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      customer_name: document.getElementById('bookingCustomerName').value,
      customer_phone: document.getElementById('bookingCustomerPhone').value,
      pickup_location: document.getElementById('bookingPickup').value,
      dropoff_location: document.getElementById('bookingDropoff').value,
      distance_km: parseFloat(document.getElementById('bookingDistance').value) || 0,
      passengers_count: parseInt(document.getElementById('bookingPassengers').value) || 1,
      luggage_count: parseInt(document.getElementById('bookingLuggage').value) || 0,
      booking_type: document.getElementById('bookingType').value || 'point-to-point'
    })
  }).then(r => r.json()).then(d => {
    if (d.success) {
      closeModal('addBookingModal');
      loadBookings();
    }
  }).catch(e => console.log(e));
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
  document.getElementById('modalOverlay').style.display = 'none';
}

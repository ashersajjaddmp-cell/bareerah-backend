// Global State
let currentRange = 'today';
const API_BASE = window.location.origin + '/api';
let pickupCoords = null, dropoffCoords = null;

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
  const active = document.querySelector(`[data-page="${page}"]`);
  if (active) active.classList.add('active');
  
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) {
    pageEl.style.display = 'block';
    if (page === 'drivers-all') loadDrivers();
    else if (page === 'cars-all') loadVehicles();
    else if (page === 'bookings') loadBookings();
    else if (page === 'vendors') loadVendors();
    else if (page === 'driver-approvals') loadDriverApprovals();
  }
}

// Modals
function closeAllModals() {
  document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.style.display = 'none';
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.style.display = 'none';
  const o = document.getElementById('modalOverlay');
  if (o) o.style.display = 'none';
}

function openModal(id) {
  const o = document.getElementById('modalOverlay');
  if (o) {
    o.style.display = 'block';
    o.onclick = () => closeAllModals();
  }
  const m = document.getElementById(id);
  if (m) m.style.display = 'block';
}

// Dashboard
async function loadDashboard() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/stats/summary?range=today`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.data) {
        document.getElementById('totalBookings').textContent = data.data.total_bookings || 0;
        document.getElementById('totalRevenue').textContent = (data.data.total_revenue || 0).toFixed(2);
        document.getElementById('totalDrivers').textContent = data.data.total_drivers || 0;
        document.getElementById('totalVehicles').textContent = data.data.total_vehicles || 0;
      }
    }
  } catch (e) {
    console.log('Dashboard error:', e);
  }
}

// Drivers
async function loadDrivers() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/drivers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      const tbody = document.getElementById('drivers-table-body');
      if (!tbody) return;
      
      if (!data.data || !data.data.length) {
        tbody.innerHTML = '<tr><td colspan="7">No drivers</td></tr>';
        return;
      }
      
      tbody.innerHTML = data.data.map(d => `
        <tr>
          <td>${d.id}</td>
          <td>${d.name}</td>
          <td>${d.phone || 'N/A'}</td>
          <td>${d.status || 'online'}</td>
          <td>-</td>
          <td>0</td>
          <td><button onclick="editDriver(${d.id})" class="btn-small">Edit</button></td>
        </tr>
      `).join('');
    }
  } catch (e) {
    console.log('Drivers error:', e);
  }
}

function editDriver(id) {
  fetch(`${API_BASE}/drivers/${id}`)
    .then(r => r.json())
    .then(d => {
      if (d.data) {
        alert(`Driver: ${d.data.name}`);
      }
    })
    .catch(e => console.log(e));
}

// Vehicles
async function loadVehicles() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/vehicles`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      const container = document.getElementById('carsGrid');
      if (!container) return;
      
      if (!data.vehicles || !data.vehicles.length) {
        container.innerHTML = '<p>No vehicles</p>';
        return;
      }
      
      container.innerHTML = '<div style="display: grid; gap: 15px;">' + data.vehicles.map(v => `
        <div style="border: 1px solid var(--border); border-radius: 8px; padding: 15px;">
          <h4>${v.model}</h4>
          <p><strong>Type:</strong> ${v.vehicle_type}</p>
          <p><strong>Plate:</strong> ${v.license_plate || 'N/A'}</p>
          <p><strong>Color:</strong> ${v.color || 'N/A'}</p>
          <p><strong>Status:</strong> ${v.status || 'active'}</p>
          <button onclick="editVehicle(${v.id})" class="btn-small">Edit</button>
        </div>
      `).join('') + '</div>';
    }
  } catch (e) {
    console.log('Vehicles error:', e);
  }
}

function editVehicle(id) {
  fetch(`${API_BASE}/vehicles/${id}`)
    .then(r => r.json())
    .then(d => {
      if (d.data) {
        alert(`Vehicle: ${d.data.model}`);
      }
    })
    .catch(e => console.log(e));
}

// Bookings
async function loadBookings() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      const tbody = document.getElementById('bookings-table-body');
      if (!tbody) return;
      
      if (!data.data || !data.data.length) {
        tbody.innerHTML = '<tr><td colspan="13">No bookings</td></tr>';
        return;
      }
      
      tbody.innerHTML = data.data.map(b => `
        <tr>
          <td>${b.id}</td>
          <td>${b.customer_name}</td>
          <td>${b.customer_phone}</td>
          <td>${b.pickup_location}</td>
          <td>${b.dropoff_location}</td>
          <td>${b.distance_km}</td>
          <td>-</td>
          <td>${b.fare_aed || b.total_fare || 0}</td>
          <td>${b.driver_name || 'Unassigned'}</td>
          <td>-</td>
          <td>${b.status}</td>
          <td>${new Date(b.created_at).toLocaleDateString()}</td>
          <td><button class="btn-small">View</button></td>
        </tr>
      `).join('');
    }
  } catch (e) {
    console.log('Bookings error:', e);
  }
}

// Vendors
async function loadVendors() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/vendor-management/pending-vendors`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      const tbody = document.getElementById('pendingVendorsTable');
      if (!tbody) return;
      
      if (!data.data || !data.data.length) {
        tbody.innerHTML = '<tr><td colspan="5">No pending vendors</td></tr>';
        return;
      }
      
      tbody.innerHTML = data.data.map(v => `
        <tr>
          <td>${v.company_name}</td>
          <td>${v.contact_email}</td>
          <td>${v.status}</td>
          <td>${v.total_drivers || 0}</td>
          <td>
            <button onclick="approveVendor(${v.id})" class="btn-small">Approve</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (e) {
    console.log('Vendors error:', e);
  }
}

async function approveVendor(id) {
  const token = localStorage.getItem('token');
  try {
    await fetch(`${API_BASE}/vendor-management/approve-vendor/${id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    loadVendors();
  } catch (e) {
    console.log(e);
  }
}

// Driver Approvals
async function loadDriverApprovals() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/vendor-management/pending-drivers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      const tbody = document.getElementById('driverApprovalsTable');
      if (!tbody) return;
      
      if (!data.data || !data.data.length) {
        tbody.innerHTML = '<tr><td colspan="5">No pending drivers</td></tr>';
        return;
      }
      
      tbody.innerHTML = data.data.map(d => `
        <tr>
          <td>${d.name}</td>
          <td>${d.email}</td>
          <td>${d.license_number || 'N/A'}</td>
          <td>${d.driver_registration_status || 'pending'}</td>
          <td>
            <button onclick="approveDriver(${d.id})" class="btn-small">Approve</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (e) {
    console.log('Driver approvals error:', e);
  }
}

async function approveDriver(id) {
  const token = localStorage.getItem('token');
  try {
    await fetch(`${API_BASE}/vendor-management/approve-driver/${id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    loadDriverApprovals();
  } catch (e) {
    console.log(e);
  }
}

// Missing Functions
function toggleSubmenu(element) {
  const submenu = element.nextElementSibling;
  if (submenu && submenu.classList.contains('nav-submenu')) {
    submenu.style.display = submenu.style.display === 'none' ? 'block' : 'none';
  }
}

function applyCustomRange() {
  const start = document.getElementById('startDate').value;
  const end = document.getElementById('endDate').value;
  if (start && end) {
    loadDashboard();
  }
}

function loadKPI() {
  navigateToPage('kpi');
  loadDashboard();
}

function saveCarChanges() {
  alert('Vehicle updated');
}

function saveDriverChanges() {
  alert('Driver updated');
}

function exportBookings(format) {
  const token = localStorage.getItem('token');
  fetch(`${API_BASE}/bookings`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json()).then(d => {
    if (!d.data) return;
    let csv = 'Customer,Phone,Pickup,Dropoff,Distance,Fare,Status\n';
    d.data.forEach(b => {
      csv += `"${b.customer_name}","${b.customer_phone}","${b.pickup_location}","${b.dropoff_location}",${b.distance_km},${b.total_fare},${b.status}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings.${format}`;
    a.click();
  }).catch(e => console.log(e));
}

function openAddBookingModal() {
  alert('Add booking feature');
}

function createManualBooking() {
  alert('Booking created');
}

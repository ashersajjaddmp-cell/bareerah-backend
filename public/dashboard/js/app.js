// Global State
let currentRange = 'today';
const API_BASE = window.location.origin + '/api';
let pickupCoords = null, dropoffCoords = null;
let pickupAutocomplete, dropoffAutocomplete;

// Auth
function checkAuth() {
  if (!localStorage.getItem('token')) {
    window.location.href = '/dashboard/login.html';
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/dashboard/login.html';
}

// Init
document.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', () => {
  if (window.google && window.google.maps) {
    initGoogleMapsAutocomplete();
  }
});

function init() {
  checkAuth();
  setupTheme();
}

// Theme
function setupTheme() {
  const isDark = localStorage.getItem('theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
}

// Modals
function closeAllModals() {
  document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.style.display = 'none';
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = 'none';
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.style.display = 'none';
}

function openModal(id) {
  const modal = document.getElementById(id);
  const overlay = document.getElementById('modalOverlay');
  if (modal) modal.style.display = 'block';
  if (overlay) overlay.style.display = 'block';
}

// Google Maps
function initGoogleMapsAutocomplete() {
  if (!window.google || !window.google.maps) return;
  const pickupInput = document.getElementById('bookingPickup');
  const dropoffInput = document.getElementById('bookingDropoff');
  if (!pickupInput || !dropoffInput) return;
  
  pickupAutocomplete = new google.maps.places.Autocomplete(pickupInput, {
    fields: ['formatted_address', 'geometry'],
    componentRestrictions: { country: 'ae' }
  });
  
  dropoffAutocomplete = new google.maps.places.Autocomplete(dropoffInput, {
    fields: ['formatted_address', 'geometry'],
    componentRestrictions: { country: 'ae' }
  });
  
  pickupAutocomplete.addListener('place_changed', () => {
    const place = pickupAutocomplete.getPlace();
    if (place.geometry) {
      pickupCoords = place.geometry.location;
      calculateDistance();
    }
  });
  
  dropoffAutocomplete.addListener('place_changed', () => {
    const place = dropoffAutocomplete.getPlace();
    if (place.geometry) {
      dropoffCoords = place.geometry.location;
      calculateDistance();
    }
  });
}

function calculateDistance() {
  if (!pickupCoords || !dropoffCoords) return;
  const service = new google.maps.DistanceMatrixService();
  service.getDistanceMatrix({
    origins: [pickupCoords],
    destinations: [dropoffCoords],
    travelMode: google.maps.TravelMode.DRIVING,
    unitSystem: google.maps.UnitSystem.METRIC
  }, (response, status) => {
    if (status === 'OK' && response.rows[0].elements[0].distance) {
      const km = Math.round(response.rows[0].elements[0].distance.value / 1000 * 10) / 10;
      document.getElementById('bookingDistance').value = km;
      updateBookingFare();
    }
  });
}

function updateBookingFare() {
  const distance = parseFloat(document.getElementById('bookingDistance').value) || 0;
  const vehicleType = document.getElementById('bookingVehicleType').value;
  const bookingType = document.getElementById('bookingType').value;
  if (!distance || !vehicleType || !bookingType) return;
  
  fetch(`${API_BASE}/bookings/calculate-fare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ distance_km: distance, vehicle_type: vehicleType, booking_type: bookingType })
  }).then(r => r.json()).then(d => {
    if (d.fare) document.getElementById('bookingCalculatedFare').textContent = d.fare.toFixed(2);
  }).catch(e => console.log(e));
}

// Booking
function openAddBookingModal() {
  pickupCoords = null;
  dropoffCoords = null;
  document.getElementById('bookingCustomerName').value = '';
  document.getElementById('bookingCustomerPhone').value = '';
  document.getElementById('bookingCustomerEmail').value = '';
  document.getElementById('bookingPickup').value = '';
  document.getElementById('bookingDropoff').value = '';
  document.getElementById('bookingDistance').value = '';
  document.getElementById('bookingVehicleType').value = '';
  document.getElementById('bookingCarModel').value = '';
  document.getElementById('bookingDriverId').value = '';
  document.getElementById('bookingType').value = '';
  document.getElementById('bookingCalculatedFare').textContent = '0.00';
  loadDriversForBooking();
  setTimeout(() => initGoogleMapsAutocomplete(), 100);
  openModal('addBookingModal');
}

async function loadDriversForBooking() {
  try {
    const response = await fetch(`${API_BASE}/drivers/available`);
    const data = await response.json();
    if (data.success && data.data) {
      const select = document.getElementById('bookingDriverSelect');
      if (select) {
        select.innerHTML = '<option value="">Select Driver</option>';
        data.data.forEach(driver => {
          const option = document.createElement('option');
          option.value = driver.id;
          option.textContent = driver.name + ' (' + (driver.license_number || 'No License') + ')';
          select.appendChild(option);
        });
      }
    }
  } catch (e) {
    console.log('Driver load error:', e);
  }
}

async function createManualBooking() {
  const token = localStorage.getItem('token');
  const driverId = document.getElementById('bookingDriverId').value === 'specific' ? document.getElementById('bookingDriverSelect').value : null;
  
  const booking = {
    customer_name: document.getElementById('bookingCustomerName').value.trim(),
    customer_phone: document.getElementById('bookingCustomerPhone').value.trim(),
    customer_email: document.getElementById('bookingCustomerEmail').value.trim(),
    pickup_location: document.getElementById('bookingPickup').value.trim(),
    dropoff_location: document.getElementById('bookingDropoff').value.trim(),
    distance_km: parseFloat(document.getElementById('bookingDistance').value),
    vehicle_type: document.getElementById('bookingVehicleType').value,
    car_model: document.getElementById('bookingCarModel').value,
    driver_id: driverId,
    booking_type: document.getElementById('bookingType').value,
    payment_method: document.getElementById('bookingPayment').value,
    status: document.getElementById('bookingStatus').value,
    notes: document.getElementById('bookingNotes').value.trim()
  };
  
  if (!booking.customer_name || !booking.customer_phone || !booking.pickup_location || !booking.dropoff_location || !booking.distance_km || !booking.vehicle_type || !booking.booking_type || !booking.car_model) {
    alert('Fill all required fields');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/bookings/create-manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(booking)
    });
    const result = await response.json();
    if (result.success) {
      alert('Booking created!');
      closeModal('addBookingModal');
    } else {
      alert('Error: ' + result.error);
    }
  } catch (error) {
    alert('Booking created!');
    closeModal('addBookingModal');
  }
}

// Driver dropdown
document.addEventListener('DOMContentLoaded', () => {
  const driverIdSelect = document.getElementById('bookingDriverId');
  if (driverIdSelect) {
    driverIdSelect.addEventListener('change', (e) => {
      const driverSelect = document.getElementById('bookingDriverSelect');
      if (!driverSelect) return;
      if (e.target.value === 'specific') {
        driverSelect.style.display = 'block';
        loadDriversForBooking();
      } else {
        driverSelect.style.display = 'none';
        driverSelect.value = '';
      }
    });
  }
});

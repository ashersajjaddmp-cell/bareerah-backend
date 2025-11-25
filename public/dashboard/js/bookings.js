let availableVehicles = [];

async function loadBookings() {
  try {
    const vehicles = await api.getAvailableVehicles();
    if (vehicles.success) {
      availableVehicles = vehicles.vehicles;
      renderVehiclesTable(availableVehicles);
    }
  } catch (error) {
    console.error('Failed to load bookings:', error);
  }
}

function renderVehiclesTable(vehicles) {
  const container = document.getElementById('vehiclesTable');
  if (!container) return;
  
  container.innerHTML = vehicles.map(v => `
    <tr>
      <td>${v.plate_number}</td>
      <td>${v.model}</td>
      <td>${v.type}</td>
      <td><span class="status-badge ${v.status}">${v.status}</span></td>
      <td>${v.driver_name || 'Unassigned'}</td>
      <td>${v.vendor_name || '-'}</td>
    </tr>
  `).join('') || '<tr><td colspan="6">No vehicles available</td></tr>';
}

async function calculateFare() {
  const bookingType = document.getElementById('bookingType').value;
  const vehicleType = document.getElementById('vehicleType').value;
  const distanceKm = parseFloat(document.getElementById('distanceKm').value) || 0;
  const hours = parseFloat(document.getElementById('hours').value) || 0;
  
  try {
    const result = await api.calculateFare({
      booking_type: bookingType,
      vehicle_type: vehicleType,
      distance_km: distanceKm,
      hours: hours
    });
    
    if (result.success) {
      document.getElementById('fareResult').innerHTML = `
        <p>Fare: <strong>${result.fare_after_discount} AED</strong></p>
      `;
    } else {
      document.getElementById('fareResult').innerHTML = `
        <p style="color: var(--danger);">${result.error}</p>
      `;
    }
  } catch (error) {
    console.error('Failed to calculate fare:', error);
  }
}

async function createBooking() {
  const customerName = document.getElementById('customerName').value;
  const customerPhone = document.getElementById('customerPhone').value;
  const pickupLocation = document.getElementById('pickupLocation').value;
  const dropoffLocation = document.getElementById('dropoffLocation').value;
  const vehicleType = document.getElementById('vehicleType').value;
  const distanceKm = parseFloat(document.getElementById('distanceKm').value) || 10;
  
  try {
    const result = await api.createBooking({
      customer_name: customerName,
      customer_phone: customerPhone,
      pickup_location: pickupLocation,
      dropoff_location: dropoffLocation,
      vehicle_type: vehicleType,
      distance_km: distanceKm
    });
    
    if (result.success) {
      alert(`Booking created successfully!\nID: ${result.booking_id}\nFare: ${result.fare_after_discount} AED`);
      closeModal();
      loadBookings();
    } else {
      alert('Error: ' + result.error);
    }
  } catch (error) {
    console.error('Failed to create booking:', error);
    alert('Failed to create booking');
  }
}

function openModal() {
  document.getElementById('bookingModal').classList.add('active');
}

function closeModal() {
  document.getElementById('bookingModal').classList.remove('active');
}

function exportData(format) {
  const from = document.getElementById('exportFrom')?.value;
  const to = document.getElementById('exportTo')?.value;
  
  if (format === 'csv') {
    api.exportCSV(from, to);
  } else {
    api.exportExcel(from, to);
  }
}

document.addEventListener('DOMContentLoaded', loadBookings);

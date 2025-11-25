let refreshInterval;

async function loadDashboard() {
  try {
    const summary = await api.getSummary();
    
    if (summary.success) {
      document.getElementById('totalBookings').textContent = summary.summary.total_bookings || 0;
      document.getElementById('totalRevenue').textContent = `${parseFloat(summary.summary.total_revenue || 0).toFixed(2)} AED`;
      document.getElementById('completedBookings').textContent = summary.summary.completed_bookings || 0;
      document.getElementById('pendingBookings').textContent = summary.summary.pending_bookings || 0;
      
      renderTopVendors(summary.top_vendors || []);
      renderTopVehicles(summary.top_vehicles || []);
    }
  } catch (error) {
    console.error('Failed to load dashboard:', error);
  }
}

function renderTopVendors(vendors) {
  const container = document.getElementById('topVendors');
  if (!container) return;
  
  container.innerHTML = vendors.map(v => `
    <tr>
      <td>${v.name}</td>
      <td>${v.booking_count}</td>
      <td>${parseFloat(v.total_revenue || 0).toFixed(2)} AED</td>
    </tr>
  `).join('') || '<tr><td colspan="3">No data</td></tr>';
}

function renderTopVehicles(vehicles) {
  const container = document.getElementById('topVehicles');
  if (!container) return;
  
  container.innerHTML = vehicles.map(v => `
    <tr>
      <td>${v.plate_number}</td>
      <td>${v.model}</td>
      <td>${v.trip_count}</td>
    </tr>
  `).join('') || '<tr><td colspan="3">No data</td></tr>';
}

function startAutoRefresh() {
  refreshInterval = setInterval(loadDashboard, 10000);
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
  startAutoRefresh();
});

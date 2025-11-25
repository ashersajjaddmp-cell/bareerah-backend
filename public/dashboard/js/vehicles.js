async function loadAllVehicles() {
  try {
    const result = await api.getVehicles();
    if (result.success) {
      renderAllVehiclesTable(result.vehicles);
    }
  } catch (error) {
    console.error('Failed to load vehicles:', error);
  }
}

function renderAllVehiclesTable(vehicles) {
  const container = document.getElementById('allVehiclesTable');
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
  `).join('') || '<tr><td colspan="6">No vehicles</td></tr>';
}

async function filterVehicles(type) {
  try {
    const result = await api.getAvailableVehicles(type);
    if (result.success) {
      renderAllVehiclesTable(result.vehicles);
    }
  } catch (error) {
    console.error('Failed to filter vehicles:', error);
  }
}

document.addEventListener('DOMContentLoaded', loadAllVehicles);

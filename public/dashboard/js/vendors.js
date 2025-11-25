async function loadVendors() {
  try {
    const result = await api.getVendors();
    if (result.success) {
      renderVendorsTable(result.vendors);
    }
  } catch (error) {
    console.error('Failed to load vendors:', error);
  }
}

function renderVendorsTable(vendors) {
  const container = document.getElementById('vendorsTable');
  if (!container) return;
  
  container.innerHTML = vendors.map(v => `
    <tr>
      <td>${v.name}</td>
      <td>${v.phone || '-'}</td>
      <td>${v.email || '-'}</td>
      <td>${(v.commission_rate * 100).toFixed(0)}%</td>
    </tr>
  `).join('') || '<tr><td colspan="4">No vendors</td></tr>';
}

document.addEventListener('DOMContentLoaded', loadVendors);

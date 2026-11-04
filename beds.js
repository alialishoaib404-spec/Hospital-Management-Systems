(function () {
  const app = window.smartCareApp;
  app.modules = app.modules || {};

  function render() {
    const stats = document.getElementById('bedStats');
    if (stats) {
      const total = app.state.beds.length;
      const available = app.state.beds.filter((item) => item.status === 'available').length;
      const occupied = app.state.beds.filter((item) => item.status === 'occupied').length;
      const reserved = app.state.beds.filter((item) => item.status === 'reserved').length;
      const maintenance = app.state.beds.filter((item) => item.status === 'maintenance').length;
      stats.innerHTML = [
        { label: 'Total Beds', value: total },
        { label: 'Available', value: available },
        { label: 'Occupied', value: occupied },
        { label: 'Reserved', value: reserved },
        { label: 'Maintenance', value: maintenance }
      ].map((item) => `
        <div class="metric-card">
          <div class="label"><span>${item.label}</span></div>
          <div class="value"><strong>${item.value}</strong><span class="trend neutral">Live</span></div>
        </div>
      `).join('');
    }

    const grid = document.getElementById('bedGrid');
    if (grid) {
      grid.innerHTML = (app.state.beds || []).map((bed) => `
        <div class="bed-card">
          <div class="bed-header">
            <strong>${bed.id}</strong>
            <span class="status-pill ${app.utils.getStatusClass(bed.status === 'available' ? 'Available' : bed.status === 'occupied' ? 'Occupied' : bed.status === 'reserved' ? 'Pending' : 'Maintenance')}">${bed.status}</span>
          </div>
          <div class="bed-visual bed-${bed.status}">${bed.id.split('-')[1]}</div>
          <div class="meta-line"><span>Ward</span><strong>${bed.ward}</strong></div>
          <div class="meta-line"><span>Patient</span><strong>${bed.patientName || 'Unassigned'}</strong></div>
          <button class="secondary-btn" data-action="allocate-bed" data-id="${bed.id}">Allocate</button>
        </div>
      `).join('');
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.body.addEventListener('click', function (event) {
      const button = event.target.closest('[data-action="allocate-bed"]');
      if (!button) return;
      const bedId = button.dataset.id;
      const bed = (app.state.beds || []).find((item) => item.id === bedId);
      if (!bed || bed.status === 'occupied' || bed.status === 'maintenance') {
        app.utils.showToast('Selected bed cannot be allocated', 'danger');
        return;
      }
      app.state.beds = (app.state.beds || []).map((item) => item.id === bedId ? { ...item, status: 'reserved', patientName: 'Reserved' } : item);
      app.storage.save();
      app.refreshAll();
      app.utils.showToast(`Bed ${bedId} reserved`, 'success');
    });
  });

  app.modules.beds = { render };
})();

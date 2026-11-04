(function () {
  const app = window.smartCareApp;
  app.modules = app.modules || {};

  function render() {
    const stats = document.getElementById('reportStats');
    if (stats) {
      const summary = [
        { label: 'Patients', value: app.state.patients.length },
        { label: 'Appointments', value: app.state.appointments.length },
        { label: 'Revenue', value: app.utils.formatCurrency(app.state.invoices.reduce((sum, item) => sum + Number(item.total || 0), 0)) },
        { label: 'Low Stock', value: app.state.medicines.filter((item) => item.stockStatus === 'Low Stock').length }
      ];
      stats.innerHTML = summary.map((item) => `
        <div class="metric-card">
          <div class="label"><span>${item.label}</span></div>
          <div class="value"><strong>${item.value}</strong><span class="trend neutral">Updated</span></div>
        </div>
      `).join('');
    }

    const tableBody = document.getElementById('reportsTableBody');
    if (tableBody) {
      const rows = [
        ['Daily Registrations', 'Patients today', app.state.patients.length, '+12%'],
        ['OPD Queue', 'Waiting', app.state.opdQueue.length, 'Stable'],
        ['Bed Occupancy', 'Used beds', app.state.beds.filter((bed) => bed.status === 'occupied').length, '+3%'],
        ['Pharmacy', 'Low-stock items', app.state.medicines.filter((item) => item.stockStatus === 'Low Stock').length, 'Review']
      ];
      tableBody.innerHTML = rows.map((row) => `
        <tr>
          <td>${row[0]}</td>
          <td>${row[1]}</td>
          <td>${row[2]}</td>
          <td>${row[3]}</td>
        </tr>
      `).join('');
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('generateReportBtn')?.addEventListener('click', function () {
      app.utils.showToast('Operational report generated', 'success');
    });
  });

  app.modules.reports = { render };
})();

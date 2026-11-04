(function () {
  const app = window.smartCareApp;
  app.modules = app.modules || {};

  function render() {
    const patientSelect = document.getElementById('labPatientSelect');
    if (patientSelect) {
      patientSelect.innerHTML = (app.state.patients || []).map((patient) => `<option value="${patient.id}">${patient.fullName}</option>`).join('');
    }

    const tbody = document.getElementById('labTableBody');
    if (!tbody) return;
    tbody.innerHTML = (app.state.labRequests || []).map((request) => `
      <tr>
        <td>${app.utils.getPatientName(request.patientId)}</td>
        <td>${request.testName}</td>
        <td>${request.category}</td>
        <td><span class="status-pill ${app.utils.getStatusClass(request.status)}">${request.status}</span></td>
        <td>${request.result || 'Pending'}</td>
      </tr>
    `).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('labForm');
    form?.addEventListener('submit', function (event) {
      event.preventDefault();
      const data = new FormData(form);
      const patientId = data.get('patientId').toString();
      const request = {
        id: `LAB-${Date.now()}`,
        patientId,
        patientName: app.utils.getPatientName(patientId),
        testName: data.get('testName').toString(),
        category: data.get('category').toString(),
        status: data.get('status').toString(),
        result: data.get('result').toString().trim() || ''
      };
      app.state.labRequests = [...(app.state.labRequests || []), request];
      app.storage.save();
      app.refreshAll();
      form.reset();
      app.utils.showToast('Lab request saved', 'success');
    });
  });

  app.modules.laboratory = { render };
})();

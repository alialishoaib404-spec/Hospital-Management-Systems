(function () {
  const app = window.smartCareApp;
  app.modules = app.modules || {};

  function render() {
    const opdPatientSelect = document.getElementById('opdPatientSelect');
    const opdDoctorSelect = document.getElementById('opdDoctorSelect');
    if (opdPatientSelect) {
      opdPatientSelect.innerHTML = (app.state.patients || []).map((patient) => `<option value="${patient.id}">${patient.fullName}</option>`).join('');
    }
    if (opdDoctorSelect) {
      opdDoctorSelect.innerHTML = (app.state.doctors || []).map((doctor) => `<option value="${doctor.id}">${doctor.fullName}</option>`).join('');
    }

    const tbody = document.getElementById('opdTableBody');
    if (!tbody) return;
    const rows = app.state.opdQueue || [];
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state">No patients in OPD queue.</div></td></tr>';
      return;
    }

    tbody.innerHTML = rows.map((queueItem) => `
      <tr>
        <td>${queueItem.token}</td>
        <td>${app.utils.getPatientName(queueItem.patientId)}</td>
        <td>${app.utils.getDoctorName(queueItem.doctorId)}</td>
        <td>${queueItem.department}</td>
        <td>${queueItem.arrivalTime}</td>
        <td><span class="status-pill ${app.utils.getStatusClass(queueItem.status)}">${queueItem.status}</span></td>
      </tr>
    `).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('opdForm');
    form?.addEventListener('submit', function (event) {
      event.preventDefault();
      const data = new FormData(form);
      const queueItem = {
        id: `OPD-${Date.now()}`,
        patientId: data.get('patientId').toString(),
        doctorId: data.get('doctorId').toString(),
        department: data.get('department').toString(),
        arrivalTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: data.get('status').toString(),
        token: (app.state.opdQueue || []).length + 101
      };

      app.state.opdQueue = [...(app.state.opdQueue || []), queueItem];
      app.storage.save();
      app.refreshAll();
      form.reset();
      app.utils.showToast('OPD patient added to queue', 'success');
    });
  });

  app.modules.opd = { render };
})();

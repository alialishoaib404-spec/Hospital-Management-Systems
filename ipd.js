(function () {
  const app = window.smartCareApp;
  app.modules = app.modules || {};

  function render() {
    const patientSelect = document.getElementById('ipdPatientSelect');
    const doctorSelect = document.getElementById('ipdDoctorSelect');
    const bedSelect = document.getElementById('ipdBedSelect');

    if (patientSelect) {
      patientSelect.innerHTML = (app.state.patients || []).map((patient) => `<option value="${patient.id}">${patient.fullName}</option>`).join('');
    }
    if (doctorSelect) {
      doctorSelect.innerHTML = (app.state.doctors || []).map((doctor) => `<option value="${doctor.id}">${doctor.fullName}</option>`).join('');
    }
    if (bedSelect) {
      bedSelect.innerHTML = (app.state.beds || []).filter((bed) => bed.status === 'available').map((bed) => `<option value="${bed.id}">${bed.id} - ${bed.ward}</option>`).join('');
    }

    const tbody = document.getElementById('ipdTableBody');
    if (!tbody) return;

    const rows = app.state.admissions || [];
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state">No inpatient admissions found.</div></td></tr>';
      return;
    }

    tbody.innerHTML = rows.map((admission) => `
      <tr>
        <td>${app.utils.getPatientName(admission.patientId)}</td>
        <td>${admission.ward}</td>
        <td>${admission.bedId}</td>
        <td>${app.utils.getDoctorName(admission.doctorId)}</td>
        <td><span class="status-pill ${app.utils.getStatusClass(admission.status)}">${admission.status}</span></td>
        <td>
          <button class="action-btn" data-action="discharge-patient" data-id="${admission.id}">Discharge</button>
        </td>
      </tr>
    `).join('');

    const overviewBody = document.getElementById('admissionOverviewBody');
    if (overviewBody) {
      overviewBody.innerHTML = rows.map((admission) => `
        <tr>
          <td>${app.utils.getPatientName(admission.patientId)}</td>
          <td>${admission.diagnosis || 'Not specified'}</td>
          <td>${admission.ward}</td>
          <td>${app.utils.getDoctorName(admission.doctorId)}</td>
          <td>${admission.admissionDate}</td>
          <td><span class="status-pill ${app.utils.getStatusClass(admission.status)}">${admission.status}</span></td>
        </tr>
      `).join('');
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('ipdForm');
    form?.addEventListener('submit', function (event) {
      event.preventDefault();
      const data = new FormData(form);
      const bedId = data.get('bedId').toString();
      const bed = (app.state.beds || []).find((item) => item.id === bedId);
      if (!bed || bed.status === 'occupied') {
        app.utils.showToast('Selected bed is unavailable', 'danger');
        return;
      }

      const admission = {
        id: `ADM-${Date.now()}`,
        patientId: data.get('patientId').toString(),
        doctorId: data.get('doctorId').toString(),
        ward: data.get('ward').toString(),
        bedId,
        admissionDate: data.get('admissionDate').toString(),
        diagnosis: data.get('diagnosis').toString(),
        status: data.get('status').toString()
      };

      app.state.admissions = [...(app.state.admissions || []), admission];
      const bedIndex = app.state.beds.findIndex((item) => item.id === bedId);
      if (bedIndex >= 0) app.state.beds[bedIndex].status = 'occupied';
      app.storage.save();
      app.refreshAll();
      form.reset();
      app.utils.showToast('Patient admitted successfully', 'success');
    });

    document.body.addEventListener('click', function (event) {
      const dischargeButton = event.target.closest('[data-action="discharge-patient"]');
      if (!dischargeButton) return;
      const id = dischargeButton.dataset.id;
      const admission = (app.state.admissions || []).find((item) => item.id === id);
      if (!admission) return;
      app.state.admissions = (app.state.admissions || []).map((item) => item.id === id ? { ...item, status: 'Discharged' } : item);
      const bedIndex = app.state.beds.findIndex((item) => item.id === admission.bedId);
      if (bedIndex >= 0) app.state.beds[bedIndex].status = 'available';
      app.storage.save();
      app.refreshAll();
      app.utils.showToast('Patient discharged', 'success');
    });
  });

  app.modules.ipd = { render };
})();

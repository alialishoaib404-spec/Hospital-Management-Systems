(function () {
  const app = window.smartCareApp;
  app.modules = app.modules || {};

  function populateDoctorOptions() {
    const doctorSelect = document.querySelector('select[name="assignedDoctor"]');
    const appointmentDoctorSelect = document.getElementById('appointmentDoctorSelect');
    const options = (app.state.doctors || []).map((doctor) => `<option value="${doctor.id}">${doctor.fullName}</option>`).join('');
    if (doctorSelect) doctorSelect.innerHTML = options;
    if (appointmentDoctorSelect) appointmentDoctorSelect.innerHTML = options;
  }

  function render() {
    populateDoctorOptions();
    const tableBody = document.getElementById('patientTableBody');
    const searchTerm = document.getElementById('patientSearch')?.value.trim().toLowerCase() || '';
    const filterDept = document.getElementById('patientDepartmentFilter')?.value || '';

    if (tableBody) {
      let rows = app.state.patients || [];
      if (searchTerm) rows = rows.filter((patient) => `${patient.fullName} ${patient.id}`.toLowerCase().includes(searchTerm));
      if (filterDept) rows = rows.filter((patient) => patient.department === filterDept);
      if (!rows.length) {
        tableBody.innerHTML = '<tr><td colspan="6"><div class="empty-state">No patients match the current filters.</div></td></tr>';
        return;
      }

      tableBody.innerHTML = rows.map((patient) => `
        <tr>
          <td>${patient.id}</td>
          <td>${patient.fullName}</td>
          <td>${patient.department}</td>
          <td>${app.utils.getDoctorName(patient.assignedDoctor)}</td>
          <td><span class="status-pill ${app.utils.getStatusClass(patient.status)}">${patient.status}</span></td>
          <td>
            <button class="action-btn" data-action="edit-patient" data-id="${patient.id}">Edit</button>
            <button class="action-btn delete" data-action="delete-patient" data-id="${patient.id}">Delete</button>
          </td>
        </tr>
      `).join('');
    }

    const departmentSelect = document.getElementById('patientDepartmentFilter');
    if (departmentSelect) {
      const options = Array.from(new Set((app.state.patients || []).map((patient) => patient.department))).map((dept) => `<option value="${dept}">${dept}</option>`).join('');
      departmentSelect.innerHTML = '<option value="">All departments</option>' + options;
    }
  }

  function bindEvents() {
    document.addEventListener('DOMContentLoaded', function () {
      const form = document.getElementById('patientForm');
      const searchInput = document.getElementById('patientSearch');
      const filterSelect = document.getElementById('patientDepartmentFilter');
      const cancelButton = document.getElementById('cancelPatientEdit');

      searchInput?.addEventListener('input', render);
      filterSelect?.addEventListener('change', render);
      cancelButton?.addEventListener('click', function () {
        form.reset();
        document.getElementById('patientIdField').value = '';
        document.getElementById('patientFormTitle').textContent = 'Add Patient';
      });

      form?.addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(form);
        const patient = {
          id: document.getElementById('patientIdField').value || `P-${Date.now()}`,
          fullName: formData.get('fullName').toString().trim(),
          age: Number(formData.get('age')),
          gender: formData.get('gender').toString(),
          phone: formData.get('phone').toString().trim(),
          email: formData.get('email').toString().trim(),
          address: formData.get('address').toString().trim(),
          bloodGroup: formData.get('bloodGroup').toString(),
          emergencyContact: formData.get('emergencyContact').toString().trim(),
          registrationDate: formData.get('registrationDate').toString() || app.utils.getCurrentDate(),
          department: formData.get('department').toString(),
          assignedDoctor: formData.get('assignedDoctor').toString(),
          status: formData.get('status').toString()
        };

        if (!patient.fullName || !patient.phone) {
          app.utils.showToast('Please fill all required patient fields', 'danger');
          return;
        }

        const patients = app.state.patients || [];
        const index = patients.findIndex((item) => item.id === patient.id);
        if (index >= 0) patients[index] = patient; else patients.push(patient);
        app.state.patients = patients;
        app.storage.save();
        app.refreshAll();
        form.reset();
        document.getElementById('patientIdField').value = '';
        document.getElementById('patientFormTitle').textContent = 'Add Patient';
        app.utils.showToast('Patient record saved', 'success');
      });

      document.body.addEventListener('click', function (event) {
        const button = event.target.closest('[data-action="edit-patient"]');
        if (button) {
          const patient = (app.state.patients || []).find((item) => item.id === button.dataset.id);
          if (!patient) return;
          Object.entries(patient).forEach(([key, value]) => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) input.value = value;
          });
          document.getElementById('patientIdField').value = patient.id;
          document.getElementById('patientFormTitle').textContent = 'Edit Patient';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        const deleteButton = event.target.closest('[data-action="delete-patient"]');
        if (deleteButton) {
          const patientId = deleteButton.dataset.id;
          app.utils.confirm('Delete Patient', 'Are you sure you want to remove this patient record?', function () {
            app.state.patients = (app.state.patients || []).filter((patient) => patient.id !== patientId);
            app.storage.save();
            app.refreshAll();
            app.utils.showToast('Patient deleted', 'success');
          });
        }
      });
    });
  }

  bindEvents();
  app.modules.patients = { render };
})();

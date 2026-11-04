(function () {
  const app = window.smartCareApp;
  app.modules = app.modules || {};

  function render() {
    const tableBody = document.getElementById('doctorTableBody');
    const searchTerm = document.getElementById('doctorSearch')?.value.trim().toLowerCase() || '';
    if (!tableBody) return;

    let rows = app.state.doctors || [];
    if (searchTerm) rows = rows.filter((doctor) => `${doctor.fullName} ${doctor.department}`.toLowerCase().includes(searchTerm));

    if (!rows.length) {
      tableBody.innerHTML = '<tr><td colspan="6"><div class="empty-state">No doctors match the current search.</div></td></tr>';
      return;
    }

    tableBody.innerHTML = rows.map((doctor) => `
      <tr>
        <td>${doctor.id}</td>
        <td>${doctor.fullName}</td>
        <td>${doctor.department}</td>
        <td><span class="status-pill ${app.utils.getStatusClass(doctor.status)}">${doctor.status}</span></td>
        <td>${app.utils.formatCurrency(doctor.fee)}</td>
        <td>
          <button class="action-btn" data-action="edit-doctor" data-id="${doctor.id}">Edit</button>
          <button class="action-btn delete" data-action="delete-doctor" data-id="${doctor.id}">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  function bindEvents() {
    document.addEventListener('DOMContentLoaded', function () {
      const form = document.getElementById('doctorForm');
      const searchInput = document.getElementById('doctorSearch');
      const cancelButton = document.getElementById('cancelDoctorEdit');

      searchInput?.addEventListener('input', render);
      cancelButton?.addEventListener('click', function () {
        form.reset();
        document.getElementById('doctorIdField').value = '';
        document.getElementById('doctorFormTitle').textContent = 'Add Doctor';
      });

      form?.addEventListener('submit', function (event) {
        event.preventDefault();
        const data = new FormData(form);
        const doctor = {
          id: document.getElementById('doctorIdField').value || `DR-${Date.now()}`,
          fullName: data.get('fullName').toString().trim(),
          specialization: data.get('specialization').toString().trim(),
          department: data.get('department').toString(),
          phone: data.get('phone').toString().trim(),
          email: data.get('email').toString().trim(),
          experience: Number(data.get('experience')) || 0,
          fee: Number(data.get('fee')) || 0,
          availableDays: data.get('availableDays').toString().trim(),
          availableTime: data.get('availableTime').toString().trim(),
          status: data.get('status').toString()
        };

        const doctors = app.state.doctors || [];
        const index = doctors.findIndex((item) => item.id === doctor.id);
        if (index >= 0) doctors[index] = doctor; else doctors.push(doctor);
        app.state.doctors = doctors;
        app.storage.save();
        app.refreshAll();
        form.reset();
        document.getElementById('doctorIdField').value = '';
        document.getElementById('doctorFormTitle').textContent = 'Add Doctor';
        app.utils.showToast('Doctor record saved', 'success');
      });

      document.body.addEventListener('click', function (event) {
        const editButton = event.target.closest('[data-action="edit-doctor"]');
        if (editButton) {
          const doctor = (app.state.doctors || []).find((item) => item.id === editButton.dataset.id);
          if (!doctor) return;
          const form = document.getElementById('doctorForm');
          Object.entries(doctor).forEach(([key, value]) => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) input.value = value;
          });
          document.getElementById('doctorIdField').value = doctor.id;
          document.getElementById('doctorFormTitle').textContent = 'Edit Doctor';
        }

        const deleteButton = event.target.closest('[data-action="delete-doctor"]');
        if (deleteButton) {
          const doctorId = deleteButton.dataset.id;
          app.utils.confirm('Delete Doctor', 'Remove this doctor profile?', function () {
            app.state.doctors = (app.state.doctors || []).filter((doctor) => doctor.id !== doctorId);
            app.storage.save();
            app.refreshAll();
            app.utils.showToast('Doctor deleted', 'success');
          });
        }
      });
    });
  }

  bindEvents();
  app.modules.doctors = { render };
})();

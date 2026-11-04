(function () {
  const app = window.smartCareApp;
  app.modules = app.modules || {};

  function render() {
    const patientSelect = document.getElementById('appointmentPatientSelect');
    if (patientSelect) {
      patientSelect.innerHTML = (app.state.patients || []).map((patient) => `<option value="${patient.id}">${patient.fullName}</option>`).join('');
    }

    const doctorSelect = document.getElementById('appointmentDoctorSelect');
    if (doctorSelect) {
      doctorSelect.innerHTML = (app.state.doctors || []).map((doctor) => `<option value="${doctor.id}">${doctor.fullName}</option>`).join('');
    }

    const tableBody = document.getElementById('appointmentTableBody');
    const dateFilter = document.getElementById('appointmentDateFilter')?.value || '';
    const statusFilter = document.getElementById('appointmentStatusFilter')?.value || '';
    if (!tableBody) return;

    let rows = app.state.appointments || [];
    if (dateFilter) rows = rows.filter((item) => item.date === dateFilter);
    if (statusFilter) rows = rows.filter((item) => item.status === statusFilter);

    if (!rows.length) {
      tableBody.innerHTML = '<tr><td colspan="6"><div class="empty-state">No appointments for the selected criteria.</div></td></tr>';
      return;
    }

    tableBody.innerHTML = rows.map((appointment) => `
      <tr>
        <td>${app.utils.getPatientName(appointment.patientId)}</td>
        <td>${app.utils.getDoctorName(appointment.doctorId)}</td>
        <td>${appointment.date}</td>
        <td>${appointment.time}</td>
        <td><span class="status-pill ${app.utils.getStatusClass(appointment.status)}">${appointment.status}</span></td>
        <td>
          <button class="action-btn" data-action="edit-appointment" data-id="${appointment.id}">Edit</button>
          <button class="action-btn delete" data-action="delete-appointment" data-id="${appointment.id}">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  function bindEvents() {
    document.addEventListener('DOMContentLoaded', function () {
      const form = document.getElementById('appointmentForm');
      const dateFilter = document.getElementById('appointmentDateFilter');
      const statusFilter = document.getElementById('appointmentStatusFilter');
      const cancelButton = document.getElementById('cancelAppointmentEdit');

      dateFilter?.addEventListener('change', render);
      statusFilter?.addEventListener('change', render);
      cancelButton?.addEventListener('click', function () {
        form.reset();
        document.getElementById('appointmentIdField').value = '';
        document.getElementById('appointmentFormTitle').textContent = 'Book Appointment';
      });

      form?.addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(form);
        const appointment = {
          id: document.getElementById('appointmentIdField').value || `APT-${Date.now()}`,
          patientId: formData.get('patientId').toString(),
          doctorId: formData.get('doctorId').toString(),
          department: formData.get('department').toString(),
          date: formData.get('date').toString(),
          time: formData.get('time').toString(),
          status: formData.get('status').toString()
        };

        const conflicts = (app.state.appointments || []).some((item) => item.doctorId === appointment.doctorId && item.date === appointment.date && item.time === appointment.time && item.id !== appointment.id);
        if (conflicts) {
          app.utils.showToast('Doctor has a conflicting appointment at that time', 'danger');
          return;
        }

        const appointments = app.state.appointments || [];
        const index = appointments.findIndex((item) => item.id === appointment.id);
        if (index >= 0) appointments[index] = appointment; else appointments.push(appointment);
        app.state.appointments = appointments;
        app.storage.save();
        app.refreshAll();
        form.reset();
        document.getElementById('appointmentIdField').value = '';
        document.getElementById('appointmentFormTitle').textContent = 'Book Appointment';
        app.utils.showToast('Appointment saved', 'success');
      });

      document.body.addEventListener('click', function (event) {
        const editButton = event.target.closest('[data-action="edit-appointment"]');
        if (editButton) {
          const appointment = (app.state.appointments || []).find((item) => item.id === editButton.dataset.id);
          if (!appointment) return;
          const form = document.getElementById('appointmentForm');
          Object.entries(appointment).forEach(([key, value]) => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) input.value = value;
          });
          document.getElementById('appointmentIdField').value = appointment.id;
          document.getElementById('appointmentFormTitle').textContent = 'Edit Appointment';
        }

        const deleteButton = event.target.closest('[data-action="delete-appointment"]');
        if (deleteButton) {
          const appointmentId = deleteButton.dataset.id;
          app.utils.confirm('Delete Appointment', 'Cancel this appointment?', function () {
            app.state.appointments = (app.state.appointments || []).filter((item) => item.id !== appointmentId);
            app.storage.save();
            app.refreshAll();
            app.utils.showToast('Appointment cancelled', 'success');
          });
        }
      });
    });
  }

  bindEvents();
  app.modules.appointments = { render };
})();

(function () {
  const app = window.smartCareApp;
  app.modules = app.modules || {};

  function render() {
    const tableBody = document.getElementById('staffTableBody');
    const searchTerm = document.getElementById('staffSearch')?.value.trim().toLowerCase() || '';
    if (!tableBody) return;

    let rows = app.state.staff || [];
    if (searchTerm) rows = rows.filter((staff) => `${staff.fullName} ${staff.role}`.toLowerCase().includes(searchTerm));

    if (!rows.length) {
      tableBody.innerHTML = '<tr><td colspan="5"><div class="empty-state">No staff members match the current search.</div></td></tr>';
      return;
    }

    tableBody.innerHTML = rows.map((staff) => `
      <tr>
        <td>${staff.fullName}</td>
        <td>${staff.role}</td>
        <td>${staff.department}</td>
        <td><span class="status-pill ${app.utils.getStatusClass(staff.status)}">${staff.status}</span></td>
        <td>
          <button class="action-btn" data-action="edit-staff" data-id="${staff.id}">Edit</button>
          <button class="action-btn delete" data-action="delete-staff" data-id="${staff.id}">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  function bindEvents() {
    document.addEventListener('DOMContentLoaded', function () {
      const form = document.getElementById('staffForm');
      const searchInput = document.getElementById('staffSearch');
      const cancelButton = document.getElementById('cancelStaffEdit');

      searchInput?.addEventListener('input', render);
      cancelButton?.addEventListener('click', function () {
        form.reset();
        document.getElementById('staffIdField').value = '';
        document.getElementById('staffFormTitle').textContent = 'Add Staff';
      });

      form?.addEventListener('submit', function (event) {
        event.preventDefault();
        const data = new FormData(form);
        const staff = {
          id: document.getElementById('staffIdField').value || `ST-${Date.now()}`,
          fullName: data.get('fullName').toString().trim(),
          role: data.get('role').toString().trim(),
          department: data.get('department').toString(),
          phone: data.get('phone').toString().trim(),
          email: data.get('email').toString().trim(),
          status: data.get('status').toString()
        };

        const staffList = app.state.staff || [];
        const index = staffList.findIndex((item) => item.id === staff.id);
        if (index >= 0) staffList[index] = staff; else staffList.push(staff);
        app.state.staff = staffList;
        app.storage.save();
        app.refreshAll();
        form.reset();
        document.getElementById('staffIdField').value = '';
        document.getElementById('staffFormTitle').textContent = 'Add Staff';
        app.utils.showToast('Staff record saved', 'success');
      });

      document.body.addEventListener('click', function (event) {
        const editButton = event.target.closest('[data-action="edit-staff"]');
        if (editButton) {
          const staff = (app.state.staff || []).find((item) => item.id === editButton.dataset.id);
          if (!staff) return;
          const form = document.getElementById('staffForm');
          Object.entries(staff).forEach(([key, value]) => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) input.value = value;
          });
          document.getElementById('staffIdField').value = staff.id;
          document.getElementById('staffFormTitle').textContent = 'Edit Staff';
        }

        const deleteButton = event.target.closest('[data-action="delete-staff"]');
        if (deleteButton) {
          const staffId = deleteButton.dataset.id;
          app.utils.confirm('Delete Staff', 'Remove this staff profile?', function () {
            app.state.staff = (app.state.staff || []).filter((item) => item.id !== staffId);
            app.storage.save();
            app.refreshAll();
            app.utils.showToast('Staff removed', 'success');
          });
        }
      });
    });
  }

  bindEvents();
  app.modules.staff = { render };
})();

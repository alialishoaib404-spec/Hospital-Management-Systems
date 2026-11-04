(function () {
  const app = window.smartCareApp;
  app.modules = app.modules || {};

  function render() {
    const tableBody = document.getElementById('medicineTableBody');
    const searchTerm = document.getElementById('medicineSearch')?.value.trim().toLowerCase() || '';
    if (!tableBody) return;

    let rows = app.state.medicines || [];
    if (searchTerm) rows = rows.filter((medicine) => `${medicine.name} ${medicine.category}`.toLowerCase().includes(searchTerm));

    if (!rows.length) {
      tableBody.innerHTML = '<tr><td colspan="6"><div class="empty-state">No medicines match the current search.</div></td></tr>';
      return;
    }

    tableBody.innerHTML = rows.map((medicine) => `
      <tr>
        <td>${medicine.name}</td>
        <td>${medicine.category}</td>
        <td>${medicine.quantity}</td>
        <td>${app.utils.formatCurrency(medicine.unitPrice)}</td>
        <td><span class="status-pill ${app.utils.getStatusClass(medicine.stockStatus)}">${medicine.stockStatus}</span></td>
        <td>
          <button class="action-btn" data-action="edit-medicine" data-id="${medicine.id}">Edit</button>
          <button class="action-btn delete" data-action="delete-medicine" data-id="${medicine.id}">Delete</button>
        </td>
      </tr>
    `).join('');

    const inventoryOverview = document.getElementById('inventoryOverviewBody');
    if (inventoryOverview) {
      inventoryOverview.innerHTML = rows.map((medicine) => `
        <tr>
          <td>${medicine.name}</td>
          <td>${medicine.category}</td>
          <td>${medicine.quantity}</td>
          <td>${medicine.expiryDate || 'N/A'}</td>
          <td><span class="status-pill ${app.utils.getStatusClass(medicine.stockStatus)}">${medicine.stockStatus}</span></td>
        </tr>
      `).join('');
    }
  }

  function bindEvents() {
    document.addEventListener('DOMContentLoaded', function () {
      const form = document.getElementById('medicineForm');
      const searchInput = document.getElementById('medicineSearch');
      const cancelButton = document.getElementById('cancelMedicineEdit');

      searchInput?.addEventListener('input', render);
      cancelButton?.addEventListener('click', function () {
        form.reset();
        document.getElementById('medicineIdField').value = '';
        document.getElementById('medicineFormTitle').textContent = 'Add Medicine';
      });

      form?.addEventListener('submit', function (event) {
        event.preventDefault();
        const data = new FormData(form);
        const medicine = {
          id: document.getElementById('medicineIdField').value || `MED-${Date.now()}`,
          name: data.get('name').toString().trim(),
          category: data.get('category').toString().trim(),
          manufacturer: data.get('manufacturer').toString().trim(),
          batchNumber: data.get('batchNumber').toString().trim(),
          quantity: Number(data.get('quantity')) || 0,
          unitPrice: Number(data.get('unitPrice')) || 0,
          expiryDate: data.get('expiryDate').toString(),
          supplier: data.get('supplier').toString().trim(),
          stockStatus: data.get('stockStatus').toString()
        };

        const medicines = app.state.medicines || [];
        const index = medicines.findIndex((item) => item.id === medicine.id);
        if (index >= 0) medicines[index] = medicine; else medicines.push(medicine);
        app.state.medicines = medicines;
        app.storage.save();
        app.refreshAll();
        form.reset();
        document.getElementById('medicineIdField').value = '';
        document.getElementById('medicineFormTitle').textContent = 'Add Medicine';
        app.utils.showToast('Medicine saved', 'success');
      });

      document.body.addEventListener('click', function (event) {
        const editButton = event.target.closest('[data-action="edit-medicine"]');
        if (editButton) {
          const medicine = (app.state.medicines || []).find((item) => item.id === editButton.dataset.id);
          if (!medicine) return;
          const form = document.getElementById('medicineForm');
          Object.entries(medicine).forEach(([key, value]) => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) input.value = value;
          });
          document.getElementById('medicineIdField').value = medicine.id;
          document.getElementById('medicineFormTitle').textContent = 'Edit Medicine';
        }

        const deleteButton = event.target.closest('[data-action="delete-medicine"]');
        if (deleteButton) {
          const medicineId = deleteButton.dataset.id;
          app.utils.confirm('Delete Medicine', 'Remove this medicine from inventory?', function () {
            app.state.medicines = (app.state.medicines || []).filter((item) => item.id !== medicineId);
            app.storage.save();
            app.refreshAll();
            app.utils.showToast('Medicine removed', 'success');
          });
        }
      });
    });
  }

  bindEvents();
  app.modules.pharmacy = { render };
})();

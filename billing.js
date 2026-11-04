(function () {
  const app = window.smartCareApp;
  app.modules = app.modules || {};

  function render() {
    const patientSelect = document.getElementById('billingPatientSelect');
    if (patientSelect) {
      patientSelect.innerHTML = (app.state.patients || []).map((patient) => `<option value="${patient.id}">${patient.fullName}</option>`).join('');
    }

    const invoiceBody = document.getElementById('invoiceTableBody');
    if (!invoiceBody) return;
    invoiceBody.innerHTML = (app.state.invoices || []).map((invoice) => `
      <tr>
        <td>${invoice.id}</td>
        <td>${invoice.patientName || app.utils.getPatientName(invoice.patientId)}</td>
        <td>${app.utils.formatCurrency(invoice.total)}</td>
        <td><span class="status-pill ${app.utils.getStatusClass(invoice.status)}">${invoice.status}</span></td>
        <td><button class="action-btn" data-action="pay-invoice" data-id="${invoice.id}">Mark Paid</button></td>
      </tr>
    `).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('billingForm');
    form?.addEventListener('submit', function (event) {
      event.preventDefault();
      const data = new FormData(form);
      const patientId = data.get('patientId').toString();
      const patientName = app.utils.getPatientName(patientId);
      const consultationCharge = Number(data.get('consultationCharge')) || 0;
      const admissionCharge = Number(data.get('admissionCharge')) || 0;
      const bedCharge = Number(data.get('bedCharge')) || 0;
      const labCharge = Number(data.get('labCharge')) || 0;
      const pharmacyCharge = Number(data.get('pharmacyCharge')) || 0;
      const extraCharge = Number(data.get('extraCharge')) || 0;
      const discount = Number(data.get('discount')) || 0;
      const total = consultationCharge + admissionCharge + bedCharge + labCharge + pharmacyCharge + extraCharge - discount;

      const invoice = {
        id: `INV-${Date.now()}`,
        patientId,
        patientName,
        total,
        status: data.get('status').toString()
      };

      app.state.invoices = [...(app.state.invoices || []), invoice];
      app.storage.save();
      app.refreshAll();
      form.reset();
      app.utils.showToast('Invoice generated', 'success');
    });

    document.body.addEventListener('click', function (event) {
      const button = event.target.closest('[data-action="pay-invoice"]');
      if (!button) return;
      const invoiceId = button.dataset.id;
      app.state.invoices = (app.state.invoices || []).map((invoice) => invoice.id === invoiceId ? { ...invoice, status: 'Paid' } : invoice);
      app.storage.save();
      app.refreshAll();
      app.utils.showToast('Invoice marked paid', 'success');
    });
  });

  app.modules.billing = { render };
})();

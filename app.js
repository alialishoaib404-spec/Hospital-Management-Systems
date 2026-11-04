(function () {
  const app = window.smartCareApp = window.smartCareApp || {};
  app.modules = app.modules || {};

  app.utils = {
    formatCurrency: function (value) {
      const amount = Number(value || 0);
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: app.state?.settings?.currency || 'USD' }).format(amount);
    },
    showToast: function (message, type = 'success') {
      const toast = document.getElementById('toast');
      if (!toast) return;
      toast.textContent = message;
      toast.className = `toast show ${type}`;
      window.clearTimeout(this.toastTimer);
      this.toastTimer = window.setTimeout(function () {
        toast.className = 'toast';
      }, 2400);
    },
    getDoctorName: function (doctorId) {
      const doctor = (app.state.doctors || []).find((item) => item.id === doctorId);
      return doctor ? doctor.fullName : 'N/A';
    },
    getPatientName: function (patientId) {
      const patient = (app.state.patients || []).find((item) => item.id === patientId);
      return patient ? patient.fullName : 'Unknown';
    },
    generateId: function (prefix) {
      const list = app.state[prefix === 'DR' ? 'doctors' : prefix === 'P' ? 'patients' : prefix === 'APT' ? 'appointments' : prefix === 'MED' ? 'medicines' : prefix === 'ST' ? 'staff' : 'patients'] || [];
      const numbers = list.map((item) => Number(String(item.id).replace(/\D/g, '')) || 0);
      const current = Math.max(...numbers, 0) + 1;
      return `${prefix}-${String(current).padStart(4, '0')}`;
    },
    confirm: function (title, text, callback) {
      const modal = document.getElementById('confirmModal');
      const titleEl = document.getElementById('confirmModalTitle');
      const textEl = document.getElementById('confirmModalText');
      if (!modal || !titleEl || !textEl) return false;
      titleEl.textContent = title;
      textEl.textContent = text;
      modal.classList.add('show');
      document.getElementById('confirmModalConfirm').onclick = function () {
        modal.classList.remove('show');
        callback();
      };
      document.getElementById('confirmModalCancel').onclick = function () {
        modal.classList.remove('show');
      };
      return true;
    },
    getCurrentDate: function () {
      return new Date().toISOString().slice(0, 10);
    },
    getStatusClass: function (status) {
      const normalized = String(status || '').toLowerCase();
      if (['paid', 'available', 'confirmed', 'completed', 'in stock', 'active', 'admitted', 'healthy'].includes(normalized)) return 'success';
      if (['pending', 'scheduled', 'low stock', 'partially paid', 'waiting', 'on leave', 'monitoring', 'critical', 'reserved'].includes(normalized)) return 'warning';
      if (['cancelled', 'no-show', 'out of stock', 'expired', 'maintenance', 'occupied', 'danger'].includes(normalized)) return 'danger';
      return 'neutral';
    }
  };

  function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    sidebar.classList.toggle('open');
  }

  function switchSection(sectionName) {
    document.querySelectorAll('.nav-link').forEach((button) => {
      button.classList.toggle('active', button.dataset.section === sectionName);
    });
    document.querySelectorAll('.page-section').forEach((section) => {
      section.classList.toggle('active', section.id === `${sectionName}-section`);
    });
  }

  function bindNavigation() {
    document.querySelectorAll('.nav-link').forEach((button) => {
      button.addEventListener('click', function () {
        const section = button.dataset.section;
        if (!section) return;
        switchSection(section);
        if (window.innerWidth < 1040) toggleSidebar();
      });
    });
    document.getElementById('sidebarToggle')?.addEventListener('click', toggleSidebar);
    document.getElementById('logoutButton')?.addEventListener('click', function () {
      app.utils.showToast('You have logged out', 'neutral');
    });
  }

  function updateDateTime() {
    const date = new Date();
    const dateEl = document.getElementById('currentDate');
    const timeEl = document.getElementById('currentTime');
    if (dateEl) dateEl.textContent = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (timeEl) timeEl.textContent = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  app.initCommon = function () {
    bindNavigation();
    updateDateTime();
    setInterval(updateDateTime, 30000);

    document.getElementById('globalSearchInput')?.addEventListener('input', function (event) {
      const term = event.target.value.trim().toLowerCase();
      if (!term) return;
      const matches = [];
      ['patients', 'doctors', 'medicines'].forEach((collection) => {
        const items = app.state[collection] || [];
        items.forEach((item) => {
          const haystack = `${item.fullName || item.name || ''} ${item.id || ''}`.toLowerCase();
          if (haystack.includes(term)) matches.push(`${collection}:${item.id}`);
        });
      });
      app.utils.showToast(matches.length ? `Found ${matches.length} match${matches.length > 1 ? 'es' : ''}` : 'No matches found', matches.length ? 'success' : 'neutral');
    });

    document.getElementById('notificationButton')?.addEventListener('click', function () {
      app.utils.showToast('You have 3 hospital alerts', 'neutral');
    });

    document.getElementById('dashboardRefreshBtn')?.addEventListener('click', function () {
      if (app.refreshAll) app.refreshAll();
      app.utils.showToast('Dashboard refreshed', 'success');
    });

    document.getElementById('resetDataButton')?.addEventListener('click', function () {
      app.utils.confirm('Reset Demo Data', 'This will restore the default sample records. Continue?', function () {
        app.storage.reset();
      });
    });
  };

  app.refreshAll = function () {
    if (app.modules.dashboard) app.modules.dashboard.render();
    if (app.modules.patients) app.modules.patients.render();
    if (app.modules.doctors) app.modules.doctors.render();
    if (app.modules.appointments) app.modules.appointments.render();
    if (app.modules.opd) app.modules.opd.render();
    if (app.modules.ipd) app.modules.ipd.render();
    if (app.modules.beds) app.modules.beds.render();
    if (app.modules.pharmacy) app.modules.pharmacy.render();
    if (app.modules.billing) app.modules.billing.render();
    if (app.modules.laboratory) app.modules.laboratory.render();
    if (app.modules.staff) app.modules.staff.render();
    if (app.modules.reports) app.modules.reports.render();
    if (app.modules.settings) app.modules.settings.render();
  };

  document.addEventListener('DOMContentLoaded', function () {
    app.initCommon();
    app.refreshAll();
  });
})();

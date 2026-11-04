(function () {
  const app = window.smartCareApp;
  app.modules = app.modules || {};

  function render() {
    const form = document.getElementById('settingsForm');
    if (!form) return;
    const settings = app.state.settings || {};
    form.querySelector('[name="hospitalName"]').value = settings.hospitalName || 'SmartCare Hospital';
    form.querySelector('[name="currency"]').value = settings.currency || 'USD';
    form.querySelector('[name="timezone"]').value = settings.timezone || 'UTC+05:30';
  }

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('settingsForm');
    form?.addEventListener('submit', function (event) {
      event.preventDefault();
      const data = new FormData(form);
      app.state.settings = {
        hospitalName: data.get('hospitalName').toString() || 'SmartCare Hospital',
        currency: data.get('currency').toString(),
        timezone: data.get('timezone').toString()
      };
      app.storage.save();
      app.utils.showToast('Settings updated', 'success');
    });
  });

  app.modules.settings = { render };
})();

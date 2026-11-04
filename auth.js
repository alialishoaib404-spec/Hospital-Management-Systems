(function () {
  const USERS_KEY = 'smartcare_demo_users';
  const SESSION_KEY = 'smartcare_demo_session';
  const publicApp = document.getElementById('publicApp');
  const adminApp = document.getElementById('adminApp');

  function getUsers() {
    try {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      return Array.isArray(users) ? users : [];
    } catch (error) {
      console.warn('Could not load demo accounts:', error);
      return [];
    }
  }

  async function hashPassword(password) {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error('Password hashing is unavailable in this browser context. Open this demo through localhost.');
    }
    const bytes = new TextEncoder().encode(password);
    const digest = await window.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  function clearErrors() {
    document.querySelectorAll('.auth-error').forEach((element) => {
      element.textContent = '';
      element.classList.remove('auth-success');
    });
  }

  function showPublicView(viewName) {
    document.querySelectorAll('.public-view').forEach((view) => {
      view.classList.toggle('active', view.id === `${viewName}-view`);
    });
    document.querySelectorAll('[data-public-view]').forEach((control) => {
      if (control.matches('a')) control.classList.toggle('active', control.dataset.publicView === viewName);
    });
    document.getElementById('publicNavLinks')?.classList.remove('open');
    document.getElementById('publicMenuToggle')?.setAttribute('aria-expanded', 'false');
    clearErrors();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function enterAdmin(user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    publicApp.classList.add('hidden');
    adminApp.classList.remove('hidden');
    const name = user.name || 'Admin';
    const nameEl = document.querySelector('.user-meta strong');
    const roleEl = document.querySelector('.user-meta small');
    const avatarEl = document.querySelector('.user-avatar');
    if (nameEl) nameEl.textContent = name;
    if (roleEl) roleEl.textContent = user.role || 'Hospital Admin';
    if (avatarEl) avatarEl.textContent = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
    window.smartCareApp?.refreshAll();
    window.scrollTo({ top: 0 });
  }

  document.querySelectorAll('[data-public-view]').forEach((control) => {
    control.addEventListener('click', function (event) {
      event.preventDefault();
      showPublicView(control.dataset.publicView);
    });
  });

  document.querySelectorAll('[data-scroll-target]').forEach((link) => {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      document.getElementById(link.dataset.scrollTarget)?.scrollIntoView({ behavior: 'smooth' });
      document.getElementById('publicNavLinks')?.classList.remove('open');
      document.getElementById('publicMenuToggle')?.setAttribute('aria-expanded', 'false');
    });
  });

  document.getElementById('publicMenuToggle')?.addEventListener('click', function () {
    const nav = document.getElementById('publicNavLinks');
    const isOpen = nav.classList.toggle('open');
    this.setAttribute('aria-expanded', String(isOpen));
  });

  document.querySelectorAll('[data-toggle-password]').forEach((button) => {
    button.addEventListener('click', function () {
      const input = document.getElementById(button.dataset.togglePassword);
      if (!input) return;
      const visible = input.type === 'password';
      input.type = visible ? 'text' : 'password';
      button.textContent = visible ? 'Hide' : 'Show';
      button.setAttribute('aria-label', visible ? 'Hide password' : 'Show password');
    });
  });

  document.getElementById('loginForm')?.addEventListener('submit', async function (event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = formData.get('email').toString().trim().toLowerCase();
    const password = formData.get('password').toString();
    const errorEl = document.getElementById('loginError');

    try {
      const passwordHash = await hashPassword(password);
      const user = getUsers().find((account) => account.email === email && account.passwordHash === passwordHash);
      if (!user) {
        errorEl.textContent = 'Email or password is incorrect. You can also try the demo admin.';
        return;
      }
      enterAdmin({ name: user.name, hospital: user.hospital, role: 'Hospital Admin' });
      form.reset();
    } catch (error) {
      errorEl.textContent = error.message;
    }
  });

  document.getElementById('registerForm')?.addEventListener('submit', async function (event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = formData.get('email').toString().trim().toLowerCase();
    const errorEl = document.getElementById('registerError');
    const users = getUsers();
    if (users.some((user) => user.email === email)) {
      errorEl.textContent = 'An account with this email already exists in this browser.';
      return;
    }

    try {
      const account = {
        name: formData.get('name').toString().trim(),
        hospital: formData.get('hospital').toString().trim(),
        email,
        passwordHash: await hashPassword(formData.get('password').toString())
      };
      users.push(account);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      form.reset();
      showPublicView('login');
      document.getElementById('loginEmail').value = email;
      document.getElementById('loginError').textContent = 'Demo account created. Sign in with your email and password.';
      document.getElementById('loginError').classList.add('auth-success');
    } catch (error) {
      errorEl.textContent = error.message;
    }
  });

  document.getElementById('demoLoginButton')?.addEventListener('click', function () {
    enterAdmin({ name: 'Admin', hospital: 'SmartCare Hospital', role: 'Hospital Admin' });
  });

  document.getElementById('forgotPasswordLink')?.addEventListener('click', function (event) {
    event.preventDefault();
    const errorEl = document.getElementById('loginError');
    errorEl.classList.remove('auth-success');
    errorEl.textContent = 'Password recovery is not available in this local demo.';
  });

  document.getElementById('logoutButton')?.addEventListener('click', function () {
    sessionStorage.removeItem(SESSION_KEY);
    adminApp.classList.add('hidden');
    publicApp.classList.remove('hidden');
    showPublicView('home');
  });

  try {
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    if (session) enterAdmin(session);
  } catch (error) {
    sessionStorage.removeItem(SESSION_KEY);
    console.warn('Could not restore demo session:', error);
  }
})();

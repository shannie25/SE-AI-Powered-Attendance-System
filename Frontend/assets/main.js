// assets/main.js
(function () {
  const API_BASE = 'http://localhost:3000/api';

  function qs(sel) { return document.querySelector(sel); }

  function getUser() {
    return localStorage.getItem('eduface_user')
      ? JSON.parse(localStorage.getItem('eduface_user'))
      : null;
  }

  async function postJSON(url, body) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      // Always try to parse JSON response
      const data = await res.json();
      
      // If server returned an error status but with JSON data, return it
      if (!res.ok && data) {
        return data;
      }
      
      return data;
    } catch (error) {
      console.error('Network or parsing error:', error);
      return { ok: false, msg: 'Connection error. Please check if the server is running.' };
    }
  }

  /* =========================
     LOGIN (SINGLE SOURCE)
  ========================= */
  async function login({ emailOrId, password, role }) {
    const res = await postJSON(`${API_BASE}/auth/login`, {
      emailOrId,
      password,
      role
    });

    if (res.ok && res.user) {
      localStorage.setItem('eduface_user', JSON.stringify(res.user));
    }

    return res;
  }

  /* =========================
     LOGIN FORM BINDING
  ========================= */
  function bindLoginForm() {
    const form = qs('#loginForm');
    if (!form) return;

    const role = document.body.dataset.role;
    const dashboard = document.body.dataset.dashboard;
    const msgEl = form.querySelector('.formMsg');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const emailOrId = form.querySelector('[data-login-id]').value.trim();
      const password = form.querySelector('[data-login-password]').value;

      msgEl.textContent = 'Signing in...';
      msgEl.style.color = '#666';

      const res = await login({ emailOrId, password, role });

      if (!res.ok) {
        msgEl.textContent = res.msg || 'Login failed';
        msgEl.style.color = 'red';
        return;
      }

      msgEl.textContent = 'Login successful!';
      msgEl.style.color = 'green';

      setTimeout(() => {
        window.location.href = dashboard;
      }, 300);
    });
  }

  /* =========================
     LOGOUT
  ========================= */
  function logout() {
    localStorage.removeItem('eduface_user');
    window.location.href = 'login.html';
  }

  /* =========================
     PAGE LOAD
  ========================= */
  document.addEventListener('DOMContentLoaded', () => {
    bindLoginForm();

    // protect admin dashboard
    if (document.body.dataset.protected === 'admin') {
      const u = getUser();
      if (!u || u.role !== 'Admin') {
        window.location.href = 'login.html';
      }
    }
  });

  window.EduFace = { logout };

})();
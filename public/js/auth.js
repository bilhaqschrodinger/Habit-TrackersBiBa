// public/js/auth.js

let currentMode = 'login';

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (token) {
    window.location.href = 'index.html';
  }
});

function switchAuthTab(mode) {
  currentMode = mode;
  const tabLogin = document.getElementById('tab-btn-login');
  const tabRegister = document.getElementById('tab-btn-register');
  const groupUsername = document.getElementById('group-username');
  const heading = document.getElementById('auth-heading');
  const subheading = document.getElementById('auth-subheading');
  const btnSubmit = document.getElementById('btn-submit');
  const alertBox = document.getElementById('alert-box');

  alertBox.style.display = 'none';

  if (mode === 'login') {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    groupUsername.classList.add('hidden');
    heading.textContent = 'Masuk ke Akun';
    subheading.textContent = 'Pantau kebiasaan dan perkembangan harian Anda';
    btnSubmit.textContent = 'Masuk';
  } else {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    groupUsername.classList.remove('hidden');
    heading.textContent = 'Buat Akun Baru';
    subheading.textContent = 'Mulai bangun kebiasaan positif dan lacak konsistensi Anda';
    btnSubmit.textContent = 'Daftar Akun';
  }
}

function showAlert(message, type = 'error') {
  const alertBox = document.getElementById('alert-box');
  alertBox.textContent = message;
  alertBox.className = `alert-box ${type === 'error' ? 'alert-error' : 'alert-success'}`;
  alertBox.style.display = 'block';
}

async function handleAuthSubmit(e) {
  e.preventDefault();

  const email = document.getElementById('input-email').value.trim();
  const password = document.getElementById('input-password').value;
  const username = document.getElementById('input-username').value.trim();
  const btnSubmit = document.getElementById('btn-submit');

  if (currentMode === 'register' && !username) {
    showAlert('Username wajib diisi.');
    return;
  }

  btnSubmit.disabled = true;
  btnSubmit.textContent = 'Memproses...';

  try {
    const endpoint = currentMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = currentMode === 'login'
      ? { email, password }
      : { username, email, password };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Gagal memproses permintaan.');
    }

    if (currentMode === 'login') {
      showAlert('Login berhasil! Mengalihkan...', 'success');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 700);
    } else {
      showAlert('Registrasi berhasil! Silakan masuk dengan akun Anda.', 'success');
      setTimeout(() => {
        switchAuthTab('login');
        document.getElementById('input-email').value = email;
      }, 1200);
    }

  } catch (err) {
    showAlert(err.message || 'Terjadi kesalahan pada server.');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = currentMode === 'login' ? 'Masuk' : 'Daftar Akun';
  }
}

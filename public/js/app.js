// public/js/app.js

let profiles = [];
let activeProfile = null;
let habits = [];
let currentFilter = 'all'; // 'all' | 'daily' | 'weekly'

document.addEventListener('DOMContentLoaded', async () => {
  await loadProfiles();

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('profile-menu');
    const toggleBtn = document.getElementById('profile-toggle-btn');
    if (toggleBtn && !toggleBtn.contains(e.target) && dropdown && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Keyboard accessibility: Escape closes dropdown or add form
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const dropdown = document.getElementById('profile-menu');
      if (dropdown && !dropdown.classList.contains('hidden')) {
        dropdown.classList.add('hidden');
        document.getElementById('profile-toggle-btn').setAttribute('aria-expanded', 'false');
      }
      const form = document.getElementById('panel-add-form');
      if (form && !form.classList.contains('hidden')) {
        toggleAddForm();
      }
    }
  });
});

// 1. PROFILES MANAGEMENT
async function loadProfiles() {
  try {
    const res = await fetch('/api/profiles');
    if (res.ok) {
      profiles = await res.json();
    }
  } catch (err) {
    console.warn("Gagal memuat profil dari server, menggunakan fallback.");
    profiles = [{ id: 1, name: "Bagas" }];
  }

  if (!profiles || profiles.length === 0) {
    profiles = [{ id: 1, name: "Bagas" }];
  }

  const savedId = localStorage.getItem('biba_active_profile');
  activeProfile = profiles.find(p => p.id === Number(savedId)) || profiles[0];
  localStorage.setItem('biba_active_profile', activeProfile.id);

  updateProfileViews();
  await loadHabits();
}

function updateProfileViews() {
  if (!activeProfile) return;

  const initial = activeProfile.name.charAt(0).toUpperCase() || 'U';

  // Header button
  document.getElementById('profile-avatar-initial').textContent = initial;
  document.getElementById('profile-btn-name').textContent = activeProfile.name;

  // Sidebar profile card
  document.getElementById('sidebar-avatar').textContent = initial;
  document.getElementById('sidebar-name').textContent = activeProfile.name;

  renderProfileDropdown();
}

function toggleProfileDropdown() {
  const menu = document.getElementById('profile-menu');
  const btn = document.getElementById('profile-toggle-btn');
  const isClosed = menu.classList.contains('hidden');

  if (isClosed) {
    menu.classList.remove('hidden');
    btn.setAttribute('aria-expanded', 'true');
  } else {
    menu.classList.add('hidden');
    btn.setAttribute('aria-expanded', 'false');
  }
}

function renderProfileDropdown() {
  const container = document.getElementById('profile-menu-items');
  container.innerHTML = '';

  profiles.forEach(p => {
    const btn = document.createElement('button');
    const isActive = p.id === activeProfile.id;
    btn.className = `dropdown-item ${isActive ? 'is-active' : ''}`;
    btn.setAttribute('role', 'menuitem');
    btn.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="avatar-badge" style="width: 18px; height: 18px; font-size: 10px; ${isActive ? '' : 'background-color: var(--text-muted);'}">
          ${p.name.charAt(0).toUpperCase()}
        </span>
        <span>${escapeHtml(p.name)}</span>
      </div>
      ${isActive ? '<span style="font-size: 11px; color: var(--accent-done); font-weight: 600;">Aktif</span>' : ''}
    `;

    btn.onclick = () => selectProfile(p.id);
    container.appendChild(btn);
  });
}

async function selectProfile(id) {
  activeProfile = profiles.find(p => p.id === id);
  if (activeProfile) {
    localStorage.setItem('biba_active_profile', activeProfile.id);
    updateProfileViews();
    document.getElementById('profile-menu').classList.add('hidden');
    document.getElementById('profile-toggle-btn').setAttribute('aria-expanded', 'false');
    await loadHabits();
  }
}

async function promptCreateProfile() {
  const name = prompt("Nama profil baru:");
  if (!name || !name.trim()) return;

  try {
    const res = await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() })
    });
    if (res.ok) {
      const created = await res.json();
      profiles.push(created);
      await selectProfile(created.id);
    }
  } catch (err) {
    alert("Gagal menambahkan profil baru.");
  }
}

async function promptRenameProfile() {
  if (!activeProfile) return;
  const newName = prompt("Ubah nama profil:", activeProfile.name);
  if (!newName || !newName.trim() || newName.trim() === activeProfile.name) return;

  try {
    const res = await fetch(`/api/profiles/${activeProfile.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() })
    });
    if (res.ok) {
      const updated = await res.json();
      activeProfile.name = updated.name;
      const idx = profiles.findIndex(p => p.id === activeProfile.id);
      if (idx !== -1) profiles[idx] = updated;
      updateProfileViews();
    }
  } catch (err) {
    alert("Gagal mengubah nama profil.");
  }
}

async function confirmDeleteProfile() {
  if (!activeProfile) return;
  if (profiles.length <= 1) {
    alert("Tidak dapat menghapus satu-satunya profil yang tersisa.");
    return;
  }

  if (!confirm(`Hapus profil "${activeProfile.name}" beserta semua kebiasaannya?`)) return;

  try {
    const res = await fetch(`/api/profiles/${activeProfile.id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      profiles = profiles.filter(p => p.id !== activeProfile.id);
      await selectProfile(profiles[0].id);
    }
  } catch (err) {
    alert("Gagal menghapus profil.");
  }
}

// 2. HABITS & CHECKIN LOGIC
async function loadHabits() {
  if (!activeProfile) return;

  try {
    const res = await fetch(`/api/habits?profileId=${activeProfile.id}`);
    if (res.ok) {
      habits = await res.json();
    } else {
      habits = [];
    }
  } catch (err) {
    habits = [];
  }

  renderHabitsList();
}

function setFilter(filterType) {
  currentFilter = filterType;

  ['all', 'daily', 'weekly'].forEach(f => {
    const btn = document.getElementById(`filter-btn-${f}`);
    if (btn) {
      const isActive = f === filterType;
      btn.className = `filter-btn ${isActive ? 'is-active' : ''}`;
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    }
  });

  renderHabitsList();
}

function renderHabitsList() {
  const container = document.getElementById('feed-habit-cards');
  container.innerHTML = '';

  const filtered = habits.filter(h => {
    if (currentFilter === 'daily') return h.frequency === 'daily';
    if (currentFilter === 'weekly') return h.frequency === 'weekly';
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="state-empty">
        <div class="state-empty-icon" aria-hidden="true">
          <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
          </svg>
        </div>
        <div class="state-empty-title">Belum ada kebiasaan ${currentFilter !== 'all' ? `(${currentFilter})` : ''}</div>
        <div class="state-empty-desc">Tambahkan rutinitas harian untuk mulai memantau konsistensi Anda.</div>
        <button class="btn btn-secondary" onclick="toggleAddForm()">
          + Tambah Kebiasaan Pertama
        </button>
      </div>
    `;
    updateMetricsSummary();
    return;
  }

  filtered.forEach(h => {
    const card = document.createElement('div');
    card.className = `habit-card ${h.done ? 'is-done' : ''}`;

    card.innerHTML = `
      <div class="habit-leading">
        <button class="habit-checkbox" onclick="toggleCheckHabit(${h.id})" aria-label="${h.done ? 'Tandai belum selesai' : 'Tandai selesai'}" title="${h.done ? 'Sudah selesai' : 'Tandai selesai'}">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </button>
        <div class="habit-details">
          <div class="habit-title">${escapeHtml(h.name)}</div>
          <div class="habit-badges">
            <span class="badge-tag">${escapeHtml(h.category || 'Umum')}</span>
            <span class="badge-tag" style="text-transform: capitalize;">${h.frequency === 'weekly' ? 'Mingguan' : 'Harian'}</span>
            <span class="streak-counter" title="Rentetan hari berturut-turut">
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2c1.1 0 2 .9 2 2 0 .5-.2 1-.5 1.4-.4.5-.5 1.1-.5 1.6 0 1.1.9 2 2 2s2-.9 2-2c0-.5-.2-1-.5-1.4C16.6 5.1 16.5 4.5 16.5 4c0-1.1.9-2 2-2s2 .9 2 2c0 2.2-1.8 4-4 4-1.1 0-2-.9-2-2 0-.5.2-1 .5-1.4.4-.5.5-1.1.5-1.6 0-1.1-.9-2-2-2zM6 14.5C6 9.8 12 4 12 4s6 5.8 6 10.5c0 3.6-2.7 6.5-6 6.5s-6-2.9-6-6.5z"/>
              </svg>
              <span>${h.current_streak || 0} hari</span>
            </span>
          </div>
        </div>
      </div>
      <button class="btn-icon-delete" onclick="deleteHabit(${h.id})" aria-label="Hapus kebiasaan" title="Hapus kebiasaan">
        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </button>
    `;

    container.appendChild(card);
  });

  updateMetricsSummary();
}

function updateMetricsSummary() {
  const total = habits.length;
  const completed = habits.filter(h => h.done).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const maxStreak = habits.reduce((max, h) => Math.max(max, h.current_streak || 0), 0);

  document.getElementById('val-total-habits').textContent = total;
  document.getElementById('val-max-streak').innerHTML = `${maxStreak} <span class="unit">hari</span>`;
  document.getElementById('val-rate').textContent = `${percent}%`;

  document.getElementById('val-progress-text').textContent = `${completed} / ${total} (${percent}%)`;
  document.getElementById('val-progress-fill').style.width = `${percent}%`;
}

function toggleAddForm() {
  const form = document.getElementById('panel-add-form');
  const btn = document.getElementById('btn-toggle-add');
  form.classList.toggle('hidden');

  if (!form.classList.contains('hidden')) {
    document.getElementById('input-habit-name').focus();
    btn.innerHTML = `
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
      </svg>
      <span>Tutup</span>
    `;
  } else {
    btn.innerHTML = `
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
      </svg>
      <span>Tambah Kebiasaan</span>
    `;
  }
}

async function handleFormCreate(e) {
  e.preventDefault();

  const nameInput = document.getElementById('input-habit-name');
  const catInput = document.getElementById('select-habit-category');
  const freqInput = document.getElementById('select-habit-frequency');

  const name = nameInput.value.trim();
  const category = catInput.value;
  const frequency = freqInput.value;

  if (!name || !activeProfile) return;

  try {
    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile_id: activeProfile.id,
        name,
        category,
        frequency
      })
    });

    if (res.ok) {
      const created = await res.json();
      habits.unshift(created);
      renderHabitsList();
    }
  } catch (err) {
    alert("Gagal menyimpan kebiasaan.");
  }

  nameInput.value = '';
  toggleAddForm();
}

async function toggleCheckHabit(id) {
  const habit = habits.find(h => h.id === id);
  if (!habit) return;

  try {
    const res = await fetch(`/api/habits/${id}/checkin`, {
      method: 'POST'
    });

    if (res.ok) {
      const data = await res.json();
      habit.done = data.done;
      habit.current_streak = data.current_streak;
      habit.longest_streak = data.longest_streak;
      renderHabitsList();
    }
  } catch (err) {
    console.error("Gagal melakukan check-in:", err);
  }
}

async function deleteHabit(id) {
  if (!confirm('Hapus kebiasaan ini dari daftar?')) return;

  try {
    const res = await fetch(`/api/habits/${id}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      habits = habits.filter(h => h.id !== id);
      renderHabitsList();
    }
  } catch (err) {
    alert("Gagal menghapus kebiasaan.");
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

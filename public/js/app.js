// public/js/app.js

let profiles = [];
let activeProfile = null;
let habits = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadProfiles();
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('profile-dropdown');
    const pill = e.target.closest('.profile-pill');
    if (!pill && dropdown && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });
});

// 1. MANAJEMEN PROFIL
async function loadProfiles() {
  try {
    const res = await fetch('/api/profiles');
    if (res.ok) {
      profiles = await res.json();
    }
  } catch (err) {
    console.warn("Gagal fetch profiles, fallback local");
    profiles = [{ id: 1, name: "Bagas" }];
  }

  if (profiles.length === 0) {
    profiles = [{ id: 1, name: "Bagas" }];
  }

  // Cek active profile di localStorage
  const savedProfileId = localStorage.getItem('active_profile_id');
  activeProfile = profiles.find(p => p.id === Number(savedProfileId)) || profiles[0];
  localStorage.setItem('active_profile_id', activeProfile.id);

  updateProfileUI();
  await loadHabits();
}

function updateProfileUI() {
  const avatarEl = document.getElementById('profile-avatar');
  const nameEl = document.getElementById('current-profile-name');
  const labelEl = document.getElementById('progress-profile-label');

  const initial = activeProfile.name.charAt(0).toUpperCase() || 'U';
  avatarEl.textContent = initial;
  nameEl.textContent = activeProfile.name;
  labelEl.textContent = activeProfile.name;

  renderProfileDropdownItems();
}

function toggleProfileDropdown() {
  const dropdown = document.getElementById('profile-dropdown');
  dropdown.classList.toggle('hidden');
}

function renderProfileDropdownItems() {
  const listEl = document.getElementById('profile-list-items');
  listEl.innerHTML = '';

  profiles.forEach(p => {
    const item = document.createElement('div');
    const isActive = p.id === activeProfile.id;
    item.className = `profile-item ${isActive ? 'active' : ''}`;
    item.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div class="avatar-circle" style="width: 16px; height: 16px; font-size: 9px; ${isActive ? '' : 'background-color: var(--muted);'}">
          ${p.name.charAt(0).toUpperCase()}
        </div>
        <span>${escapeHtml(p.name)}</span>
      </div>
      ${isActive ? '<span style="font-size: 10px; color: var(--accent);">Aktif</span>' : ''}
    `;

    item.onclick = () => selectProfile(p.id);
    listEl.appendChild(item);
  });
}

async function selectProfile(profileId) {
  activeProfile = profiles.find(p => p.id === profileId);
  if (activeProfile) {
    localStorage.setItem('active_profile_id', activeProfile.id);
    updateProfileUI();
    document.getElementById('profile-dropdown').classList.add('hidden');
    await loadHabits();
  }
}

async function promptAddProfile() {
  const name = prompt("Masukkan nama profil baru:");
  if (!name || !name.trim()) return;

  try {
    const res = await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() })
    });
    if (res.ok) {
      const newP = await res.json();
      profiles.push(newP);
      await selectProfile(newP.id);
    }
  } catch (err) {
    alert("Gagal menambahkan profil.");
  }
}

// 2. MANAJEMEN HABITS
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

  renderHabits();
}

function renderHabits() {
  const listEl = document.getElementById('habit-list');
  listEl.innerHTML = '';

  if (habits.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        Belum ada kebiasaan untuk profil <b>${escapeHtml(activeProfile.name)}</b>. Klik "+ Tambah Kebiasaan" di atas untuk memulai.
      </div>
    `;
    updateMetrics();
    return;
  }

  habits.forEach(h => {
    const item = document.createElement('div');
    item.className = `habit-item ${h.done ? 'is-completed' : ''}`;

    item.innerHTML = `
      <div class="habit-left">
        <button class="check-btn" onclick="toggleCheckHabit(${h.id})" title="Tandai Selesai">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </button>
        <div class="habit-info">
          <div class="habit-name">${escapeHtml(h.name)}</div>
          <div class="habit-meta">
            <span class="badge">${escapeHtml(h.category || 'Umum')}</span>
            <span class="badge" style="text-transform: capitalize;">${h.frequency === 'weekly' ? 'Mingguan' : 'Harian'}</span>
            <span class="streak-pill">${h.current_streak || 0}d streak</span>
          </div>
        </div>
      </div>
      <button class="btn-danger-icon" onclick="deleteHabit(${h.id})" title="Hapus Kebiasaan">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </button>
    `;

    listEl.appendChild(item);
  });

  updateMetrics();
}

function updateMetrics() {
  const total = habits.length;
  const completed = habits.filter(h => h.done).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const maxStreak = habits.reduce((max, h) => Math.max(max, h.current_streak || 0), 0);

  document.getElementById('metric-total').textContent = total;
  document.getElementById('metric-streak').innerHTML = `${maxStreak} <span class="unit">hari</span>`;
  document.getElementById('metric-rate').textContent = `${percent}%`;

  document.getElementById('progress-val').textContent = `${completed} / ${total} (${percent}%)`;
  document.getElementById('progress-fill').style.width = `${percent}%`;
}

function toggleAddForm() {
  const form = document.getElementById('add-form');
  form.classList.toggle('hidden');
  if (!form.classList.contains('hidden')) {
    document.getElementById('habit-name-input').focus();
  }
}

async function handleCreateHabit(e) {
  e.preventDefault();

  const nameInput = document.getElementById('habit-name-input');
  const catInput = document.getElementById('habit-cat-input');
  const freqInput = document.getElementById('habit-freq-input');

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
    }
  } catch (err) {
    alert("Gagal menambahkan kebiasaan.");
  }

  nameInput.value = '';
  toggleAddForm();
  renderHabits();
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
      renderHabits();
    }
  } catch (err) {
    console.error("Gagal check-in:", err);
  }
}

async function deleteHabit(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus kebiasaan ini?')) return;

  try {
    const res = await fetch(`/api/habits/${id}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      habits = habits.filter(h => h.id !== id);
      renderHabits();
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

// public/js/app.js

const token = localStorage.getItem('token');
const userStr = localStorage.getItem('user');
let currentUser = userStr ? JSON.parse(userStr) : null;

// Local fallback store if backend habits endpoint is still in progress
const LOCAL_STORAGE_HABITS_KEY = `biba_habits_${currentUser ? currentUser.id : 'guest'}`;

let habits = [];

// 1. Guard & Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Display user name
  if (currentUser && currentUser.username) {
    document.getElementById('user-display-name').textContent = currentUser.username;
  }

  loadHabits();
});

function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

function toggleAddForm() {
  const form = document.getElementById('add-form');
  form.classList.toggle('hidden');
  if (!form.classList.contains('hidden')) {
    document.getElementById('habit-name-input').focus();
  }
}

// 2. Load Habits (API first, fallback to LocalStorage)
async function loadHabits() {
  try {
    const res = await fetch('/api/habits', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      habits = await res.json();
    } else {
      // Fallback to local storage if endpoint /api/habits is not yet created in backend
      const saved = localStorage.getItem(LOCAL_STORAGE_HABITS_KEY);
      habits = saved ? JSON.parse(saved) : getDefaultHabits();
    }
  } catch (err) {
    const saved = localStorage.getItem(LOCAL_STORAGE_HABITS_KEY);
    habits = saved ? JSON.parse(saved) : getDefaultHabits();
  }

  saveLocalHabits();
  renderHabits();
}

function getDefaultHabits() {
  return [
    { id: 1, name: "Membaca dokumentasi teknis 30 menit", category: "Belajar", frequency: "daily", current_streak: 5, done: true },
    { id: 2, name: "Jogging atau olahraga ringan", category: "Kesehatan", frequency: "daily", current_streak: 4, done: true },
    { id: 3, name: "Minum air 2 liter per hari", category: "Kesehatan", frequency: "daily", current_streak: 2, done: false }
  ];
}

function saveLocalHabits() {
  localStorage.setItem(LOCAL_STORAGE_HABITS_KEY, JSON.stringify(habits));
}

// 3. Render Habits & Update Metrics
function renderHabits() {
  const listEl = document.getElementById('habit-list');
  listEl.innerHTML = '';

  if (habits.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        Belum ada kebiasaan yang dibuat. Klik tombol "+ Tambah Kebiasaan" di atas untuk memulai.
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

// 4. Check-in Toggle
async function toggleCheckHabit(id) {
  const habit = habits.find(h => h.id === id);
  if (!habit) return;

  const nextDone = !habit.done;
  habit.done = nextDone;
  habit.current_streak = nextDone
    ? (habit.current_streak || 0) + 1
    : Math.max(0, (habit.current_streak || 1) - 1);

  // Try API check-in if backend exists
  try {
    await fetch(`/api/habits/${id}/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ done: nextDone })
    });
  } catch (err) {
    // Ignore network/404 error, rely on local state
  }

  saveLocalHabits();
  renderHabits();
}

// 5. Create Habit
async function handleCreateHabit(e) {
  e.preventDefault();

  const nameInput = document.getElementById('habit-name-input');
  const catInput = document.getElementById('habit-cat-input');
  const freqInput = document.getElementById('habit-freq-input');

  const name = nameInput.value.trim();
  const category = catInput.value;
  const frequency = freqInput.value;

  if (!name) return;

  const newHabit = {
    id: Date.now(),
    name,
    category,
    frequency,
    current_streak: 0,
    done: false
  };

  try {
    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, category, frequency })
    });

    if (res.ok) {
      const data = await res.json();
      newHabit.id = data.id || newHabit.id;
    }
  } catch (err) {
    // Rely on local storage
  }

  habits.unshift(newHabit);
  saveLocalHabits();

  nameInput.value = '';
  toggleAddForm();
  renderHabits();
}

// 6. Delete Habit
async function deleteHabit(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus kebiasaan ini?')) return;

  try {
    await fetch(`/api/habits/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (err) {
    // Ignore error, update state
  }

  habits = habits.filter(h => h.id !== id);
  saveLocalHabits();
  renderHabits();
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

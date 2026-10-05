const path = require('path');
const fs = require('fs');

let dataDir = __dirname;
try {
  const electron = require('electron');
  const app = electron.app || (electron.remote && electron.remote.app);
  if (app && typeof app.getPath === 'function') {
    dataDir = app.getPath('userData');
  }
} catch (e) {
  // Pure node environment
}

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'habittrack.json');

function readDb() {
  if (!fs.existsSync(dbPath)) {
    const initData = {
      profiles: [],
      habits: [],
      checkins: []
    };
    fs.writeFileSync(dbPath, JSON.stringify(initData, null, 2), 'utf-8');
    return initData;
  }
  try {
    const raw = fs.readFileSync(dbPath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.profiles) parsed.profiles = [];
    if (!parsed.habits) parsed.habits = [];
    if (!parsed.checkins) parsed.checkins = [];
    return parsed;
  } catch (e) {
    return {
      profiles: [],
      habits: [],
      checkins: []
    };
  }
}

function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

const db = {
  dbPath,

  profiles: {
    getAll() {
      const { profiles } = readDb();
      return profiles;
    },
    findById(id) {
      const { profiles } = readDb();
      return profiles.find(p => p.id === Number(id));
    },
    create(name) {
      const data = readDb();
      const trimmed = name.trim();
      const newProfile = {
        id: data.profiles.length > 0 ? Math.max(...data.profiles.map(p => p.id)) + 1 : 1,
        name: trimmed,
        created_at: new Date().toISOString()
      };
      data.profiles.push(newProfile);
      writeDb(data);
      return newProfile;
    },
    update(id, name) {
      const data = readDb();
      const p = data.profiles.find(p => p.id === Number(id));
      if (p) {
        p.name = name.trim() || p.name;
        writeDb(data);
        return p;
      }
      return null;
    },
    delete(id) {
      const data = readDb();
      const targetId = Number(id);
      data.profiles = data.profiles.filter(p => p.id !== targetId);

      // Cascade delete habits & checkins belonging to this profile
      const deletedHabits = data.habits.filter(h => h.profile_id === targetId);
      const deletedHabitIds = deletedHabits.map(h => h.id);
      data.habits = data.habits.filter(h => h.profile_id !== targetId);
      data.checkins = data.checkins.filter(c => !deletedHabitIds.includes(c.habit_id));
      writeDb(data);
      return true;
    }
  },

  habits: {
    findByProfileId(profileId) {
      const { habits } = readDb();
      return habits.filter(h => h.profile_id === Number(profileId)).sort((a, b) => b.id - a.id);
    },
    findById(id) {
      const { habits } = readDb();
      return habits.find(h => h.id === Number(id));
    },
    create({ profile_id, name, category, frequency }) {
      const data = readDb();
      const newHabit = {
        id: data.habits.length > 0 ? Math.max(...data.habits.map(h => h.id)) + 1 : 1,
        profile_id: Number(profile_id),
        name: name.trim(),
        category: category || 'Umum',
        frequency: frequency === 'weekly' ? 'weekly' : 'daily',
        current_streak: 0,
        longest_streak: 0,
        created_at: new Date().toISOString()
      };
      data.habits.unshift(newHabit);
      writeDb(data);
      return newHabit;
    },
    delete(id) {
      const data = readDb();
      const initialLength = data.habits.length;
      data.habits = data.habits.filter(h => h.id !== Number(id));
      if (data.habits.length !== initialLength) {
        data.checkins = data.checkins.filter(c => c.habit_id !== Number(id));
        writeDb(data);
        return true;
      }
      return false;
    },
    update(id, updates) {
      const data = readDb();
      const index = data.habits.findIndex(h => h.id === Number(id));
      if (index !== -1) {
        data.habits[index] = { ...data.habits[index], ...updates };
        writeDb(data);
        return data.habits[index];
      }
      return null;
    }
  },

  checkins: {
    findToday(habitId, dateStr) {
      const { checkins } = readDb();
      return checkins.find(c => c.habit_id === Number(habitId) && c.checkin_date === dateStr);
    },
    create({ habit_id, checkin_date }) {
      const data = readDb();
      const newCheckin = {
        id: data.checkins.length > 0 ? Math.max(...data.checkins.map(c => c.id)) + 1 : 1,
        habit_id: Number(habit_id),
        checkin_date,
        created_at: new Date().toISOString()
      };
      data.checkins.push(newCheckin);
      writeDb(data);
      return newCheckin;
    },
    delete(id) {
      const data = readDb();
      data.checkins = data.checkins.filter(c => c.id !== Number(id));
      writeDb(data);
      return true;
    }
  }
};

console.log("✅ Database lokal bersih siap:", dbPath);

module.exports = db;

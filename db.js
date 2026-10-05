const Database = require('better-sqlite3');
const path = require('path');

// Simpan file database di folder proyek (habittrack.db)
const dbPath = path.join(__dirname, 'habittrack.db');
const db = new Database(dbPath);

// Aktifkan foreign key constraint
db.pragma('foreign_keys = ON');

// Inisialisasi tabel otomatis jika belum ada
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    frequency TEXT CHECK (frequency IN ('daily', 'weekly')) NOT NULL DEFAULT 'daily',
    category TEXT,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    checkin_date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(habit_id, checkin_date),
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
  );
`);

console.log("✅ Database SQLite siap:", dbPath);

module.exports = db;

const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// Semua endpoint habit diproteksi dengan JWT authMiddleware
router.use(authMiddleware);

function getTodayString() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

// 1. GET ALL HABITS FOR CURRENT USER
router.get('/', (req, res) => {
  try {
    const userId = req.user.id;
    const today = getTodayString();

    const habits = db.prepare(`
      SELECT h.*,
             CASE WHEN c.id IS NOT NULL THEN 1 ELSE 0 END AS done
      FROM habits h
      LEFT JOIN checkins c ON h.id = c.habit_id AND c.checkin_date = ?
      WHERE h.user_id = ?
      ORDER BY h.id DESC
    `).all(today, userId);

    const formatted = habits.map(h => ({
      ...h,
      done: Boolean(h.done)
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Fetch habits error:", err);
    res.status(500).json({ message: "Gagal mengambil data kebiasaan." });
  }
});

// 2. CREATE HABIT
router.post('/', (req, res) => {
  const { name, category, frequency } = req.body;
  const userId = req.user.id;

  if (!name) {
    return res.status(400).json({ message: "Nama kebiasaan wajib diisi." });
  }

  try {
    const validFreq = (frequency === 'weekly') ? 'weekly' : 'daily';
    const stmt = db.prepare(`
      INSERT INTO habits (user_id, name, category, frequency, current_streak, longest_streak)
      VALUES (?, ?, ?, ?, 0, 0)
    `);

    const info = stmt.run(userId, name, category || 'Umum', validFreq);

    const newHabit = db.prepare('SELECT * FROM habits WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ ...newHabit, done: false });
  } catch (err) {
    console.error("Create habit error:", err);
    res.status(500).json({ message: "Gagal menambahkan kebiasaan." });
  }
});

// 3. DELETE HABIT
router.delete('/:id', (req, res) => {
  const habitId = req.params.id;
  const userId = req.user.id;

  try {
    const stmt = db.prepare('DELETE FROM habits WHERE id = ? AND user_id = ?');
    const result = stmt.run(habitId, userId);

    if (result.changes === 0) {
      return res.status(404).json({ message: "Kebiasaan tidak ditemukan." });
    }

    res.json({ message: "Kebiasaan berhasil dihapus." });
  } catch (err) {
    console.error("Delete habit error:", err);
    res.status(500).json({ message: "Gagal menghapus kebiasaan." });
  }
});

// 4. TOGGLE CHECKIN / STREAK
router.post('/:id/checkin', (req, res) => {
  const habitId = req.params.id;
  const userId = req.user.id;
  const today = getTodayString();

  try {
    const habit = db.prepare('SELECT * FROM habits WHERE id = ? AND user_id = ?').get(habitId, userId);
    if (!habit) {
      return res.status(404).json({ message: "Kebiasaan tidak ditemukan." });
    }

    const existingCheckin = db.prepare('SELECT id FROM checkins WHERE habit_id = ? AND checkin_date = ?').get(habitId, today);

    let nextDone = false;
    let nextStreak = habit.current_streak;

    if (existingCheckin) {
      // Uncheck
      db.prepare('DELETE FROM checkins WHERE id = ?').run(existingCheckin.id);
      nextStreak = Math.max(0, habit.current_streak - 1);
      nextDone = false;
    } else {
      // Check
      db.prepare('INSERT INTO checkins (habit_id, checkin_date) VALUES (?, ?)').run(habitId, today);
      nextStreak = habit.current_streak + 1;
      nextDone = true;
    }

    const longest = Math.max(habit.longest_streak, nextStreak);
    db.prepare('UPDATE habits SET current_streak = ?, longest_streak = ? WHERE id = ?').run(nextStreak, longest, habitId);

    res.json({
      message: nextDone ? "Check-in berhasil!" : "Check-in dibatalkan.",
      done: nextDone,
      current_streak: nextStreak,
      longest_streak: longest
    });
  } catch (err) {
    console.error("Checkin error:", err);
    res.status(500).json({ message: "Gagal memproses check-in." });
  }
});

module.exports = router;

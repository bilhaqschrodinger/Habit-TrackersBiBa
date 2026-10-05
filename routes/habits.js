const express = require('express');
const router = express.Router();
const db = require('../db');

function getTodayString() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

// 1. GET ALL HABITS FOR ACTIVE PROFILE
router.get('/', (req, res) => {
  try {
    const profileId = req.query.profileId;
    if (!profileId) {
      return res.status(400).json({ message: "profileId diperlukan." });
    }

    const today = getTodayString();
    const userHabits = db.habits.findByProfileId(profileId);

    const result = userHabits.map(h => {
      const checkin = db.checkins.findToday(h.id, today);
      return {
        ...h,
        done: Boolean(checkin)
      };
    });

    res.json(result);
  } catch (err) {
    console.error("Fetch habits error:", err);
    res.status(500).json({ message: "Gagal mengambil data kebiasaan." });
  }
});

// 2. CREATE HABIT
router.post('/', (req, res) => {
  const { profile_id, name, category, frequency } = req.body;

  if (!profile_id) {
    return res.status(400).json({ message: "profile_id diperlukan." });
  }
  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Nama kebiasaan wajib diisi." });
  }

  try {
    const newHabit = db.habits.create({
      profile_id,
      name,
      category,
      frequency
    });

    res.status(201).json({ ...newHabit, done: false });
  } catch (err) {
    console.error("Create habit error:", err);
    res.status(500).json({ message: "Gagal menambahkan kebiasaan." });
  }
});

// 3. DELETE HABIT
router.delete('/:id', (req, res) => {
  const habitId = req.params.id;

  try {
    const deleted = db.habits.delete(habitId);
    if (!deleted) {
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
  const today = getTodayString();

  try {
    const habit = db.habits.findById(habitId);
    if (!habit) {
      return res.status(404).json({ message: "Kebiasaan tidak ditemukan." });
    }

    const existingCheckin = db.checkins.findToday(habitId, today);

    let nextDone = false;
    let nextStreak = habit.current_streak;

    if (existingCheckin) {
      // Uncheck
      db.checkins.delete(existingCheckin.id);
      nextStreak = Math.max(0, habit.current_streak - 1);
      nextDone = false;
    } else {
      // Check
      db.checkins.create({ habit_id: habitId, checkin_date: today });
      nextStreak = habit.current_streak + 1;
      nextDone = true;
    }

    const longest = Math.max(habit.longest_streak || 0, nextStreak);
    db.habits.update(habitId, {
      current_streak: nextStreak,
      longest_streak: longest
    });

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

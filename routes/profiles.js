const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. GET ALL PROFILES
router.get('/', (req, res) => {
  try {
    const list = db.profiles.getAll();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil daftar profil." });
  }
});

// 2. CREATE NEW PROFILE
router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Nama profil wajib diisi." });
  }

  try {
    const newProfile = db.profiles.create(name);
    res.status(201).json(newProfile);
  } catch (err) {
    res.status(500).json({ message: "Gagal membuat profil baru." });
  }
});

// 3. RENAME PROFILE
router.put('/:id', (req, res) => {
  const { name } = req.body;
  const id = req.params.id;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Nama profil tidak boleh kosong." });
  }

  try {
    const updated = db.profiles.update(id, name);
    if (!updated) {
      return res.status(404).json({ message: "Profil tidak ditemukan." });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Gagal memperbarui profil." });
  }
});

// 4. DELETE PROFILE
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  try {
    const success = db.profiles.delete(id);
    if (!success) {
      return res.status(400).json({ message: "Tidak dapat menghapus profil utama/terakhir." });
    }
    res.json({ message: "Profil berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus profil." });
  }
});

module.exports = router;

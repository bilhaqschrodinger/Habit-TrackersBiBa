const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'biba_secret_key_habit_tracker_2026';

// 1. ENDPOINT REGISTER (POST /api/auth/register)
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Semua kolom harus diisi!" });
    }

    try {
        const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
        if (existing) {
            return res.status(400).json({ message: "Username atau Email sudah digunakan." });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const stmt = db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)');
        stmt.run(username, email, passwordHash);

        res.status(201).json({ message: "User berhasil didaftarkan!" });
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
});

// 2. ENDPOINT LOGIN (POST /api/auth/login)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email dan password wajib diisi!" });
    }

    try {
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(400).json({ message: "Email atau password salah." });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: "Email atau password salah." });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: "Login berhasil!",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const mssql = require('mssql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. ENDPOINT REGISTER (POST /api/auth/register)
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Semua kolom harus diisi!" });
    }

    try {
        const pool = await mssql.connect();
        
        const userCheck = await pool.request()
            .input('username', mssql.VarChar, username)
            .input('email', mssql.VarChar, email)
            .query('SELECT * FROM users WHERE username = @username OR email = @email');

        if (userCheck.recordset.length > 0) {
            return res.status(400).json({ message: "Username atau Email sudah digunakan." });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await pool.request()
            .input('username', mssql.VarChar, username)
            .input('email', mssql.VarChar, email)
            .input('password_hash', mssql.VarChar, passwordHash)
            .query('INSERT INTO users (username, email, password_hash) VALUES (@username, @email, @password_hash)');

        res.status(201).json({ message: "User berhasil didaftarkan!" });
    } catch (err) {
        console.error(err);
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
        const pool = await mssql.connect();

        // Cari user berdasarkan email
        const result = await pool.request()
            .input('email', mssql.VarChar, email)
            .query('SELECT * FROM users WHERE email = @email');

        if (result.recordset.length === 0) {
            return res.status(400).json({ message: "Email atau password salah." });
        }

        const user = result.recordset[0];

        // Bandingkan password yang diketik dengan hash di database
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: "Email atau password salah." });
        }

        // Jika cocok, buat JWT Token sebagai "tiket masuk" untuk frontend
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Token berlaku selama 1 hari
        );

        // Kirim data user dan token ke frontend
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
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
});

module.exports = router;
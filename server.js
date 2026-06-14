const express = require('express');
const mssql = require('mssql');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json()); // Agar server bisa membaca data JSON dari request

// Konfigurasi koneksi ke SQL Server
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true, // Gunakan true jika kamu pakai Azure, atau set false jika lokal bermasalah
        trustServerCertificate: true // Penting untuk local development di Windows
    }
};

// Fungsi untuk mengetes koneksi ke SSMS
mssql.connect(dbConfig)
    .then(pool => {
        if (pool.connected) {
            console.log("✅ Berhasil terhubung ke SQL Server (SSMS)!");
        }
    })
    .catch(err => console.log("❌ Koneksi database gagal: ", err));

// Endpoint dasar untuk tes apakah server jalan
app.get('/', (req, res) => {
    res.send("Backend Habit Tracker Siap!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    const authRoutes = require('./auth');
    app.use('/api/auth', authRoutes);
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
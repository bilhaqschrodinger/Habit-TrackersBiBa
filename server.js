const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files dari folder public
app.use(express.static(path.join(__dirname, 'public')));

// Routes API
const authRoutes = require('./auth');
const habitRoutes = require('./routes/habits');

app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);

// Healthcheck API
app.get('/api', (req, res) => {
    res.json({ message: "Backend Habit Tracker BiBa Siap (SQLite Mode)!" });
});

function startServer(port = process.env.PORT || 5000) {
    return new Promise((resolve) => {
        const server = app.listen(port, () => {
            console.log(`🚀 Server berjalan di http://localhost:${port}`);
            resolve({ port, server });
        });
    });
}

// Jalankan langsung jika file dieksekusi dengan `node server.js`
if (require.main === module) {
    startServer();
}

module.exports = { app, startServer };
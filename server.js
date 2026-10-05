const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
// Restrict CORS to localhost origins for local desktop app security
const allowedOrigins = [
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or Electron file://)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  }
}));
app.use(express.json());

// Serve static frontend files dari folder public
app.use(express.static(path.join(__dirname, 'public')));

// Routes API
const profileRoutes = require('./routes/profiles');
const habitRoutes = require('./routes/habits');

app.use('/api/profiles', profileRoutes);
app.use('/api/habits', habitRoutes);

// Healthcheck API
app.get('/api', (req, res) => {
    res.json({ message: "Backend Habit Tracker BiBa Siap (Profile Mode)!" });
});

function startServer(port = process.env.PORT || 5000) {
    return new Promise((resolve) => {
        const server = app.listen(port, () => {
            console.log(`🚀 Server berjalan di http://localhost:${port}`);
            resolve({ port, server });
        });
    });
}

if (require.main === module) {
    startServer();
}

module.exports = { app, startServer };
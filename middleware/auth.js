const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'biba_secret_key_habit_tracker_2026';

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: "Akses ditolak. Token tidak ditemukan." });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, username }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token tidak valid atau kedaluwarsa." });
  }
}

module.exports = authMiddleware;

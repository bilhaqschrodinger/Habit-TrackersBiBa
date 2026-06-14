-- 1. Membuat Database Baru (Jalankan ini terpisah atau pastikan db sudah ada)
-- CREATE DATABASE habit_tracker_db;
-- GO
-- USE habit_tracker_db;
-- GO

-- Tabel Users
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY, -- Menggantikan SERIAL dengan IDENTITY
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE() -- Menggantikan TIMESTAMP dengan DATETIME & GETDATE()
);

-- Tabel Habits
CREATE TABLE habits (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    frequency VARCHAR(10) CHECK (frequency IN ('daily', 'weekly')) NOT NULL,
    category VARCHAR(50),
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE()
);

-- Tabel Checkins
CREATE TABLE checkins (
    id INT IDENTITY(1,1) PRIMARY KEY,
    habit_id INT FOREIGN KEY REFERENCES habits(id) ON DELETE CASCADE,
    checkin_date DATE NOT NULL, 
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT unique_habit_date UNIQUE (habit_id, checkin_date)
);
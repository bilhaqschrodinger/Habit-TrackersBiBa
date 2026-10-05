# Habit-TrackersBiBa

Aplikasi desktop pelacak kebiasaan (*Habit Tracker*) mandiri yang dirancang menggunakan antarmuka minimalis, backend Express.js, database lokal SQLite, dan dibungkus sebagai aplikasi desktop menggunakan Electron.

---

## Fitur Utama

- **Autentikasi Aman**: Registrasi & Login dengan enkripsi password `bcrypt` dan verifikasi JWT token.
- **Database Lokal Mandiri (SQLite)**: File database `habittrack.db` terbuat otomatis tanpa perlu menginstal atau menjalankan database server terpisah (bebas SSMS).
- **Pelacakan Kebiasaan (Habits CRUD)**: Tambah kebiasaan baru, pilih kategori dan frekuensi (Harian/Mingguan), serta hapus kebiasaan.
- **Check-in & Penghitungan Streak**: Centang rutinitas harian dengan penghitung streak konsistensi yang diperbarui secara otomatis.
- **Antarmuka Minimalis**: Frontend responsif menggunakan HTML, CSS, dan JavaScript murni tanpa framework berat.
- **Jendela Desktop Sendiri (Electron)**: Berjalan sebagai aplikasi desktop mandiri atau dapat dibuka via browser.

---

## Struktur Folder

```text
Habit-TrackersBiBa/
├── database sql/           # Skema SQL acuan
├── middleware/             # Middleware otentikasi JWT
├── public/                 # Antarmuka frontend (HTML/CSS/JS)
│   ├── css/style.css       # Desain minimalis dark-neutral
│   ├── js/auth.js          # Logika login & register
│   ├── js/app.js           # Logika dashboard & checklist
│   ├── index.html          # Halaman dashboard utama
│   └── login.html          # Halaman autentikasi
├── routes/                 # Endpoint REST API (habits, checkins)
├── auth.js                 # Endpoint otentikasi
├── db.js                   # Inisialisasi database SQLite (better-sqlite3)
├── main.js                 # Entry point aplikasi desktop Electron
├── server.js               # Server Express backend
├── Buka_Aplikasi.bat       # Launcher Windows 1-klik
└── .env.example            # Template environment variables
```

---

## Cara Menjalankan

### Persyaratan
- [Node.js](https://nodejs.org/) terpasang di komputer.

### Langkah Menjalankan

1. **Install dependensi** (cukup sekali di awal):
   ```bash
   npm install
   ```

2. **Jalankan Aplikasi Desktop**:
   - **Cara 1 (1-Klik di Windows)**: Klik ganda file `Buka_Aplikasi.bat`.
   - **Cara 2 (Terminal)**:
     ```bash
     npm start
     ```

3. **Menjalankan Hanya Server Web (Opsional)**:
   ```bash
   npm run server
   ```
   Lalu buka browser di `http://localhost:5000`.

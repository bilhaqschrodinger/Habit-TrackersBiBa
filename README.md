# Habit-TrackersBiBa

Aplikasi desktop pelacak kebiasaan (*Habit Tracker*) mandiri yang dirancang menggunakan antarmuka minimalis, backend Express.js, sistem multi-profil lokal (tanpa ribet login/password), dan dibungkus sebagai aplikasi desktop menggunakan Electron.

---

## Fitur Utama

- **Zero-Login & Multi-Profil**: Tanpa perlu mengingat password atau registrasi akun. Langsung masuk ke Dashboard dalam 1 detik dengan dukungan banyak profil pengguna (seperti profil Netflix/Chrome).
- **Database Lokal Mandiri**: Data tersimpan rapi di dalam laptop Anda (`habittrack.json`) secara otomatis tanpa perlu server database eksternal (bebas SSMS).
- **Pelacakan Kebiasaan (Habits CRUD)**: Tambah kebiasaan baru, pilih kategori dan frekuensi (Harian/Mingguan), serta hapus kebiasaan per profil.
- **Check-in & Penghitungan Streak**: Centang rutinitas harian dengan penghitung rentetan hari (*streak*) dan indikator konsistensi otomatis.
- **Antarmuka Minimalis**: Frontend responsif menggunakan HTML, CSS, dan JavaScript murni tanpa framework berat dan tanpa emoji.
- **Jendela Desktop Sendiri (Electron)**: Berjalan sebagai aplikasi desktop mandiri Windows dengan jendela aplikasi tersendiri.

---

## Struktur Folder

```text
Habit-TrackersBiBa/
├── database sql/           # Skema SQL acuan
├── public/                 # Antarmuka frontend (HTML/CSS/JS)
│   ├── css/style.css       # Desain minimalis dark-neutral
│   ├── js/app.js           # Logika dashboard, checklist, & profil
│   └── index.html          # Halaman dashboard utama
├── routes/
│   ├── profiles.js         # Endpoint manajemen profil (tambah, ganti, hapus)
│   └── habits.js           # Endpoint kebiasaan & checkin streak
├── db.js                   # Inisialisasi database lokal
├── main.js                 # Entry point aplikasi desktop Electron
├── server.js               # Server Express backend
└── Buka_Aplikasi.bat       # Launcher Windows 1-klik
```

---

## Cara Menjalankan

### 1. Menjalankan di Komputer Anda (Development)
```bash
# 1. Install dependensi (cukup sekali di awal)
npm install

# 2. Jalankan aplikasi desktop
npm start
```
*Atau cukup klik ganda (double-click) file **`Buka_Aplikasi.bat`** di Windows Explorer!*

### 2. Menjalankan Hanya Server Web (Opsional)
```bash
npm run server
```
Lalu buka browser di `http://localhost:5000`.

---

## Membuat File `.exe` untuk Release GitHub

Untuk mengemas aplikasi menjadi software desktop siap rilis:

```bash
# Membuat folder aplikasi siap pakai (sangat cepat & anti-gagal):
npx electron-builder --win --dir
```
Hasil file executable akan berada di **`dist/win-unpacked/Habit Tracker BiBa.exe`**. Anda tinggal mengompres folder tersebut menjadi file `.zip` lalu mengunggahnya ke menu **Releases** di repositori GitHub Anda.

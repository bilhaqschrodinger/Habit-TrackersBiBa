# Habit-TrackersBiBa

Aplikasi desktop pelacak kebiasaan (*Habit Tracker*) mandiri untuk Windows, dibangun menggunakan Electron, backend Express.js, sistem multi-profil lokal tanpa form login, dan antarmuka responsif murni dengan HTML, CSS, dan JavaScript.

---

## Tangkapan Layar

<!-- Silakan isi path atau link gambar tangkapan layar di bawah ini -->
![Tampilan Dashboard](screenshot-dashboard.png)

*Halaman Utama Habit Tracker BiBa dengan ringkasan progres dan daftar kebiasaan.*

<!-- Tambahkan screenshot onboarding atau profil jika diperlukan -->
<!-- ![Halaman Awal Onboarding](screenshot-onboarding.png) -->

---

## Fitur Utama

- **Multi-Profil Tanpa Login**: Pengguna langsung masuk ke aplikasi tanpa perlu mengingat password atau mendaftar akun. Mendukung banyak profil yang bisa diganti kapan saja.
- **Halaman Awal (Onboarding)**: Jika belum ada profil yang terdaftar, aplikasi otomatis menampilkan formulir pembuatan profil pertama sebelum masuk ke dashboard.
- **Pelacakan Kebiasaan**: Tambah rutinitas baru dengan pilihan kategori (Kesehatan, Belajar, Produktivitas, Finansial, Lainnya) dan frekuensi (Harian atau Mingguan).
- **Check-in & Penghitungan Streak**: Centang rutinitas yang selesai hari ini untuk menghitung rentetan hari (*streak*) dan persentase konsistensi secara otomatis.
- **Filter Frekuensi**: Filter cepat untuk melihat kebiasaan Semua, Harian, atau Mingguan.
- **Database Lokal Mandiri**: Data tersimpan aman di komputer pengguna dalam file `habittrack.json`, tanpa memerlukan instalasi database server eksternal.
- **Tampilan Adaptif**: Tata letak otomatis menyesuaikan ukuran jendela aplikasi, dari mode kompak hingga layar penuh.

---

## Cara Menjalankan

Pilih salah satu cara di bawah ini untuk menjalankan aplikasi:

### 1. Unduh File Aplikasi Langsung (.exe)
Bagi pengguna yang ingin langsung memakai aplikasi tanpa membuka terminal atau menginstal Node.js:
1. Buka halaman **[GitHub Releases](https://github.com/bilhaqschrodinger/Habit-TrackersBiBa/releases)**.
2. Unduh file rilis terbaru (`.exe` atau file arsip `.zip`).
3. Jalankan file executable tersebut di Windows.

### 2. Menjalankan via Terminal (Mode Development)
Jika Anda ingin menjalankan aplikasi dari kode sumber:
```bash
# 1. Unduh dependensi (cukup sekali di awal)
npm install

# 2. Jalankan aplikasi desktop
npm start
```

*(Opsional)* Untuk menjalankan server web saja tanpa jendela Electron:
```bash
npm run server
```
Lalu buka browser di `http://localhost:5000`.

---

## Panduan Membuat File .exe (Build Manual)

Berikut adalah panduan detail untuk mengemas aplikasi menjadi file executable Windows (`.exe`):

### Metode 1: Membuat Portable App Folder (Paling Cepat dan Praktis)
Metode ini langsung menyusun aplikasi ke dalam folder siap pakai tanpa perlu mengunduh modul installer eksternal dari internet:

1. Buka terminal di folder proyek.
2. Jalankan perintah:
   ```bash
   npx electron-builder --win --dir
   ```
3. Setelah selesai, buka folder **`dist/win-unpacked/`**.
4. Di dalamnya terdapat file utama **`Habit Tracker BiBa.exe`**.
5. Untuk membagikannya ke GitHub Releases, cukup kompres folder `win-unpacked` tersebut menjadi file `.zip` (misal: `Habit-Tracker-BiBa-v1.0.0-win-x64.zip`) lalu unggah ke menu Releases.

### Metode 2: Membuat File Installer Tunggal (Setup.exe)
Metode ini menghasilkan file installer mandiri bertipe NSIS:

1. Pastikan koneksi internet stabil (disarankan menggunakan VPN atau DNS cepat seperti 1.1.1.1 untuk menghindari kendala unduhan modul NSIS dari server GitHub).
2. Jalankan perintah:
   ```bash
   npm run dist
   ```
3. Hasil file instalasi akan muncul di folder `dist/` dengan nama **`Habit Tracker BiBa Setup 1.0.0.exe`**.

---

## Struktur Folder

```text
Habit-TrackersBiBa/
├── database sql/           # Skema SQL awal sebagai acuan
├── public/                 # Antarmuka frontend (HTML, CSS, JS)
│   ├── css/style.css       # Desain antarmuka responsif
│   ├── js/app.js           # Logika interaktif dashboard dan profil
│   └── index.html          # Halaman onboarding dan dashboard utama
├── routes/
│   ├── profiles.js         # Endpoint manajemen profil
│   └── habits.js           # Endpoint kebiasaan dan check-in streak
├── db.js                   # Modul database lokal (habittrack.json)
├── main.js                 # Skrip utama aplikasi desktop Electron
├── server.js               # Server Express backend
├── package.json            # Konfigurasi dependensi dan build
└── .env.example            # Konfigurasi port opsional
```

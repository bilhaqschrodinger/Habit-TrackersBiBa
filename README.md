# Habit-TrackersBiBa

Aplikasi desktop pelacak kebiasaan (*Habit Tracker*) mandiri untuk Windows, dibangun menggunakan Electron, backend Express.js, sistem multi-profil lokal tanpa form login, dan antarmuka responsif murni dengan HTML, CSS, dan JavaScript.

---

## Tangkapan Layar

<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/19529bf5-e5e8-46cc-b2f1-821a2b5d4efd" />
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/c1aa3893-0375-4785-b297-43adc44587ce" />
<img width="1918" height="1078" alt="image" src="https://github.com/user-attachments/assets/558c8665-c898-4db0-99f8-85e2e3fb5711" />

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
# 1. Unduh dependensi
npm install

# 2. Jalankan aplikasi desktop
npm start
```

Untuk menjalankan server web saja tanpa jendela Electron:
```bash
npm run server
```
Lalu buka browser di `http://localhost:5000`.

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

# 🌿 Sistem Digitalisasi & E-Katalog UMKM Desa Paseban Kawis

Aplikasi Web dan API RESTful untuk digitalisasi pemasaran produk UMKM lokal Desa Paseban Kawis menggunakan arsitektur Node.js Express dan database MySQL.

---

## 📁 Struktur Direktori Proyek

```text
UMKM/
├── images/                # Asset gambar produk dan banner web
│   ├── about-umkm.jpg
│   └── hero-display.jpg
├── .env                   # Variabel lingkungan lokal (Database credentials - ignored by git)
├── .env.example           # Template variabel lingkungan untuk setup
├── .gitignore             # Pengabaian file sensitif & dependencies
├── admin.html             # Dashboard kendali administrator UMKM & katalog
├── database.sql           # Skrip inisialisasi schema & seed data database MySQL
├── ekatalog.html          # Halaman etalase produk E-Katalog interaktif
├── index.html             # Halaman beranda utama portal UMKM
├── jurnal.html            # Halaman laporan penelitian & publikasi jurnal
├── login.html             # Halaman autentikasi portal masuk admin
├── package.json           # Manifes dependensi & script proyek Node.js
├── README.md              # Dokumentasi teknis & panduan operasional proyek
├── script.js              # Logika frontend, interaktivitas, & integrasi API
├── server.js              # Server backend REST API Express & koneksi MySQL
├── start.bat              # Script shortcut untuk menjalankan server di Windows
└── style.css              # Berkas style stylesheet CSS modern & responsif
```

---

## 🛠️ Prasyarat (Prerequisites)

1. **Node.js** (Versi 18 LTS atau lebih baru disarankan)
2. **MySQL Server / MySQL Workbench / XAMPP** (Port default biasanya 3306 atau 3309)

---

## 🚀 Panduan Instalasi & Menjalankan Proyek

### 1. Clone / Buka Direktori Proyek
Pastikan terminal berada di folder utama proyek:
```bash
cd c:\Users\LENOVO\Downloads\UMKM
```

### 2. Instalasi Dependensi
Jalankan perintah berikut untuk mengunduh modul yang dibutuhkan (`express`, `mysql2`, `cors`, `dotenv`):
```bash
npm install
```

### 3. Konfigurasi Database
1. Buka MySQL Workbench atau phpMyAdmin.
2. Impor file [database.sql](file:///c:/Users/LENOVO/Downloads/UMKM/database.sql) untuk membuat database `db_paseban_umkm` beserta tabel-tabelnya.
3. Salin [.env.example](file:///c:/Users/LENOVO/Downloads/UMKM/.env.example) menjadi `.env` jika belum ada:
   ```bash
   cp .env.example .env
   ```
4. Sesuaikan `DB_USER`, `DB_PASSWORD`, dan `DB_PORT` pada file [.env](file:///c:/Users/LENOVO/Downloads/UMKM/.env) sesuai dengan pengaturan MySQL komputer Anda.

### 4. Menjalankan Server
Anda dapat menjalankan server melalui salah satu opsi berikut:

- **Cara Cepat (Windows):**
  Klik ganda pada file [start.bat](file:///c:/Users/LENOVO/Downloads/UMKM/start.bat).

- **Menggunakan NPM (Mode Produksi):**
  ```bash
  npm start
  ```

- **Menggunakan NPM (Mode Development - Auto Reload):**
  ```bash
  npm run dev
  ```

Setelah server aktif, akses website melalui browser di:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔌 Dokumentasi REST API

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/` | Melayani halaman beranda web (`index.html`) |
| `GET` | `/login` | Halaman autentikasi login administrator (`login.html`) |
| `GET` | `/admin` | Panel dashboard manajemen UMKM & katalog (`admin.html`) |
| `POST`| `/api/login` | Autentikasi akun admin (kredensial default: `admin` / `admin123`) |
| `GET` | `/api/admin/stats`| Mengambil metrik agregat statistik untuk dashboard admin |
| `PATCH`| `/api/umkm/:id/status`| Mengubah status verifikasi UMKM (`disetujui` / `ditolak` / `pending`) |
| `DELETE`| `/api/umkm/:id` | Menghapus pendaftaran UMKM |
| `PATCH`| `/api/produk/:id/status`| Mengaktifkan / menonaktifkan visibilitas produk di katalog |
| `DELETE`| `/api/produk/:id`| Menghapus produk dari database e-katalog |
| `GET` | `/api` | Ringkasan informasi dan daftar endpoint API |
| `GET` | `/api/jurnal` | Mengambil data metadata dan abstrak jurnal penelitian |
| `GET` | `/api/anggota` | Mengambil daftar anggota kelompok / tim pengembang |
| `GET` | `/api/kategori` | Mengambil daftar kategori produk UMKM |
| `GET` | `/api/produk` | Mengambil daftar semua produk e-katalog (mendukung parameter `?search=` dan `?status=`) |
| `POST`| `/api/produk` | Menambahkan produk baru ke e-katalog |
| `GET` | `/api/umkm` | Mengambil data pendaftar UMKM |
| `POST`| `/api/umkm` | Mendaftarkan UMKM baru melalui form web |

---

## 🔒 Standar Keamanan & Best Practice
- Kredensial database disimpan secara terisolasi pada `.env` dan tidak boleh di-commit ke Git.
- Parameterized Query digunakan pada seluruh query SQL di [server.js](file:///c:/Users/LENOVO/Downloads/UMKM/server.js) untuk mencegah SQL Injection.
- Folder duplikat / file arsip telah dibersihkan agar ukuran proyek ramping dan efisien.

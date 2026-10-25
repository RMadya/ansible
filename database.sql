-- ====================================================================
-- SKRIP DATABASE MYSQL WORKBENCH
-- Sistem Informasi E-Katalog & Digitalisasi UMKM Desa Paseban Kawis
-- ====================================================================

-- 1. PEMBUATAN DATABASE
CREATE DATABASE IF NOT EXISTS `db_paseban_umkm`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `db_paseban_umkm`;

-- ====================================================================
-- 2. PEMBUATAN TABEL-TABEL
-- ====================================================================

-- Tabel 1: Metadata Jurnal Penelitian
CREATE TABLE IF NOT EXISTS `jurnal_info` (
    `id_jurnal` INT AUTO_INCREMENT PRIMARY KEY,
    `judul` VARCHAR(255) NOT NULL,
    `penulis` TEXT NOT NULL,
    `tahun_terbit` YEAR NOT NULL,
    `abstrak` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabel 2: Anggota Kelompok Tim Penyusun
CREATE TABLE IF NOT EXISTS `anggota_kelompok` (
    `id_anggota` INT AUTO_INCREMENT PRIMARY KEY,
    `nama_lengkap` VARCHAR(100) NOT NULL,
    `nim` VARCHAR(20) NOT NULL UNIQUE,
    `role` VARCHAR(50) DEFAULT 'Anggota Tim',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabel 3: Kategori Produk UMKM
CREATE TABLE IF NOT EXISTS `kategori_produk` (
    `id_kategori` INT AUTO_INCREMENT PRIMARY KEY,
    `nama_kategori` VARCHAR(50) NOT NULL UNIQUE,
    `keterangan` VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabel 4: Pendaftaran & Profil UMKM (Dari Form Pendaftaran Web)
CREATE TABLE IF NOT EXISTS `pendaftaran_umkm` (
    `id_umkm` INT AUTO_INCREMENT PRIMARY KEY,
    `nama_pemilik` VARCHAR(100) NOT NULL,
    `nama_umkm` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `telepon` VARCHAR(20) NOT NULL,
    `id_kategori` INT NOT NULL,
    `deskripsi_usaha` TEXT NOT NULL,
    `status_verifikasi` ENUM('pending', 'disetujui', 'ditolak') DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_umkm_kategori` FOREIGN KEY (`id_kategori`) 
        REFERENCES `kategori_produk` (`id_kategori`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabel 5: Produk E-Katalog UMKM
CREATE TABLE IF NOT EXISTS `produk_ekatalog` (
    `id_produk` INT AUTO_INCREMENT PRIMARY KEY,
    `id_umkm` INT NOT NULL,
    `id_kategori` INT NOT NULL,
    `nama_produk` VARCHAR(150) NOT NULL,
    `harga` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `stok` INT NOT NULL DEFAULT 0,
    `deskripsi_ai` TEXT NULL,
    `foto_produk` VARCHAR(255) NULL,
    `status_aktif` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_produk_umkm` FOREIGN KEY (`id_umkm`) 
        REFERENCES `pendaftaran_umkm` (`id_umkm`) ON DELETE CASCADE,
    CONSTRAINT `fk_produk_kategori` FOREIGN KEY (`id_kategori`) 
        REFERENCES `kategori_produk` (`id_kategori`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabel 6: Log Analisis Kekuatan & Kekurangan Jurnal
CREATE TABLE IF NOT EXISTS `analisis_jurnal` (
    `id_analisis` INT AUTO_INCREMENT PRIMARY KEY,
    `tipe` ENUM('kekuatan', 'kekurangan') NOT NULL,
    `poin_analisis` TEXT NOT NULL,
    `deskripsi_detail` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabel 7: Pengguna & Administrator Sistem
CREATE TABLE IF NOT EXISTS `admin_users` (
    `id_admin` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `nama_lengkap` VARCHAR(100) NOT NULL,
    `role` VARCHAR(50) DEFAULT 'admin',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ====================================================================
-- 3. INSERT SAMPLE DATA (DATA AWAL UNTUK DICOBA DI MYSQL WORKBENCH)
-- ====================================================================

-- Data Akun Administrator
INSERT INTO `admin_users` (`username`, `password`, `nama_lengkap`, `role`) VALUES
('admin', 'admin123', 'Administrator UMKM', 'Super Admin')
ON DUPLICATE KEY UPDATE `nama_lengkap` = VALUES(`nama_lengkap`);

-- Data Jurnal
INSERT INTO `jurnal_info` (`judul`, `penulis`, `tahun_terbit`, `abstrak`) VALUES
('Pemanfaatan Aplikasi AI dan Website E-Katalog untuk Digitalisasi UMKM Desa Paseban Kawis', 
 'Nurul Hadist, Abdurrohman Qoim Haqqi Muhammad, Muhammad Rafi Kurniawan, Keysha Kinanti A., Yudha Alif Auliya', 
 2025, 
 'Jurnal ini membahas pemanfaatan teknologi digital, khususnya aplikasi Artificial Intelligence (AI) dan website E-Katalog, untuk membantu proses digitalisasi UMKM di Desa Paseban Kawis.');

-- Data Anggota Kelompok
INSERT INTO `anggota_kelompok` (`nama_lengkap`, `nim`, `role`) VALUES
('Syera Silvia Erby', '20240140222', 'Ketua Tim'),
('Vania Azharia', '20240140257', 'Anggota Tim'),
('Shafa Salsabila Ramadhani', '20240140208', 'Anggota Tim'),
('Sekar Kinasih', '20240140243', 'Anggota Tim'),
('Vera Indriani', '20240140155', 'Anggota Tim');

-- Data Kategori Produk
INSERT INTO `kategori_produk` (`id_kategori`, `nama_kategori`, `keterangan`) VALUES
(1, 'Kuliner & Makanan Olahan', 'Aneka keripik, jajanan tradisional, dan olahan pakan desa'),
(2, 'Kerajinan Tangan & Kriya', 'Batik tulis, ukiran, dan kerajinan anyaman bambu'),
(3, 'Hasil Pertanian & Perkebunan', 'Kopi robusta organik, rempah-rempah, dan beras desa'),
(4, 'Jasa & Usaha Kreatif', 'Layanan desain, fotografi produk, dan perbengkelan'),
(5, 'Lainnya', 'Kategori produk umum lainnya');

-- Data Pendaftaran UMKM (Sample dari Form Web)
INSERT INTO `pendaftaran_umkm` (`nama_pemilik`, `nama_umkm`, `email`, `telepon`, `id_kategori`, `deskripsi_usaha`, `status_verifikasi`) VALUES
('Budi Santoso', 'Keripik Singkong Paseban Berkah', 'budi@paseban.id', '081234567890', 1, 'Produsen keripik singkong aneka rasa khas Desa Paseban Kawis.', 'disetujui'),
('Siti Rahma', 'Batik Tulis Kawis Motif', 'siti@paseban.id', '085712345678', 2, 'Pengrajin kain batik tulis dengan motif khas lokal.', 'disetujui'),
('Pak Beyu', 'Kopi Robusta Organik Flores Paseban', 'beyu@paseban.id', '081987654321', 3, 'Usaha pengolahan biji kopi pilihan langsung dari perkebunan desa.', 'pending');

-- Data Produk E-Katalog
INSERT INTO `produk_ekatalog` (`id_umkm`, `id_kategori`, `nama_produk`, `harga`, `stok`, `deskripsi_ai`, `foto_produk`) VALUES
(1, 1, 'Keripik Singkong Pedas Manis Premium', 25000.00, 150, 'Keripik singkong renyah yang diproses dengan bumbu cabai asli khas Desa Paseban Kawis.', 'images/hero-display.jpg'),
(2, 2, 'Kain Batik Tulis Motif Kawis Elegant', 350000.00, 20, 'Batik tulis buatan tangan pewarna alami berkualitas tinggi.', 'images/about-umkm.jpg'),
(3, 3, 'Kopi Robusta Organik Roasted Beans 250g', 45000.00, 80, 'Biji kopi pilihan roasted medium-dark aroma manis gurih alami.', 'images/hero-display.jpg');

-- Data Analisis Kekuatan & Kekurangan
INSERT INTO `analisis_jurnal` (`tipe`, `poin_analisis`, `deskripsi_detail`) VALUES
('kekuatan', 'Isu Sangat Relevan', 'Mengangkat permasalahan nyata mengenai digitalisasi UMKM desa di era modern.'),
('kekuatan', 'Solusi Berbasis AI', 'Memanfaatkan teknologi Artificial Intelligence sebagai alat efisiensi pemasaran.'),
('kekurangan', 'Skala Lokasi Terbatas', 'Ruang lingkup penelitian saat ini masih berfokus spesifik di Desa Paseban Kawis.'),
('kekurangan', 'Literasi Digital', 'Penggunaan AI memerlukan pendampingan berkelanjutan bagi pelaku UMKM.');

-- ====================================================================
-- 4. VIEW & QUERY CONTOH UNTUK MYSQL WORKBENCH
-- ====================================================================

-- View untuk Menampilkan E-Katalog Produk Lengkap dengan Nama UMKM & Kategori
CREATE OR REPLACE VIEW `vw_ekatalog_lengkap` AS
SELECT 
    p.`id_produk`,
    p.`nama_produk`,
    p.`harga`,
    p.`stok`,
    p.`deskripsi_ai`,
    k.`nama_kategori`,
    u.`nama_umkm`,
    u.`nama_pemilik`,
    u.`telepon` AS `kontak_pemilik`
FROM `produk_ekatalog` p
JOIN `kategori_produk` k ON p.`id_kategori` = k.`id_kategori`
JOIN `pendaftaran_umkm` u ON p.`id_umkm` = u.`id_umkm`
WHERE p.`status_aktif` = 1;

-- Skrip selesai

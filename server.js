/**
 * ==============================================================================
 * SERVER API RESTFUL - DIGITALISASI UMKM DESA PASEBAN KAWIS
 * Koneksi ke MySQL Server / MySQL Workbench
 * ==============================================================================
 */

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Anti-caching untuk seluruh rute API agar sinkronisasi data selalu real-time
app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

// Melayani file frontend (HTML, CSS, JS, Gambar) secara langsung
const path = require('path');
app.use(express.static(__dirname));

// ==============================================================================
// 1. TEMPLATE KONEKSI DATABASE MYSQL WORKBENCH
// Sesuaikan kredensial di bawah (atau melalui file .env)
// ==============================================================================
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',       // Isi password root MySQL Anda di sini
    database: process.env.DB_NAME || 'db_paseban_umkm',
    port: process.env.DB_PORT || 3309,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Tes Koneksi & Inisialisasi Tabel Admin
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Gagal terhubung ke MySQL Database:', err.message);
        console.log('👉 Pastikan MySQL Server Anda berjalan dan database "db_paseban_umkm" sudah diimport.');
    } else {
        console.log('✅ Berhasil terhubung ke database MySQL Workbench ("db_paseban_umkm")');
        
        // Buat tabel admin_users jika belum ada
        const createAdminTable = `
            CREATE TABLE IF NOT EXISTS admin_users (
                id_admin INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                nama_lengkap VARCHAR(100) NOT NULL,
                role VARCHAR(50) DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;
        connection.query(createAdminTable, (tableErr) => {
            if (!tableErr) {
                // Periksa apakah admin default sudah ada
                connection.query('SELECT COUNT(*) AS total FROM admin_users', (countErr, countResult) => {
                    if (!countErr && countResult[0].total === 0) {
                        const insertDefaultAdmin = `
                            INSERT INTO admin_users (username, password, nama_lengkap, role)
                            VALUES ('admin', 'admin123', 'Administrator UMKM', 'Super Admin')
                        `;
                        connection.query(insertDefaultAdmin, () => {
                            console.log('👤 Akun admin default berhasil diinisialisasi (username: admin)');
                        });
                    }
                });
            }
            connection.release();
        });
    }
});

// ==============================================================================
// 2. ENDPOINT API
// ==============================================================================

// Endpoint Beranda Frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint Dokumentasi API
app.get('/api', (req, res) => {
    res.json({
        message: 'Selamat datang di API E-Katalog UMKM Desa Paseban Kawis',
        endpoints: {
            jurnal: '/api/jurnal',
            anggota: '/api/anggota',
            kategori: '/api/kategori',
            produk: '/api/produk',
            pendaftaran_umkm: '/api/umkm (GET / POST)'
        }
    });
});

// GET: Metadata Jurnal
app.get('/api/jurnal', (req, res) => {
    const query = 'SELECT * FROM jurnal_info LIMIT 1';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, data: results[0] || null });
    });
});

// GET: Anggota Kelompok
app.get('/api/anggota', (req, res) => {
    const query = 'SELECT * FROM anggota_kelompok ORDER BY id_anggota ASC';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, data: results });
    });
});

// GET: Kategori Produk
app.get('/api/kategori', (req, res) => {
    const query = 'SELECT * FROM kategori_produk ORDER BY id_kategori ASC';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, data: results });
    });
});

// GET: Seluruh Produk E-Katalog (dengan filter pencarian opsional)
// Menampilkan SEMUA produk: data lama dan data baru tanpa filter status
app.get('/api/produk', (req, res) => {
    const search = req.query.search;
    const statusFilter = req.query.status; // opsional: 'aktif' | 'nonaktif' | kosong = semua

    let query = `
        SELECT p.id_produk, p.id_umkm, p.id_kategori, p.nama_produk, p.harga, p.stok,
               p.deskripsi_ai, p.foto_produk, p.status_aktif, p.created_at,
               COALESCE(k.nama_kategori, 'Umum') AS nama_kategori,
               COALESCE(u.nama_umkm, 'UMKM Paseban') AS nama_umkm,
               u.nama_pemilik, u.telepon, u.status_verifikasi AS umkm_status
        FROM produk_ekatalog p
        LEFT JOIN kategori_produk k ON p.id_kategori = k.id_kategori
        LEFT JOIN pendaftaran_umkm u ON p.id_umkm = u.id_umkm
        WHERE 1=1
    `;
    const params = [];

    // Filter status opsional
    if (statusFilter === 'aktif') {
        query += ' AND p.status_aktif = 1';
    } else if (statusFilter === 'nonaktif') {
        query += ' AND p.status_aktif = 0';
    }
    // Jika statusFilter kosong -> tampilkan SEMUA produk

    if (search) {
        query += ' AND (p.nama_produk LIKE ? OR p.deskripsi_ai LIKE ? OR u.nama_umkm LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY p.created_at DESC, p.id_produk DESC';

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, count: results.length, data: results });
    });
});

// POST: Tambah Produk Baru ke E-Katalog
app.post('/api/produk', (req, res) => {
    const { nama_produk, id_kategori, harga, stok, deskripsi_ai, foto_produk, id_umkm } = req.body;

    if (!nama_produk || !harga) {
        return res.status(400).json({
            success: false,
            message: 'Nama produk dan harga wajib diisi!'
        });
    }

    // Default id_umkm ke 1 jika tidak disertakan
    const targetUmkm = id_umkm || 1;
    const targetKat = id_kategori || 1;
    const targetStok = stok || 10;
    const targetFoto = foto_produk || 'images/hero-display.jpg';

    const insertQuery = `
        INSERT INTO produk_ekatalog 
        (id_umkm, id_kategori, nama_produk, harga, stok, deskripsi_ai, foto_produk, status_aktif) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `;

    db.query(insertQuery, [targetUmkm, targetKat, nama_produk, harga, targetStok, deskripsi_ai || '', targetFoto], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.status(201).json({
            success: true,
            message: 'Produk E-Katalog baru berhasil ditambahkan!',
            id_produk: result.insertId
        });
    });
});


// GET: Data Pendaftaran UMKM
app.get('/api/umkm', (req, res) => {
    const query = `
        SELECT u.*, k.nama_kategori 
        FROM pendaftaran_umkm u
        LEFT JOIN kategori_produk k ON u.id_kategori = k.id_kategori
        ORDER BY u.id_umkm DESC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, data: results });
    });
});

// POST: Menerima Submit Form Pendaftaran UMKM dari Website
app.post('/api/umkm', (req, res) => {
    const { nama_pemilik, nama_umkm, email, telepon, kategori, pesan } = req.body;

    if (!nama_pemilik || !nama_umkm || !email || !telepon) {
        return res.status(400).json({
            success: false,
            message: 'Bidang nama pemilik, nama UMKM, email, dan telepon wajib diisi!'
        });
    }

    // Mapping value string kategori form ke id_kategori tabel
    let id_kategori = 1;
    if (kategori === 'kerajinan') id_kategori = 2;
    else if (kategori === 'pertanian') id_kategori = 3;
    else if (kategori === 'jasa') id_kategori = 4;
    else if (kategori === 'lainnya') id_kategori = 5;

    const query = `
        INSERT INTO pendaftaran_umkm 
        (nama_pemilik, nama_umkm, email, telepon, id_kategori, deskripsi_usaha, status_verifikasi) 
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `;

    db.query(query, [nama_pemilik, nama_umkm, email, telepon, id_kategori, pesan || ''], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.status(201).json({
            success: true,
            message: 'Pendaftaran UMKM berhasil disimpan ke database!',
            id_umkm: result.insertId
        });
    });
});

// ==============================================================================
// 3. ENDPOINT ADMIN & AUTENTIKASI
// ==============================================================================

// Rute Halaman Login & Dashboard Admin
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// POST: Login Admin
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username dan kata sandi wajib diisi!'
        });
    }

    const query = 'SELECT * FROM admin_users WHERE username = ? LIMIT 1';
    db.query(query, [username], (err, results) => {
        // Fallback jika query error atau belum ada di tabel tapi menggunakan akun admin standar
        if (err || !results || results.length === 0) {
            if (username === 'admin' && password === 'admin123') {
                return res.json({
                    success: true,
                    message: 'Login berhasil sebagai Administrator!',
                    token: 'adm_session_' + Date.now(),
                    user: {
                        username: 'admin',
                        nama_lengkap: 'Administrator UMKM',
                        role: 'Super Admin'
                    }
                });
            }
            return res.status(401).json({
                success: false,
                message: 'Username atau kata sandi tidak sesuai!'
            });
        }

        const user = results[0];
        if (user.password === password) {
            return res.json({
                success: true,
                message: 'Login berhasil!',
                token: 'adm_session_' + Date.now(),
                user: {
                    id_admin: user.id_admin,
                    username: user.username,
                    nama_lengkap: user.nama_lengkap,
                    role: user.role
                }
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'Username atau kata sandi tidak sesuai!'
            });
        }
    });
});

// GET: Statistik Ringkas untuk Dashboard Admin
app.get('/api/admin/stats', (req, res) => {
    const statsQuery = `
        SELECT 
            (SELECT COUNT(*) FROM produk_ekatalog) AS total_produk,
            (SELECT COUNT(*) FROM pendaftaran_umkm) AS total_umkm,
            (SELECT COUNT(*) FROM pendaftaran_umkm WHERE status_verifikasi = 'pending') AS umkm_pending,
            (SELECT COUNT(*) FROM kategori_produk) AS total_kategori
    `;
    db.query(statsQuery, (err, results) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({
            success: true,
            data: results[0] || { total_produk: 0, total_umkm: 0, umkm_pending: 0, total_kategori: 0 }
        });
    });
});

// PATCH: Perbarui Status Verifikasi UMKM (pending / disetujui / ditolak)
app.patch('/api/umkm/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'disetujui', 'ditolak'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Status tidak valid!' });
    }

    db.query('UPDATE pendaftaran_umkm SET status_verifikasi = ? WHERE id_umkm = ?', [status, id], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Data UMKM tidak ditemukan!' });
        }
        res.json({
            success: true,
            message: `Status verifikasi UMKM #${id} berhasil diubah menjadi "${status}".`
        });
    });
});

// PUT: Perbarui Seluruh Data UMKM
app.put('/api/umkm/:id', (req, res) => {
    const { id } = req.params;
    const { nama_pemilik, nama_umkm, email, telepon, id_kategori, deskripsi_usaha, status_verifikasi } = req.body;

    if (!nama_pemilik || !nama_umkm) {
        return res.status(400).json({ success: false, message: 'Nama pemilik dan nama UMKM wajib diisi!' });
    }

    const sql = `
        UPDATE pendaftaran_umkm 
        SET nama_pemilik = ?, nama_umkm = ?, email = ?, telepon = ?, id_kategori = ?, deskripsi_usaha = ?, status_verifikasi = ?
        WHERE id_umkm = ?
    `;

    db.query(sql, [
        nama_pemilik,
        nama_umkm,
        email || '',
        telepon || '',
        id_kategori || 1,
        deskripsi_usaha || '',
        status_verifikasi || 'pending',
        id
    ], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Data UMKM tidak ditemukan!' });
        }
        res.json({
            success: true,
            message: `Data UMKM "${nama_umkm}" berhasil diperbarui!`
        });
    });
});

// DELETE: Hapus Data Pendaftaran UMKM (Beserta cascade produk jika ada)
app.delete('/api/umkm/:id', (req, res) => {
    const { id } = req.params;

    // Hapus relasi produk terkait terlebih dahulu agar terhindar dari constraint lock
    db.query('DELETE FROM produk_ekatalog WHERE id_umkm = ?', [id], (errProd) => {
        db.query('DELETE FROM pendaftaran_umkm WHERE id_umkm = ?', [id], (err, result) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Data UMKM tidak ditemukan atau sudah dihapus!' });
            }
            res.json({
                success: true,
                message: 'Data pendaftaran UMKM berhasil dihapus secara permanen.'
            });
        });
    });
});

// PATCH: Toggle Status Aktif Produk
app.patch('/api/produk/:id/status', (req, res) => {
    const { id } = req.params;
    const { status_aktif } = req.body;

    const val = status_aktif ? 1 : 0;
    db.query('UPDATE produk_ekatalog SET status_aktif = ? WHERE id_produk = ?', [val, id], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Produk tidak ditemukan!' });
        }
        res.json({
            success: true,
            message: `Status produk berhasil diubah menjadi ${val === 1 ? 'Aktif' : 'Nonaktif'}.`
        });
    });
});

// PUT: Perbarui Seluruh Data Produk E-Katalog
app.put('/api/produk/:id', (req, res) => {
    const { id } = req.params;
    const { nama_produk, id_kategori, harga, stok, deskripsi_ai, foto_produk, status_aktif, id_umkm } = req.body;

    if (!nama_produk || !harga) {
        return res.status(400).json({ success: false, message: 'Nama produk dan harga wajib diisi!' });
    }

    const sql = `
        UPDATE produk_ekatalog
        SET nama_produk = ?, id_kategori = ?, harga = ?, stok = ?, deskripsi_ai = ?, foto_produk = ?, status_aktif = ?, id_umkm = ?
        WHERE id_produk = ?
    `;

    db.query(sql, [
        nama_produk,
        id_kategori || 1,
        harga,
        stok || 0,
        deskripsi_ai || '',
        foto_produk || 'images/hero-display.jpg',
        status_aktif ? 1 : 0,
        id_umkm || 1,
        id
    ], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Produk tidak ditemukan!' });
        }
        res.json({
            success: true,
            message: `Produk "${nama_produk}" berhasil diperbarui!`
        });
    });
});

// DELETE: Hapus Produk E-Katalog
app.delete('/api/produk/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM produk_ekatalog WHERE id_produk = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Produk tidak ditemukan atau sudah dihapus!' });
        }
        res.json({
            success: true,
            message: 'Produk berhasil dihapus dari sistem.'
        });
    });
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`🚀 Server API berjalan di http://localhost:${PORT}`);
});

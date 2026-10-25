/**
 * Script Interaktif untuk Website E-Katalog UMKM Desa Paseban Kawis
 * Menambahkan Animasi Scroll Reveal, Live Counter, Custom Modal, Form Progress, Quick Presets & 3D Tilt Effect
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. ANIMASI SCROLL REVEAL (INTERSECTION OBSERVER)
    const revealElements = document.querySelectorAll('section, .fitur-card, .check-card, .warning-card, .anggota-card, .hero-text, .hero-media');

    revealElements.forEach(el => el.classList.add('reveal-on-scroll'));

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));


    // 2. EFEK 3D TILT INTERAKTIF PADA KARTU & GAMBAR
    const tiltElements = document.querySelectorAll('.tilt-effect');

    tiltElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 12;
            const rotateY = (centerX - x) / 12;

            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
        });
    });


    // 3. LIVE STATS COUNTER ANIMATION
    const statNums = document.querySelectorAll('.stat-num');
    let animatedStats = false;

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animatedStats) {
                animatedStats = true;
                animateCounters();
            }
        });
    }, { threshold: 0.5 });

    const statsContainer = document.querySelector('.card-stats');
    if (statsContainer) statsObserver.observe(statsContainer);

    function animateCounters() {
        statNums.forEach(stat => {
            const text = stat.textContent;
            if (text.includes('100+')) {
                let count = 0;
                const timer = setInterval(() => {
                    count += 5;
                    if (count >= 100) {
                        stat.textContent = '100+';
                        clearInterval(timer);
                    } else {
                        stat.textContent = count + '+';
                    }
                }, 35);
            }
        });
    }


    // 4. FITUR CARD INTERACTIVE MODAL DETAIL
    const fiturCards = document.querySelectorAll('.fitur-card');

    let fiturModal = document.getElementById('fiturModal');
    if (!fiturModal) {
        fiturModal = document.createElement('div');
        fiturModal.id = 'fiturModal';
        fiturModal.className = 'custom-modal';
        fiturModal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close" aria-label="Tutup">&times;</button>
                <div class="modal-icon" id="modalIcon">🛍️</div>
                <h3 id="modalTitle">Detail Fitur</h3>
                <p id="modalDesc">Deskripsi detail fitur akan ditampilkan di sini.</p>
                <button class="btn-modal-action" id="modalBtnClose">Mengerti</button>
            </div>
        `;
        document.body.appendChild(fiturModal);

        const closeBtn = fiturModal.querySelector('.modal-close');
        const actionBtn = fiturModal.querySelector('#modalBtnClose');

        [closeBtn, actionBtn].forEach(btn => {
            btn?.addEventListener('click', () => fiturModal.classList.remove('active'));
        });

        fiturModal.addEventListener('click', (e) => {
            if (e.target === fiturModal) fiturModal.classList.remove('active');
        });
    }

    fiturCards.forEach(card => {
        card.addEventListener('click', () => {
            const icon = card.querySelector('.fitur-icon')?.textContent || '✨';
            const title = card.querySelector('h3')?.textContent || 'Fitur E-Katalog';
            const desc = card.querySelector('p')?.textContent || '';

            document.getElementById('modalIcon').textContent = icon;
            document.getElementById('modalTitle').textContent = title;
            document.getElementById('modalDesc').textContent = `${desc} Fitur ini dikembangkan untuk mengoptimalkan potensi pemasaran digital produk UMKM Desa Paseban Kawis secara luas dan berkelanjutan.`;

            fiturModal.classList.add('active');
        });
    });


    // 5. QUICK PRESETS INTERAKTIF PADA FORM
    const presetBtns = document.querySelectorAll('.preset-btn');
    const umkmForm = document.querySelector('.umkm-form');
    const pesanInput = document.getElementById('pesan');

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('nama-pemilik').value = btn.dataset.nama || '';
            document.getElementById('nama-umkm').value = btn.dataset.umkm || '';
            document.getElementById('email').value = btn.dataset.email || '';
            document.getElementById('telepon').value = btn.dataset.tel || '';
            document.getElementById('kategori').value = btn.dataset.kat || '';
            if (pesanInput) pesanInput.value = btn.dataset.pesan || '';

            updateProgress();
            showToast(`✨ Template preset <strong>${btn.textContent}</strong> berhasil diisikan ke form!`, 'info');
            
            umkmForm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });


    // 6. FORM COMPLETION PROGRESS BAR & CHARACTER COUNTER
    if (umkmForm) {
        const formHeader = umkmForm.previousElementSibling;
        const progressBarWrapper = document.createElement('div');
        progressBarWrapper.className = 'form-progress-wrapper';
        progressBarWrapper.innerHTML = `
            <div class="progress-info">
                <span>Indikator Kelengkapan Form:</span>
                <span id="progressPercent">0%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
        `;
        if (formHeader) formHeader.appendChild(progressBarWrapper);

        const formInputs = umkmForm.querySelectorAll('input[required], select[required], textarea[required]');

        function updateProgress() {
            let filled = 0;
            formInputs.forEach(input => {
                if (input.value.trim() !== '') filled++;
            });
            const percent = Math.round((filled / formInputs.length) * 100);
            const fillEl = document.getElementById('progressFill');
            const percentEl = document.getElementById('progressPercent');

            if (fillEl && percentEl) {
                fillEl.style.width = `${percent}%`;
                percentEl.textContent = `${percent}%`;
            }
        }

        formInputs.forEach(input => {
            input.addEventListener('input', updateProgress);
            input.addEventListener('change', updateProgress);
        });

        if (pesanInput) {
            const charCounter = document.createElement('div');
            charCounter.className = 'char-counter';
            charCounter.innerHTML = '<span id="charCount">0</span> / 300 karakter';
            pesanInput.after(charCounter);

            pesanInput.addEventListener('input', () => {
                const len = pesanInput.value.length;
                const charEl = document.getElementById('charCount');
                if (charEl) charEl.textContent = len;

                if (len > 300) {
                    charCounter.style.color = '#e74c3c';
                } else {
                    charCounter.style.color = '#667085';
                }
            });
        }
    }


    // 7. SCROLLSPY (Highlight Menu Navigasi)
    const sections = document.querySelectorAll('section, header');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let currentSection = '';
        const scrollPosition = window.scrollY + 180;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });

        const backToTopBtn = document.getElementById('backToTopBtn');
        if (backToTopBtn) {
            if (window.scrollY > 350) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        }
    });


    // 8. FITUR PENCARIAN INTERAKTIF
    const searchForm = document.querySelector('.search-form');
    const searchInput = searchForm ? searchForm.querySelector('input') : null;

    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim().toLowerCase();
            if (!query) return;

            let found = false;
            const searchTargets = document.querySelectorAll('section, .fitur-card, .check-card, .warning-card');

            searchTargets.forEach(target => {
                const contentText = target.textContent.toLowerCase();
                if (contentText.includes(query) && !found) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    target.classList.add('highlight-search');
                    setTimeout(() => target.classList.remove('highlight-search'), 2200);
                    found = true;
                }
            });

            if (!found) {
                showToast('Topik pencarian tidak ditemukan. Silakan gunakan kata kunci lain.', 'warning');
            } else {
                showToast(`Pencarian untuk "<strong>${query}</strong>" ditemukan.`, 'info');
            }
        });
    }


    // 9. VALIDASI FORM & PENGIRIMAN DATA KE DATABASE MYSQL VIA API
    if (umkmForm) {
        umkmForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const namaPemilik = document.getElementById('nama-pemilik')?.value.trim();
            const namaUmkm = document.getElementById('nama-umkm')?.value.trim();
            const email = document.getElementById('email')?.value.trim();
            const telepon = document.getElementById('telepon')?.value.trim();
            const kategori = document.getElementById('kategori')?.value;
            const pesan = document.getElementById('pesan')?.value.trim();

            if (!namaPemilik || !namaUmkm || !email || !telepon) {
                showToast('Mohon lengkapi seluruh bidang formulir yang wajib diisi.', 'danger');
                return;
            }

            const submitBtn = umkmForm.querySelector('.btn-submit');
            const originalBtnText = submitBtn ? submitBtn.textContent : 'Kirim Pendaftaran';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Menyimpan ke Database...';
            }

            try {
                // Kirim data ke REST API backend Express -> MySQL Database
                const response = await fetch('/api/umkm', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        nama_pemilik: namaPemilik,
                        nama_umkm: namaUmkm,
                        email: email,
                        telepon: telepon,
                        kategori: kategori,
                        pesan: pesan
                    })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    showToast(`🎉 Berhasil! Data <strong>${namaUmkm}</strong> telah tersimpan ke database MySQL.`, 'success');
                    umkmForm.reset();

                    const fillEl = document.getElementById('progressFill');
                    const percentEl = document.getElementById('progressPercent');
                    const charEl = document.getElementById('charCount');
                    if (fillEl && percentEl) {
                        fillEl.style.width = '0%';
                        percentEl.textContent = '0%';
                    }
                    if (charEl) charEl.textContent = '0';
                } else {
                    showToast(`⚠️ Gagal menyimpan: ${result.message || result.error || 'Terjadi kesalahan'}`, 'danger');
                }
            } catch (err) {
                console.error('Error pengiriman ke API:', err);
                showToast('⚠️ Gagal terhubung ke server API. Pastikan server aktif (node server.js).', 'danger');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            }
        });
    }


    // 10. SISTEM NOTIFIKASI TOAST FLOATING
    function showToast(message, type = 'success') {
        let toast = document.getElementById('toastNotification');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toastNotification';
            toast.className = 'toast-notification';
            document.body.appendChild(toast);
        }

        toast.innerHTML = message;
        toast.className = `toast-notification toast-${type} show`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }


    // 11. HAMBURGER MENU NAVIGASI MOBILE
    const navbarContainer = document.querySelector('.navbar-container');
    const navMenu = document.querySelector('.nav-menu');

    if (navbarContainer && navMenu) {
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'mobile-nav-toggle';
        mobileToggle.setAttribute('aria-label', 'Buka Menu Navigasi');
        mobileToggle.innerHTML = '☰';

        const logo = navbarContainer.querySelector('.logo');
        if (logo) {
            logo.after(mobileToggle);
        }

        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            mobileToggle.innerHTML = navMenu.classList.contains('open') ? '✕' : '☰';
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                if (mobileToggle) mobileToggle.innerHTML = '☰';
            });
        });
    }


    // 12. TOMBOL FLOATING KEMBALI KE ATAS
    const backToTopBtn = document.createElement('button');
    backToTopBtn.id = 'backToTopBtn';
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '↑';
    backToTopBtn.setAttribute('title', 'Kembali ke Atas');
    document.body.appendChild(backToTopBtn);

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });


    // 13. E-KATALOG: LOAD PRODUK DARI DATABASE MYSQL VIA API
    const produkGridContainer = document.getElementById('produkGridContainer');
    const btnRefreshKatalog = document.getElementById('btnRefreshKatalog');
    const totalProdukCount = document.getElementById('totalProdukCount');

    // Inject filter tabs ke dalam section daftar produk
    const daftarProdukSection = document.getElementById('daftar-produk');
    if (daftarProdukSection && !document.getElementById('filterTabsKatalog')) {
        const tabsWrapper = document.createElement('div');
        tabsWrapper.id = 'filterTabsKatalog';
        tabsWrapper.style.cssText = 'display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px;';
        tabsWrapper.innerHTML = `
            <button class="filter-tab active" data-status="" style="
                padding: 7px 18px; border-radius: 20px; border: 2px solid #16a34a;
                background: #16a34a; color: #fff; font-weight: 700; font-size: 0.85rem;
                cursor: pointer; transition: all 0.2s;
            ">🗂️ Semua Produk</button>
            <button class="filter-tab" data-status="aktif" style="
                padding: 7px 18px; border-radius: 20px; border: 2px solid #16a34a;
                background: transparent; color: #16a34a; font-weight: 600; font-size: 0.85rem;
                cursor: pointer; transition: all 0.2s;
            ">✅ Aktif</button>
            <button class="filter-tab" data-status="nonaktif" style="
                padding: 7px 18px; border-radius: 20px; border: 2px solid #9ca3af;
                background: transparent; color: #6b7280; font-weight: 600; font-size: 0.85rem;
                cursor: pointer; transition: all 0.2s;
            ">⏸️ Nonaktif</button>
        `;
        // Sisipkan sebelum produkGridContainer
        if (produkGridContainer) {
            produkGridContainer.before(tabsWrapper);
        }

        // Event filter tab
        tabsWrapper.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                tabsWrapper.querySelectorAll('.filter-tab').forEach(t => {
                    t.style.background = 'transparent';
                    t.style.color = t.dataset.status === '' ? '#16a34a' : (t.dataset.status === 'aktif' ? '#16a34a' : '#6b7280');
                });
                tab.style.background = tab.dataset.status === 'nonaktif' ? '#6b7280' : '#16a34a';
                tab.style.color = '#fff';
                const query = document.getElementById('katalogSearchInput')?.value.trim() || '';
                loadProdukEkatalog(query, tab.dataset.status);
            });
        });
    }

    function formatRupiah(angka) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
    }

    function formatTanggal(isoStr) {
        if (!isoStr) return '-';
        const d = new Date(isoStr);
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    async function loadProdukEkatalog(searchQuery = '', statusFilter = '') {
        if (!produkGridContainer) return;

        produkGridContainer.innerHTML = `
            <div class="loading-state">
                <p>⏳ Sedang memuat produk dari database MySQL...</p>
            </div>
        `;

        try {
            let url = '/api/produk';
            const params = [];
            if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);
            if (statusFilter)  params.push(`status=${encodeURIComponent(statusFilter)}`);
            if (params.length) url += '?' + params.join('&');

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success || !result.data || result.data.length === 0) {
                produkGridContainer.innerHTML = `
                    <div class="loading-state" style="color: #667085;">
                        <p>📭 Belum ada produk. Tambahkan produk pertama!</p>
                    </div>
                `;
                if (totalProdukCount) totalProdukCount.textContent = '0';
                return;
            }

            if (totalProdukCount) totalProdukCount.textContent = result.count + '+';

            const cardsHTML = result.data.map(produk => {
                const isAktif = produk.status_aktif == 1;
                const statusBadge = isAktif
                    ? `<span style="
                        position: absolute; top: 10px; right: 10px;
                        background: rgba(22,163,74,0.92); color: #fff;
                        font-size: 10px; font-weight: 700; padding: 3px 9px;
                        border-radius: 20px;">✅ Aktif</span>`
                    : `<span style="
                        position: absolute; top: 10px; right: 10px;
                        background: rgba(107,114,128,0.92); color: #fff;
                        font-size: 10px; font-weight: 700; padding: 3px 9px;
                        border-radius: 20px;">⏸️ Nonaktif</span>`;

                const cardOpacity = isAktif ? '1' : '0.72';

                return `
                <div class="produk-card" style="
                    background: #fff;
                    border-radius: 16px;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
                    overflow: hidden;
                    transition: transform 0.25s ease, box-shadow 0.25s ease;
                    display: flex;
                    flex-direction: column;
                    opacity: ${cardOpacity};
                    ${!isAktif ? 'border: 2px dashed #d1d5db;' : ''}
                " onmouseover="this.style.transform='translateY(-6px)';this.style.boxShadow='0 12px 40px rgba(0,0,0,0.14)';this.style.opacity='1'"
                   onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 24px rgba(0,0,0,0.08)';this.style.opacity='${cardOpacity}'">
                    <div style="position: relative; overflow: hidden; height: 180px; background: #f3f4f6;">
                        <img src="${produk.foto_produk || 'images/hero-display.jpg'}"
                             alt="${produk.nama_produk}"
                             style="width:100%; height:100%; object-fit:cover; transition: transform 0.35s ease;
                                    ${!isAktif ? 'filter: grayscale(40%);' : ''}"
                             onerror="this.src='images/hero-display.jpg'"
                             onmouseover="this.style.transform='scale(1.07)'"
                             onmouseout="this.style.transform='scale(1)'">
                        <span style="
                            position: absolute; top: 10px; left: 10px;
                            background: rgba(22,163,74,0.9); color: #fff;
                            font-size: 11px; font-weight: 700; padding: 3px 10px;
                            border-radius: 20px; letter-spacing: 0.5px;
                        ">${produk.nama_kategori || 'Produk'}</span>
                        ${statusBadge}
                    </div>
                    <div style="padding: 16px 18px 20px; flex: 1; display: flex; flex-direction: column; gap: 8px;">
                        <h3 style="margin:0; font-size: 1rem; font-weight: 700; color: #1a202c; line-height: 1.3;">${produk.nama_produk}</h3>
                        <p style="margin:0; font-size: 0.82rem; color: #667085; line-height: 1.5; flex: 1;">${produk.deskripsi_ai || 'Produk unggulan dari UMKM Desa Paseban Kawis.'}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                            <span style="font-size: 1.05rem; font-weight: 800; color: #16a34a;">${formatRupiah(produk.harga)}</span>
                            <span style="font-size: 0.78rem; color: #9ca3af;">Stok: ${produk.stok}</span>
                        </div>
                        <div style="font-size: 0.78rem; color: #a0aec0; border-top: 1px solid #f0f0f0; padding-top: 8px; margin-top: 4px;">
                            🏪 ${produk.nama_umkm || '-'} &bull; 📞 ${produk.telepon || '-'}
                        </div>
                        <div style="font-size: 0.72rem; color: #c4c9d4; margin-top: 2px;">
                            📅 Ditambahkan: ${formatTanggal(produk.created_at)}
                        </div>
                    </div>
                </div>`;
            }).join('');

            produkGridContainer.innerHTML = cardsHTML;

        } catch (err) {
            console.error('Gagal memuat produk:', err);
            produkGridContainer.innerHTML = `
                <div class="loading-state" style="color: #e53e3e;">
                    <p>❌ Gagal terhubung ke server API MySQL.</p>
                    <p style="font-size: 0.85rem; color: #667085; margin-top: 8px;">
                        Pastikan server sudah berjalan dengan perintah: <code>node server.js</code><br>
                        lalu buka <strong>http://localhost:3000/ekatalog.html</strong><br>
                        Error: ${err.message}
                    </p>
                </div>
            `;
            if (totalProdukCount) totalProdukCount.textContent = 'Error';
        }
    }

    // Auto-load saat halaman ekatalog dibuka
    if (produkGridContainer) {
        loadProdukEkatalog();
    }

    // Tombol Muat Ulang Data
    if (btnRefreshKatalog) {
        btnRefreshKatalog.addEventListener('click', () => {
            const katalogSearchInput = document.getElementById('katalogSearchInput');
            const query = katalogSearchInput ? katalogSearchInput.value.trim() : '';
            const activeTab = document.querySelector('.filter-tab.active');
            const status = activeTab ? activeTab.dataset.status : '';
            loadProdukEkatalog(query, status);
        });
    }

    // Pencarian produk pada katalog
    const katalogSearchForm = document.getElementById('katalogSearchForm');
    const katalogSearchInput = document.getElementById('katalogSearchInput');
    if (katalogSearchForm && katalogSearchInput) {
        katalogSearchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const activeTab = document.querySelector('.filter-tab.active');
            const status = activeTab ? activeTab.dataset.status : '';
            loadProdukEkatalog(katalogSearchInput.value.trim(), status);
        });

        // Real-time search dengan debounce
        let searchDebounce;
        katalogSearchInput.addEventListener('input', () => {
            clearTimeout(searchDebounce);
            searchDebounce = setTimeout(() => {
                const activeTab = document.querySelector('.filter-tab.active');
                const status = activeTab ? activeTab.dataset.status : '';
                loadProdukEkatalog(katalogSearchInput.value.trim(), status);
            }, 500);
        });
    }


    // 14. E-KATALOG: FORM TAMBAH PRODUK BARU KE DATABASE
    const formTambahProduk = document.getElementById('formTambahProduk');
    if (formTambahProduk) {
        formTambahProduk.addEventListener('submit', async (e) => {
            e.preventDefault();

            const namaProduk = document.getElementById('nama_produk')?.value.trim();
            const idKategori = document.getElementById('id_kategori')?.value;
            const harga = document.getElementById('harga')?.value;
            const stok = document.getElementById('stok')?.value;
            const fotoProduk = document.getElementById('foto_produk')?.value;
            const deskripsiAi = document.getElementById('deskripsi_ai')?.value.trim();

            if (!namaProduk || !harga) {
                alert('⚠️ Nama produk dan harga wajib diisi!');
                return;
            }

            const submitBtn = document.getElementById('btnSubmitProduk');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = '⏳ Menyimpan ke Database...';
            }

            try {
                const response = await fetch('/api/produk', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nama_produk: namaProduk,
                        id_kategori: parseInt(idKategori) || 1,
                        harga: parseFloat(harga),
                        stok: parseInt(stok) || 10,
                        foto_produk: fotoProduk,
                        deskripsi_ai: deskripsiAi,
                        id_umkm: 1
                    })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    alert(`✅ Produk "${namaProduk}" berhasil ditambahkan ke database!`);
                    formTambahProduk.reset();
                    // Otomatis refresh daftar produk
                    loadProdukEkatalog();
                    // Scroll ke daftar produk
                    document.getElementById('daftar-produk')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                    alert(`❌ Gagal menyimpan: ${result.message || result.error || 'Terjadi kesalahan'}`);
                }
            } catch (err) {
                console.error('Error submit produk:', err);
                alert('❌ Gagal terhubung ke server. Pastikan server.js sedang berjalan.');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Simpan ke E-Katalog →';
                }
            }
        });
    }

});

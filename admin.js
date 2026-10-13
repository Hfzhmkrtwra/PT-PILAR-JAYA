/* Admin Dashboard — PT Pilar Jaya Kontruksi
   Fitur: Login, CRUD Real-Time, Import Data Contoh
*/
(function () {

  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBmQ9dNilq-61Goj-BvgvzBtOxgtACohhA",
    authDomain: "pilar-jaya-kontruksi-35d69.firebaseapp.com",
    projectId: "pilar-jaya-kontruksi-35d69",
    storageBucket: "pilar-jaya-kontruksi-35d69.firebasestorage.app",
    messagingSenderId: "995786907146",
    appId: "1:995786907146:web:3eacd77b81fb507c3fc9f3",
    measurementId: "G-8HM1M9KVC4"
  };

  firebase.initializeApp(FIREBASE_CONFIG);
  const auth = firebase.auth();
  const db = firebase.firestore();

  // ---------- Element References ----------
  const loginScreen = document.getElementById('loginScreen');
  const dashboard = document.getElementById('dashboard');
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');
  const loginBtn = document.getElementById('loginBtn');
  const adminEmail = document.getElementById('adminEmail');
  const logoutBtn = document.getElementById('logoutBtn');
  const modal = document.getElementById('modal');
  const modalForm = document.getElementById('modalForm');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');
  const modalCancel = document.getElementById('modalCancel');
  const modalSave = document.getElementById('modalSave');
  const toast = document.getElementById('toast');

  // ---------- State ----------
  let currentEdit = { collection: null, id: null };
  let cache = { galeri: [], testimonial: [], klien: [], pesan: [] };
  let unsubscribers = [];

  // ---------- Seed Data (untuk tombol Import) ----------
  const SEED_DATA = {
    galeri: [
      { title: 'Bukit Permai Extension Tipe 66',
        desc: 'Proyek extension rumah tipe 66 di Cluster Bukit Permai, Citra Indah City, Jonggol.',
        tag: 'Residensial', images: ['IMG-20260709-WA0028.jpg'] },
      { title: 'Matoa Tipe 22',
        desc: 'Pembangunan unit rumah tipe 22 di Cluster Matoa, Citra Indah City, Jonggol.',
        tag: 'Residensial', images: ['IMG-20260709-WA0058.jpg'] },
      { title: 'Bukit Freesia Tipe 36',
        desc: 'Proyek perumahan tipe 36 di Cluster Bukit Freesia, Citra Indah City, Jonggol.',
        tag: 'Residensial', images: ['IMG-20260709-WA0013.jpg'] },
      { title: 'Bukit Permai Tipe 89',
        desc: 'Pembangunan dan renovasi rumah tipe 89 di Cluster Bukit Permai.',
        tag: 'Residensial', images: ['IMG-20260709-WA0048.jpg'] },
      { title: 'Bukit Freesia Tipe 47 & 39',
        desc: 'Proyek pembangunan cluster besar tipe 47 dan 39 di Bukit Freesia yang telah selesai.',
        tag: 'Residensial', images: ['IMG-20260709-WA0034.jpg'] },
      { title: 'Rumah Cream Dormitory',
        desc: 'Gambar desain 3D, rumah cream dormitory - Tangerang.',
        tag: 'Desain', images: ['IMG-20260709-WA0111.jpg'] },
      { title: 'Bani Hafidz Center',
        desc: 'Gambar desain 3D, bani hafidz center - Subang.',
        tag: 'Desain', images: ['IMG-20260709-WA0114.jpg'] },
      { title: 'Sentul Edu Center & Residence',
        desc: 'Gambar desain 3D, sentul edu center & residence.',
        tag: 'Desain', images: ['IMG-20260709-WA0112.jpg'] },
      { title: 'Apartemen Ketapang',
        desc: 'Gambar desain 3D, apartemen ketapang.',
        tag: 'Desain', images: ['IMG-20260714-WA0001.jpg'] },
      { title: 'Taman',
        desc: 'Desain outdoor menghadirkan lingkungan yang asri melalui perpaduan material kayu, pepohonan, dan elemen air.',
        tag: 'Desain Interior',
        images: ['IMG-20260709-WA0155.jpg', 'IMG-20260709-WA0154.jpg', 'IMG-20260709-WA0153.jpg'] },
      { title: 'Mushola',
        desc: 'Mushola dengan desain interior yang estetik, nyaman, dan fungsional untuk tempat ibadah.',
        tag: 'Desain Interior',
        images: ['IMG-20260709-WA0133.jpg', 'IMG-20260709-WA0139.jpg', 'IMG-20260709-WA0135.jpg', 'IMG-20260709-WA0138.jpg'] },
      { title: 'Ruang Ganti',
        desc: 'Ruang ganti ini dirancang dengan konsep minimalis modern yang mengutamakan kenyamanan, kebersihan, dan efisiensi.',
        tag: 'Desain Interior',
        images: ['IMG-20260709-WA0136.jpg', 'IMG-20260709-WA0137.jpg'] },
      { title: 'Ruang Kerja',
        desc: 'Ruang kerja ini mengusung konsep modern minimalis dengan dominasi warna netral seperti putih, abu-abu, hitam, dan aksen kayu terang.',
        tag: 'Desain Interior',
        images: ['IMG-20260709-WA0141.jpg', 'IMG-20260709-WA0144.jpg'] },
      { title: 'Cafetaria',
        desc: 'Desain cafetaria ini mengombinasikan nuansa modern dengan sentuhan natural melalui penggunaan material kayu dan pencahayaan alami.',
        tag: 'Desain Interior',
        images: ['IMG-20260709-WA0126.jpg', 'IMG-20260709-WA0130.jpg', 'IMG-20260709-WA0131.jpg', 'IMG-20260709-WA0132.jpg'] },
      { title: 'Cafetaria',
        desc: 'Area lounge ini dirancang dengan mengusung konsep modern kontemporer yang mengutamakan keseimbangan antara aspek estetika, kenyamanan, dan fungsionalitas.',
        tag: 'Desain Interior',
        images: ['IMG-20260709-WA0148.jpg', 'IMG-20260709-WA0149.jpg', 'IMG-20260709-WA0150.jpg', 'IMG-20260709-WA0151.jpg'] }
    ],
    testimonial: [
      { text: 'Pilar Jaya Kontruksi memberikan solusi terbaik dalam pembangunan perumahan kami. Kualitas dan ketepatan waktu sangat memuaskan.',
        author: 'Manajemen Ciputra Citra Indah City' },
      { text: 'Kerjasama yang solid, tim ahli, dan legalitas yang lengkap membuat kami percaya untuk menggandeng Pilar Jaya dalam proyek berikutnya.',
        author: 'Partner dari Wika' },
      { text: 'Sebagai perusahaan baru, Pilar Jaya menunjukkan profesionalisme yang luar biasa. Cocok untuk mitra konstruksi skala nasional.',
        author: 'Klien dari Mega Baja' }
    ],
    klien: [
      { name: 'Ciputra',           icon: 'fa-building' },
      { name: 'Mega Baja',         icon: 'fa-industry' },
      { name: 'Arna',              icon: 'fa-cubes' },
      { name: 'Sandimas',          icon: 'fa-toilet' },
      { name: 'Wika',              icon: 'fa-dragon' },
      { name: 'PSS',               icon: 'fa-handshake' },
      { name: 'Karya Inti Bangsa', icon: 'fa-hard-hat' }
    ]
  };

  // ---------- Schema Form per Collection ----------
  const SCHEMAS = {
    galeri: {
      label: 'Proyek',
      fields: [
        { name: 'title', label: 'Judul Proyek', type: 'text', required: true },
        { name: 'desc', label: 'Deskripsi', type: 'textarea', required: true },
        { name: 'tag', label: 'Kategori', type: 'text', required: true,
          placeholder: 'Residensial / Desain / Desain Interior' },
        { name: 'images', label: 'URL Gambar (satu per baris)', type: 'textarea', required: true,
          help: 'Contoh: IMG-20260709-WA0028.jpg — untuk kolase, isi lebih dari 1 baris' }
      ]
    },
    testimonial: {
      label: 'Testimoni',
      fields: [
        { name: 'text', label: 'Isi Testimoni', type: 'textarea', required: true },
        { name: 'author', label: 'Penulis', type: 'text', required: true,
          placeholder: 'Nama / Jabatan / Perusahaan' }
      ]
    },
    klien: {
      label: 'Klien',
      fields: [
        { name: 'name', label: 'Nama Klien / Mitra', type: 'text', required: true },
        { name: 'icon', label: 'Ikon FontAwesome', type: 'text', required: true,
          placeholder: 'fa-building / fa-industry / fa-handshake',
          help: 'Lihat daftar ikon di fontawesome.com/icons' }
      ]
    }
  };

  // ---------- Toast ----------
  function showToast(msg, type) {
    toast.textContent = msg;
    toast.className = 'toast ' + (type || '') + ' show';
    setTimeout(function () { toast.classList.remove('show'); }, 3000);
  }

  // ---------- Toggle Password Visibility ----------
  function initPasswordToggle() {
    const toggleBtn = document.getElementById('togglePassword');
    const toggleIcon = document.getElementById('togglePasswordIcon');
    const passwordInput = document.getElementById('loginPassword');

    if (!toggleBtn || !toggleIcon || !passwordInput) return;

    toggleBtn.addEventListener('click', function () {
      const isPassword = passwordInput.type === 'password';

      passwordInput.type = isPassword ? 'text' : 'password';
      toggleIcon.classList.toggle('fa-eye', !isPassword);
      toggleIcon.classList.toggle('fa-eye-slash', isPassword);
      toggleBtn.setAttribute('aria-label', isPassword ? 'Sembunyikan password' : 'Tampilkan password');
      toggleBtn.classList.toggle('is-visible', isPassword);

      passwordInput.focus();
    });
  }

  function resetPasswordToggle() {
    const input = document.getElementById('loginPassword');
    const icon = document.getElementById('togglePasswordIcon');
    const btn = document.getElementById('togglePassword');

    if (input) input.type = 'password';
    if (icon) {
      icon.classList.add('fa-eye');
      icon.classList.remove('fa-eye-slash');
    }
    if (btn) {
      btn.setAttribute('aria-label', 'Tampilkan password');
      btn.classList.remove('is-visible');
    }
  }

  // ---------- Login ----------
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPassword').value;

    loginBtn.disabled = true;
    loginBtn.innerHTML = 'Memproses... <i class="fas fa-spinner fa-spin"></i>';
    loginError.textContent = '';

    auth.signInWithEmailAndPassword(email, pass)
      .then(function () {
        loginForm.reset();
        resetPasswordToggle();
      })
      .catch(function (err) {
        console.error('[Login] Error code:', err.code, err.message);
        loginError.textContent = translateAuthError(err);
      })
      .finally(function () {
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'Masuk <i class="fas fa-sign-in-alt"></i>';
      });
  });

  // ---------- Logout ----------
  logoutBtn.addEventListener('click', function () {
    if (confirm('Yakin ingin keluar?')) auth.signOut();
  });

  // ---------- Auth State ----------
  auth.onAuthStateChanged(function (user) {
    if (user) {
      loginScreen.classList.add('hidden');
      dashboard.classList.remove('hidden');
      adminEmail.textContent = user.email;
      loadAll();
    } else {
      detachAllListeners();
      dashboard.classList.add('hidden');
      loginScreen.classList.remove('hidden');
    }
  });

  // ---------- Tab Switching ----------
  document.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const tab = this.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
      document.querySelectorAll('.tab-content').forEach(function (c) { c.classList.remove('active'); });
      this.classList.add('active');
      document.getElementById('tab-' + tab).classList.add('active');
    });
  });

  // ---------- Real-Time Loaders ----------
  function loadAll() {
    ['galeri', 'testimonial', 'klien', 'pesan'].forEach(loadCollection);
  }

  function loadCollection(name) {
    const listEl = document.getElementById('list-' + name);
    listEl.innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i> Memuat...</div>';

    let colRef = db.collection(name);
    if (name === 'pesan') {
      colRef = db.collection('pilarjayakontruksi').orderBy('createdAt', 'desc');
    }

    const unsub = colRef.onSnapshot(
      function (snap) {
        const items = [];
        snap.forEach(function (doc) {
          items.push(Object.assign({ _id: doc.id }, doc.data()));
        });
        cache[name] = items;
        renderList(name, items);
      },
      function (err) {
        console.error('Gagal load ' + name + ':', err);
        listEl.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i> ' +
                           'Gagal memuat data.<br><small>' + esc(err.message) + '</small></div>';
      }
    );

    unsubscribers.push(unsub);
  }

  function detachAllListeners() {
    unsubscribers.forEach(function (unsub) {
      try { unsub(); } catch (e) {}
    });
    unsubscribers = [];
  }

  // ---------- Render List ----------
  function renderList(name, items) {
    const listEl = document.getElementById('list-' + name);

    if (!items.length) {
      listEl.innerHTML = renderEmptyState(name);
      return;
    }

    listEl.innerHTML = items.map(function (item) {
      if (name === 'galeri')      return renderGaleriItem(item);
      if (name === 'testimonial') return renderTestimonialItem(item);
      if (name === 'klien')       return renderKlienItem(item);
      if (name === 'pesan')       return renderPesanItem(item);
      return '';
    }).join('');
  }

  function renderGaleriItem(item) {
    const firstImg = (item.images && item.images[0]) || '';
    const thumb = firstImg
      ? '<img src="' + esc(firstImg) + '" alt="" ' +
        'onerror="this.style.display=\'none\';this.parentNode.innerHTML=\'<div class=&quot;icon-fallback&quot;><i class=&quot;fas fa-image&quot;></i></div>\'">'
      : '<div class="icon-fallback"><i class="fas fa-image"></i></div>';

    return '' +
      '<div class="item-card">' +
        '<div class="item-thumb">' + thumb + '</div>' +
        '<div class="item-body">' +
          '<h4>' + esc(item.title || '-') + '</h4>' +
          '<p>' + esc(item.desc || '') + '</p>' +
          '<span class="item-tag">' + esc(item.tag || '') + '</span>' +
        '</div>' +
        '<div class="item-actions">' +
          '<button class="icon-btn" data-edit="galeri" data-id="' + item._id + '" title="Edit"><i class="fas fa-edit"></i></button>' +
          '<button class="icon-btn danger" data-del="galeri" data-id="' + item._id + '" title="Hapus"><i class="fas fa-trash"></i></button>' +
        '</div>' +
      '</div>';
  }

  function renderTestimonialItem(item) {
    return '' +
      '<div class="item-card">' +
        '<div class="item-thumb"><div class="icon-fallback"><i class="fas fa-quote-left"></i></div></div>' +
        '<div class="item-body">' +
          '<p style="white-space:normal;-webkit-line-clamp:3;">"' + esc(item.text || '') + '"</p>' +
          '<span class="item-tag">' + esc(item.author || '') + '</span>' +
        '</div>' +
        '<div class="item-actions">' +
          '<button class="icon-btn" data-edit="testimonial" data-id="' + item._id + '" title="Edit"><i class="fas fa-edit"></i></button>' +
          '<button class="icon-btn danger" data-del="testimonial" data-id="' + item._id + '" title="Hapus"><i class="fas fa-trash"></i></button>' +
        '</div>' +
      '</div>';
  }

  function renderKlienItem(item) {
    return '' +
      '<div class="item-card">' +
        '<div class="item-thumb"><div class="icon-fallback">' +
          '<i class="fas ' + esc(item.icon || 'fa-building') + '"></i>' +
        '</div></div>' +
        '<div class="item-body">' +
          '<h4>' + esc(item.name || '-') + '</h4>' +
          '<p>' + esc(item.icon || '') + '</p>' +
        '</div>' +
        '<div class="item-actions">' +
          '<button class="icon-btn" data-edit="klien" data-id="' + item._id + '" title="Edit"><i class="fas fa-edit"></i></button>' +
          '<button class="icon-btn danger" data-del="klien" data-id="' + item._id + '" title="Hapus"><i class="fas fa-trash"></i></button>' +
        '</div>' +
      '</div>';
  }

  function renderPesanItem(item) {
    const tgl = item.createdAt && item.createdAt.toDate
      ? item.createdAt.toDate().toLocaleString('id-ID')
      : '(baru)';
    const isKontak = item.type === 'kontak';
    const title = isKontak ? (item.subjek || '(tanpa subjek)') : 'Konsultasi Gratis';
    const detail = isKontak
      ? 'Dari: ' + esc(item.nama || '-') + ' &middot; ' + esc(item.email || '-')
      : 'Email: ' + esc(item.email || '-');
    const msg = isKontak ? esc(item.pesan || '') : 'Klien minta dihubungi kembali.';
    const icon = isKontak ? 'fa-envelope' : 'fa-headset';

    return '' +
      '<div class="item-card">' +
        '<div class="item-thumb"><div class="icon-fallback"><i class="fas ' + icon + '"></i></div></div>' +
        '<div class="item-body">' +
          '<h4>' + esc(title) + '</h4>' +
          '<p style="font-size:.8rem;color:#888;">' + detail + ' &middot; ' + tgl + '</p>' +
          '<p style="white-space:normal;-webkit-line-clamp:3;">' + msg + '</p>' +
        '</div>' +
        '<div class="item-actions">' +
          '<button class="icon-btn danger" data-del="pesan" data-id="' + item._id + '" title="Hapus"><i class="fas fa-trash"></i></button>' +
        '</div>' +
      '</div>';
  }

  function renderEmptyState(name) {
    const seed = SEED_DATA[name];
    let html = '<div class="empty-state">';
    html += '<i class="fas fa-inbox"></i><br>Belum ada data.';

    if (seed && seed.length) {
      html +=
        '<div style="margin-top:1.2rem;">' +
          '<button class="btn btn-primary" data-import="' + name + '">' +
            '<i class="fas fa-download"></i> Import ' + seed.length + ' Data Contoh' +
          '</button>' +
          '<p class="help-text" style="margin-top:.8rem;">Atau klik "Tambah" untuk membuat dari nol.</p>' +
        '</div>';
    }

    html += '</div>';
    return html;
  }

  // ---------- Import Seed Data ----------
  function importSeedData(collectionName, onDone) {
    const items = SEED_DATA[collectionName] || [];
    if (!items.length) { onDone && onDone(0); return; }

    const batch = db.batch();
    items.forEach(function (item) {
      const ref = db.collection(collectionName).doc();
      batch.set(ref, Object.assign({}, item, {
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }));
    });

    batch.commit()
      .then(function () { onDone && onDone(items.length); })
      .catch(function (err) {
        showToast('Gagal import: ' + err.message, 'error');
      });
  }

  // ---------- Event Delegation (Add / Edit / Delete / Import) ----------
  document.addEventListener('click', function (e) {
    const addBtn = e.target.closest('[data-add]');
    const editBtn = e.target.closest('[data-edit]');
    const delBtn = e.target.closest('[data-del]');
    const importBtn = e.target.closest('[data-import]');

    if (addBtn) {
      openModal(addBtn.dataset.add, null);
      return;
    }

    if (editBtn) {
      const col = editBtn.dataset.edit;
      const item = (cache[col] || []).find(function (x) { return x._id === editBtn.dataset.id; });
      if (item) openModal(col, item);
      return;
    }

    if (delBtn) {
      if (!confirm('Yakin ingin menghapus item ini? Tindakan ini tidak bisa dibatalkan.')) return;
      const col = delBtn.dataset.del;
      const id = delBtn.dataset.id;
      const collection = col === 'pesan' ? 'pilarjayakontruksi' : col;

      db.collection(collection).doc(id).delete()
        .then(function () { showToast('Berhasil dihapus.', 'success'); })
        .catch(function (err) { showToast('Gagal hapus: ' + err.message, 'error'); });
      return;
    }

    if (importBtn) {
      const col = importBtn.dataset.import;
      const count = (SEED_DATA[col] || []).length;
      if (!confirm('Import ' + count + ' data contoh ke collection "' + col + '"?\n\n' +
                   'Data akan ditambahkan ke database dan bisa diedit/dihapus.')) return;

      importBtn.disabled = true;
      importBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengimport...';

      importSeedData(col, function (n) {
        showToast(n + ' data berhasil diimport.', 'success');
      });
    }
  });

  // ---------- Modal ----------
  function openModal(collection, item) {
    currentEdit.collection = collection;
    currentEdit.id = item ? item._id : null;
    modalTitle.textContent = (item ? 'Edit ' : 'Tambah ') + SCHEMAS[collection].label;

    modalBody.innerHTML = SCHEMAS[collection].fields.map(function (f) {
      const val = item
        ? (f.name === 'images' ? (item.images || []).join('\n') : (item[f.name] || ''))
        : '';
      const help = f.help ? '<p class="help-text">' + f.help + '</p>' : '';
      const req = f.required ? ' required' : '';
      const reqMark = f.required ? ' *' : '';

      if (f.type === 'textarea') {
        return '<div class="form-group">' +
                 '<label>' + f.label + reqMark + '</label>' +
                 '<textarea name="' + f.name + '"' + req +
                 ' placeholder="' + (f.placeholder || '') + '">' + esc(val) + '</textarea>' +
                 help +
               '</div>';
      }
      return '<div class="form-group">' +
               '<label>' + f.label + reqMark + '</label>' +
               '<input type="text" name="' + f.name + '" value="' + esc(val) + '"' + req +
               ' placeholder="' + (f.placeholder || '') + '" />' +
               help +
             '</div>';
    }).join('');

    modal.classList.add('active');
  }

  function closeModal() {
    modal.classList.remove('active');
    modalForm.reset();
    currentEdit = { collection: null, id: null };
  }

  modalClose.addEventListener('click', closeModal);
  modalCancel.addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  // ---------- Submit Modal ----------
  modalForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const collection = currentEdit.collection;
    if (!collection) return;

    const data = {};
    SCHEMAS[collection].fields.forEach(function (f) {
      const el = modalForm.querySelector('[name="' + f.name + '"]');
      if (!el) return;
      let v = el.value.trim();
      if (f.name === 'images') {
        v = v.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
      }
      data[f.name] = v;
    });

    modalSave.disabled = true;
    modalSave.innerHTML = 'Menyimpan... <i class="fas fa-spinner fa-spin"></i>';

    let op;
    if (currentEdit.id) {
      op = db.collection(collection).doc(currentEdit.id).update(data);
    } else {
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      op = db.collection(collection).add(data);
    }

    op.then(function () {
      showToast('Berhasil disimpan.', 'success');
      closeModal();
    })
    .catch(function (err) {
      showToast('Gagal: ' + err.message, 'error');
    })
    .finally(function () {
      modalSave.disabled = false;
      modalSave.innerHTML = 'Simpan';
    });
  });

  // ---------- Utilities ----------
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function translateAuthError(err) {
    switch (err.code) {
      case 'auth/user-not-found':
        return 'Email tidak terdaftar di sistem.';
      case 'auth/wrong-password':
        return 'Password salah.';
      case 'auth/invalid-credential':
        return 'Email atau password salah.';
      case 'auth/too-many-requests':
        return 'Terlalu banyak percobaan. Tunggu 15 menit.';
      case 'auth/invalid-email':
        return 'Format email tidak valid.';
      case 'auth/network-request-failed':
        return 'Koneksi internet bermasalah.';
      case 'auth/operation-not-allowed':
        return 'Login email/password belum aktif di server.';
      default:
        return 'Login gagal: ' + (err.message || 'Unknown error');
    }
  }

  // ---------- Init ----------
  initPasswordToggle();

})();
/* Admin Dashboard — PT Pilar Jaya Kontruksi */
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

  // Referensi elemen
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

  // State
  let currentEdit = { collection: null, id: null };
  let cache = { galeri: [], testimonial: [], klien: [], pesan: [] };

  // Skema field per collection
  const SCHEMAS = {
    galeri: {
      label: 'Proyek',
      fields: [
        { name: 'title', label: 'Judul Proyek', type: 'text', required: true },
        { name: 'desc', label: 'Deskripsi', type: 'textarea', required: true },
        { name: 'tag', label: 'Kategori', type: 'text', required: true, placeholder: 'Residensial / Desain / Desain Interior' },
        { name: 'images', label: 'URL Gambar (satu per baris)', type: 'textarea', required: true,
          help: 'Contoh: IMG-20260709-WA0028.jpg — untuk kolase, isi lebih dari 1 baris' }
      ]
    },
    testimonial: {
      label: 'Testimoni',
      fields: [
        { name: 'text', label: 'Isi Testimoni', type: 'textarea', required: true },
        { name: 'author', label: 'Penulis', type: 'text', required: true, placeholder: 'Nama / Jabatan / Perusahaan' }
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
      })
      .catch(function (err) {
        console.error(err);
        let msg = 'Login gagal.';
        if (err.code === 'auth/user-not-found') msg = 'Email tidak terdaftar.';
        else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') msg = 'Password salah.';
        else if (err.code === 'auth/too-many-requests') msg = 'Terlalu banyak percobaan. Coba lagi nanti.';
        else if (err.code === 'auth/invalid-email') msg = 'Format email tidak valid.';
        loginError.textContent = msg;
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

  // ---------- Auth state ----------
  auth.onAuthStateChanged(function (user) {
    if (user) {
      loginScreen.classList.add('hidden');
      dashboard.classList.remove('hidden');
      adminEmail.textContent = user.email;
      loadAll();
    } else {
      dashboard.classList.add('hidden');
      loginScreen.classList.remove('hidden');
    }
  });

  // ---------- Tab switching ----------
  document.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const tab = this.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
      document.querySelectorAll('.tab-content').forEach(function (c) { c.classList.remove('active'); });
      this.classList.add('active');
      document.getElementById('tab-' + tab).classList.add('active');
    });
  });

  // ---------- Load data ----------
  function loadAll() {
    ['galeri', 'testimonial', 'klien', 'pesan'].forEach(loadCollection);
  }

  function loadCollection(name) {
    const listEl = document.getElementById('list-' + name);
    listEl.innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i> Memuat...</div>';

    let query = db.collection(name);
    if (name === 'pesan') {
      query = db.collection('pilarjayakontruksi').orderBy('createdAt', 'desc');
    }

    query.get()
      .then(function (snap) {
        const items = [];
        snap.forEach(function (doc) {
          items.push(Object.assign({ _id: doc.id }, doc.data()));
        });
        cache[name] = items;
        renderList(name, items);
      })
      .catch(function (err) {
        console.error('Gagal load ' + name + ':', err);
        listEl.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i> Gagal memuat data.<br><small>' + err.message + '</small></div>';
      });
  }

  // ---------- Render list ----------
  function renderList(name, items) {
    const listEl = document.getElementById('list-' + name);
    if (!items.length) {
      listEl.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><br>Belum ada data. Klik tombol "Tambah" untuk mulai.</div>';
      return;
    }

    const html = items.map(function (item) {
      if (name === 'galeri') {
        const firstImg = (item.images && item.images[0]) || '';
        return '' +
          '<div class="item-card">' +
            '<div class="item-thumb">' +
              (firstImg ? '<img src="' + esc(firstImg) + '" alt="" onerror="this.style.display=\'none\';this.parentNode.innerHTML=\'<div class=&quot;icon-fallback&quot;><i class=&quot;fas fa-image&quot;></i></div>\'">' : '<div class="icon-fallback"><i class="fas fa-image"></i></div>') +
            '</div>' +
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

      if (name === 'testimonial') {
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

      if (name === 'klien') {
        return '' +
          '<div class="item-card">' +
            '<div class="item-thumb"><div class="icon-fallback"><i class="fas ' + esc(item.icon || 'fa-building') + '"></i></div></div>' +
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

      if (name === 'pesan') {
        const tgl = item.createdAt && item.createdAt.toDate
          ? item.createdAt.toDate().toLocaleString('id-ID')
          : '(baru)';
        const isKontak = item.type === 'kontak';
        const title = isKontak ? (item.subjek || '(tanpa subjek)') : 'Konsultasi Gratis';
        const detail = isKontak
          ? 'Dari: ' + esc(item.nama || '-') + ' &middot; ' + esc(item.email || '-')
          : 'Email: ' + esc(item.email || '-');
        const msg = isKontak ? esc(item.pesan || '') : 'Klien minta dihubungi kembali.';

        return '' +
          '<div class="item-card">' +
            '<div class="item-thumb"><div class="icon-fallback"><i class="fas ' + (isKontak ? 'fa-envelope' : 'fa-headset') + '"></i></div></div>' +
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

      return '';
    }).join('');

    listEl.innerHTML = html;
  }

  // ---------- Event delegation: edit & delete ----------
  document.addEventListener('click', function (e) {
    const editBtn = e.target.closest('[data-edit]');
    const delBtn = e.target.closest('[data-del]');
    const addBtn = e.target.closest('[data-add]');

    if (addBtn) { openModal(addBtn.dataset.add, null); }
    if (editBtn) {
      const item = cache[editBtn.dataset.edit].find(function (x) { return x._id === editBtn.dataset.id; });
      if (item) openModal(editBtn.dataset.edit, item);
    }
    if (delBtn) {
      if (!confirm('Yakin ingin menghapus item ini? Tindakan ini tidak bisa dibatalkan.')) return;
      const col = delBtn.dataset.del;
      const id = delBtn.dataset.id;
      const collection = col === 'pesan' ? 'pilarjayakontruksi' : col;
      db.collection(collection).doc(id).delete()
        .then(function () {
          showToast('Berhasil dihapus.', 'success');
          loadCollection(col);
        })
        .catch(function (err) {
          showToast('Gagal hapus: ' + err.message, 'error');
        });
    }
  });

  // ---------- Modal ----------
  function openModal(collection, item) {
    currentEdit.collection = collection;
    currentEdit.id = item ? item._id : null;
    modalTitle.textContent = (item ? 'Edit ' : 'Tambah ') + SCHEMAS[collection].label;

    const schema = SCHEMAS[collection];
    modalBody.innerHTML = schema.fields.map(function (f) {
      const val = item ? (f.name === 'images' ? (item.images || []).join('\n') : (item[f.name] || '')) : '';
      const help = f.help ? '<p class="help-text">' + f.help + '</p>' : '';

      if (f.type === 'textarea') {
        return '<div class="form-group"><label>' + f.label + (f.required ? ' *' : '') + '</label>' +
               '<textarea name="' + f.name + '"' + (f.required ? ' required' : '') + ' placeholder="' + (f.placeholder || '') + '">' + esc(val) + '</textarea>' + help + '</div>';
      }
      return '<div class="form-group"><label>' + f.label + (f.required ? ' *' : '') + '</label>' +
             '<input type="text" name="' + f.name + '" value="' + esc(val) + '"' + (f.required ? ' required' : '') + ' placeholder="' + (f.placeholder || '') + '" />' + help + '</div>';
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

  // ---------- Submit modal (save) ----------
  modalForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const collection = currentEdit.collection;
    if (!collection) return;

    const schema = SCHEMAS[collection];
    const data = {};
    schema.fields.forEach(function (f) {
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
      loadCollection(collection);
    })
    .catch(function (err) {
      showToast('Gagal: ' + err.message, 'error');
    })
    .finally(function () {
      modalSave.disabled = false;
      modalSave.innerHTML = 'Simpan';
    });
  });

  // ---------- Utility ----------
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

})();
/* PT PILAR JAYA KONTRUKSI — main.js
   Firebase + WhatsApp + Galeri + Lightbox + Form
   Collection: pilarjayakontruksi (form), galeri, testimonial, klien (konten)
*/
document.addEventListener('DOMContentLoaded', function () {

  // Konfigurasi
  const CONFIG = {
    waNumber: '6281578602901',
    companyName: 'PT Pilar Jaya Kontruksi',
    testimonialInterval: 5500,
    backToTopThreshold: 600
  };

  // Firebase config
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBmQ9dNilq-61Goj-BvgvzBtOxgtACohhA",
    authDomain: "pilar-jaya-kontruksi-35d69.firebaseapp.com",
    projectId: "pilar-jaya-kontruksi-35d69",
    storageBucket: "pilar-jaya-kontruksi-35d69.firebasestorage.app",
    messagingSenderId: "995786907146",
    appId: "1:995786907146:web:3eacd77b81fb507c3fc9f3",
    measurementId: "G-8HM1M9KVC4"
  };

  const FORM_COLLECTION = 'pilarjayakontruksi';

  let firebaseApp = null;
  let firebaseAnalytics = null;

  // Init Firebase
  function initFirebase() {
    if (typeof firebase === 'undefined') {
      console.warn('[Firebase] SDK belum dimuat.');
      return null;
    }
    if (firebaseApp) return firebaseApp;
    try {
      firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
      if (typeof firebase.analytics === 'function') {
        firebaseAnalytics = firebase.analytics();
      }
      console.log('[Firebase] Siap.');
    } catch (err) {
      console.error('[Firebase] Init gagal:', err);
    }
    return firebaseApp;
  }

  // Simpan form ke Firestore
  function logToFirestore(data) {
    if (!firebaseApp || !firebase.firestore) return Promise.resolve(false);
    return firebase.firestore()
      .collection(FORM_COLLECTION)
      .add(Object.assign({}, data, {
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        userAgent: navigator.userAgent,
        pageUrl: location.href
      }))
      .then(function () { return true; })
      .catch(function (err) {
        console.error('[Firestore] Gagal menyimpan:', err);
        return false;
      });
  }

  // Analytics
  function trackEvent(name, params) {
    if (!firebaseAnalytics || !firebase.analytics) return;
    try {
      firebase.analytics().logEvent(name, params || {});
    } catch (err) {}
  }

  // Utilitas
  function reducedMotion() {
    return window.matchMedia &&
           window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function openWhatsApp(message) {
    const url = 'https://wa.me/' + CONFIG.waNumber +
                '?text=' + encodeURIComponent(message);
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win) window.location.href = url;
    return !!win;
  }

  // Init Firebase sekarang (setelah semua helper siap)
  initFirebase();

  // ---------- Preloader ----------
  const preloader = document.getElementById('preloader');

  function hidePreloader() {
    if (!preloader || preloader.classList.contains('hide')) return;
    preloader.classList.add('hide');
    setTimeout(function () { preloader.style.display = 'none'; }, 500);
  }

  if (document.readyState === 'complete') {
    setTimeout(hidePreloader, 400);
  } else {
    window.addEventListener('load', function () { setTimeout(hidePreloader, 400); });
  }
  setTimeout(hidePreloader, 4000);

  // ---------- Navbar scroll & back to top ----------
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');

  function onScroll() {
    const scrollY = window.scrollY;
    if (navbar) navbar.classList.toggle('scrolled', scrollY > 50);
    if (backToTop) backToTop.classList.toggle('show', scrollY > CONFIG.backToTopThreshold);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Mobile menu ----------
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');

  function closeMobileMenu() {
    if (navMenu) navMenu.classList.remove('active');
    if (hamburger) {
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  }

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', function () {
      const isOpen = navMenu.classList.toggle('active');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('click', function (e) {
      if (!navMenu.classList.contains('active')) return;
      if (navMenu.contains(e.target) || hamburger.contains(e.target)) return;
      closeMobileMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) closeMobileMenu();
    });
  }

  // ---------- Scroll-spy ----------
  const navLinks = document.querySelectorAll('.nav-link');
  const navSections = Array.prototype.slice
    .call(navLinks)
    .map(function (link) {
      const href = link.getAttribute('href');
      return href && href.charAt(0) === '#' ? document.querySelector(href) : null;
    })
    .filter(Boolean);

  function setActiveLink(id) {
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + id);
    });
  }

  if (navSections.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver(
      function (entries) {
        const visible = entries
          .filter(function (en) { return en.isIntersecting; })
          .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });
        if (visible.length) setActiveLink(visible[0].target.id);
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.25, 0.5, 1] }
    );
    navSections.forEach(function (sec) { spy.observe(sec); });
  }

  // ---------- Stat counter ----------
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');

  function runCounter(el) {
    if (el.dataset.done === 'true') return;
    el.dataset.done = 'true';

    const target = parseInt(el.getAttribute('data-target'), 10) || 0;

    if (reducedMotion()) { el.textContent = target; return; }

    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
  }

  if (statNumbers.length && 'IntersectionObserver' in window) {
    const statObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          runCounter(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );
    statNumbers.forEach(function (n) { statObserver.observe(n); });
  } else {
    statNumbers.forEach(function (n) { n.textContent = n.getAttribute('data-target'); });
  }

  // ---------- Data fallback (tampil jika Firestore kosong / error) ----------
  const FALLBACK = {
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

  // ---------- Render galeri ----------
  const galeriGrid = document.getElementById('galeriGrid');

  function renderGaleri(items) {
    if (!galeriGrid) return;

    if (!items.length) {
      galeriGrid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;padding:2rem;text-align:center;color:#888;">Belum ada proyek untuk ditampilkan.</div>';
      return;
    }

    let html = '';
    items.forEach(function (item, cardIndex) {
      const imgs = item.images || [];
      const safeTitle = escapeHtml(item.title);
      const safeDesc = escapeHtml(item.desc);
      const safeTag = escapeHtml(item.tag);

      if (imgs.length > 1) {
        let gridClass = 'collage-grid';
        if (imgs.length >= 4) gridClass += ' collage-grid-4';
        else if (imgs.length === 3) gridClass += ' collage-grid-3';
        else if (imgs.length === 2) gridClass += ' collage-grid-2';

        html +=
          '<div class="galeri-item collage-item" data-card="' + cardIndex + '">' +
            '<div class="galeri-image ' + gridClass + '">' +
              imgs.map(function (src, i) {
                return '<img src="' + src + '" alt="' + safeTitle + ' - foto ' + (i + 1) +
                       '" loading="lazy" data-photo="' + i + '">';
              }).join('') +
              '<div class="galeri-overlay" aria-hidden="true"><i class="fas fa-search-plus"></i></div>' +
            '</div>' +
            '<div class="galeri-info">' +
              '<h4>' + safeTitle + '</h4>' +
              '<p>' + safeDesc + '</p>' +
              '<span class="galeri-tag">' + safeTag + '</span>' +
            '</div>' +
          '</div>';
      } else {
        const src = imgs[0] || '';
        html +=
          '<div class="galeri-item" data-card="' + cardIndex + '">' +
            '<div class="galeri-image">' +
              '<img src="' + src + '" alt="' + safeTitle + '" loading="lazy" data-photo="0">' +
              '<div class="galeri-overlay" aria-hidden="true"><i class="fas fa-search-plus"></i></div>' +
            '</div>' +
            '<div class="galeri-info">' +
              '<h4>' + safeTitle + '</h4>' +
              '<p>' + safeDesc + '</p>' +
              '<span class="galeri-tag">' + safeTag + '</span>' +
            '</div>' +
          '</div>';
      }
    });

    galeriGrid.innerHTML = html;
    attachGaleriLightbox(items);
  }

  function attachGaleriLightbox(items) {
    if (!galeriGrid) return;

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');
    let lastFocused = null;

    function openLightbox(src, title, desc) {
      if (!lightbox || !lightboxImg) return;
      lastFocused = document.activeElement;
      lightboxImg.src = src;
      lightboxImg.alt = title || '';
      if (lightboxCaption) {
        lightboxCaption.innerHTML = '<strong>' + escapeHtml(title) + '</strong>' +
                                    (desc ? '<br>' + escapeHtml(desc) : '');
      }
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      if (lightboxImg) lightboxImg.src = '';
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    galeriGrid.querySelectorAll('.galeri-item').forEach(function (card) {
      const wrap = card.querySelector('.galeri-image');
      if (!wrap) return;
      wrap.addEventListener('click', function (e) {
        const idx = parseInt(card.dataset.card, 10) || 0;
        const item = items[idx];
        if (!item) return;
        const clicked = e.target.closest('img');
        const photoIdx = clicked ? (parseInt(clicked.dataset.photo, 10) || 0) : 0;
        const imgs = item.images || [];
        const src = imgs.length > 1 ? imgs[photoIdx] : imgs[0];
        if (!src) return;
        openLightbox(src, item.title, item.desc);
        trackEvent('view_gallery_item', { item_title: item.title, item_tag: item.tag });
      });
    });

    if (lightboxClose) lightboxClose.onclick = closeLightbox;
    if (lightbox) {
      lightbox.onclick = function (e) {
        if (e.target === lightbox) closeLightbox();
      };
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

  // ---------- Render testimoni ----------
  function renderTestimonial(items) {
    const slider = document.getElementById('testimonialSlider');
    const dotsWrap = document.getElementById('testimonialDots');
    if (!slider || !dotsWrap) return;

    if (!items.length) {
      slider.innerHTML = '';
      dotsWrap.innerHTML = '';
      return;
    }

    slider.innerHTML = items.map(function (t, i) {
      return '<div class="testimonial-slide' + (i === 0 ? ' active' : '') + '">' +
        '<i class="fas fa-quote-left"></i>' +
        '<p>"' + escapeHtml(t.text) + '"</p>' +
        '<strong>— ' + escapeHtml(t.author) + '</strong>' +
      '</div>';
    }).join('');

    dotsWrap.innerHTML = items.map(function (t, i) {
      return '<span class="dot' + (i === 0 ? ' active' : '') + '" data-index="' + i +
             '" role="button" tabindex="0" aria-label="Testimoni ' + (i + 1) + '"></span>';
    }).join('');

    const slides = slider.querySelectorAll('.testimonial-slide');
    const dots = dotsWrap.querySelectorAll('.dot');
    let cur = 0;
    let timer = null;

    function show(i) {
      slides.forEach(function (s) { s.classList.remove('active'); });
      dots.forEach(function (d) { d.classList.remove('active'); });
      cur = (i + slides.length) % slides.length;
      slides[cur].classList.add('active');
      if (dots[cur]) dots[cur].classList.add('active');
    }

    function start() {
      stop();
      if (reducedMotion() || slides.length < 2) return;
      timer = setInterval(function () { show(cur + 1); }, CONFIG.testimonialInterval);
    }

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    dots.forEach(function (d) {
      d.addEventListener('click', function () {
        show(parseInt(this.dataset.index, 10) || 0);
        start();
      });
      d.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          show(parseInt(this.dataset.index, 10) || 0);
          start();
        }
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    slider.addEventListener('focusin', stop);
    slider.addEventListener('focusout', start);

    let touchStartX = 0;
    slider.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].clientX;
      stop();
    }, { passive: true });

    slider.addEventListener('touchend', function (e) {
      const delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 50) show(cur + (delta < 0 ? 1 : -1));
      start();
    }, { passive: true });

    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start();
    });

    start();
  }

  // ---------- Render klien ----------
  function renderKlien(items) {
    const grid = document.querySelector('.klien-grid');
    if (!grid) return;
    if (!items.length) { grid.innerHTML = ''; return; }
    grid.innerHTML = items.map(function (k) {
      return '<div class="klien-item"><i class="fas ' + escapeHtml(k.icon || 'fa-building') +
             '"></i> <br /> ' + escapeHtml(k.name) + '</div>';
    }).join('');
  }

  // ---------- Fetch konten dari Firestore + fallback ----------
  function loadDynamicContent() {
    // Kalau Firestore tidak tersedia, pakai fallback
    if (!firebaseApp || !firebase.firestore) {
      console.warn('[Firestore] Tidak tersedia — pakai data fallback.');
      renderGaleri(FALLBACK.galeri);
      renderTestimonial(FALLBACK.testimonial);
      renderKlien(FALLBACK.klien);
      return;
    }

    const db = firebase.firestore();

    db.collection('galeri').get()
      .then(function (snap) {
        const arr = [];
        snap.forEach(function (d) { arr.push(d.data()); });
        renderGaleri(arr.length ? arr : FALLBACK.galeri);
      })
      .catch(function (err) {
        console.warn('[Firestore] galeri gagal:', err);
        renderGaleri(FALLBACK.galeri);
      });

    db.collection('testimonial').get()
      .then(function (snap) {
        const arr = [];
        snap.forEach(function (d) { arr.push(d.data()); });
        renderTestimonial(arr.length ? arr : FALLBACK.testimonial);
      })
      .catch(function (err) {
        console.warn('[Firestore] testimonial gagal:', err);
        renderTestimonial(FALLBACK.testimonial);
      });

    db.collection('klien').get()
      .then(function (snap) {
        const arr = [];
        snap.forEach(function (d) { arr.push(d.data()); });
        renderKlien(arr.length ? arr : FALLBACK.klien);
      })
      .catch(function (err) {
        console.warn('[Firestore] klien gagal:', err);
        renderKlien(FALLBACK.klien);
      });
  }

  loadDynamicContent();

  // ---------- Form kontak → WhatsApp + Firestore ----------
  const kontakForm = document.getElementById('kontakForm');

  if (kontakForm) {
    kontakForm.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!kontakForm.checkValidity()) {
        kontakForm.reportValidity();
        return;
      }

      const data = {
        type: 'kontak',
        nama:   (document.getElementById('nama')   || {}).value ? document.getElementById('nama').value.trim()   : '',
        email:  (document.getElementById('email')  || {}).value ? document.getElementById('email').value.trim()  : '',
        subjek: (document.getElementById('subjek') || {}).value ? document.getElementById('subjek').value.trim() : '',
        pesan:  (document.getElementById('pesan')  || {}).value ? document.getElementById('pesan').value.trim()  : ''
      };

      logToFirestore(data);
      trackEvent('submit_contact_form', { subject: data.subjek });

      const waMessage =
        'Halo ' + CONFIG.companyName + ',\n\n' +
        'Saya ingin menghubungi Anda melalui website.\n\n' +
        '*Nama:* ' + data.nama + '\n' +
        '*Email:* ' + data.email + '\n' +
        '*Subjek:* ' + data.subjek + '\n\n' +
        '*Pesan:*\n' + data.pesan + '\n\n' +
        'Terima kasih.';

      const btn = kontakForm.querySelector('button[type="submit"]');
      const originalHtml = btn ? btn.innerHTML : '';
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = 'Membuka WhatsApp... <i class="fas fa-spinner fa-spin"></i>';
      }

      setTimeout(function () {
        openWhatsApp(waMessage);
        kontakForm.reset();
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = originalHtml;
        }

        const successMsg = document.getElementById('formSuccess');
        if (successMsg) {
          successMsg.textContent =
            'Terima kasih! WhatsApp akan terbuka dengan pesan Anda. ' +
            'Jika tidak terbuka otomatis, silakan hubungi kami langsung di 0815-7860-2901.';
          successMsg.style.display = 'block';
          setTimeout(function () { successMsg.style.display = 'none'; }, 8000);
        }
      }, 400);
    });
  }

  // ---------- Konsultasi gratis → WhatsApp + Firestore ----------
  const newsletterForm = document.getElementById('newsletterForm');

  if (newsletterForm) {
    const newsletterInput = newsletterForm.querySelector('input[type="email"]');
    const defaultPlaceholder = newsletterInput
      ? newsletterInput.getAttribute('placeholder') || 'Email Anda'
      : 'Email Anda';

    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!newsletterInput) return;

      const email = newsletterInput.value.trim();
      if (!email) { newsletterInput.focus(); return; }

      logToFirestore({ type: 'konsultasi', email: email });
      trackEvent('submit_consultation', { email: email });

      const waMessage =
        'Halo ' + CONFIG.companyName + ',\n\n' +
        'Saya ingin minta *konsultasi gratis* untuk proyek saya.\n\n' +
        '*Email saya:* ' + email + '\n\n' +
        'Mohon dihubungi kembali. Terima kasih.';

      const btn = newsletterForm.querySelector('button[type="submit"]');
      const originalHtml = btn ? btn.innerHTML : '';
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      }

      setTimeout(function () {
        openWhatsApp(waMessage);
        newsletterInput.value = '';
        newsletterInput.placeholder = 'Terima kasih! WhatsApp akan terbuka...';
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = originalHtml;
        }
        setTimeout(function () {
          newsletterInput.placeholder = defaultPlaceholder;
        }, 4500);
      }, 300);
    });
  }

  // ---------- Back to top ----------
  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: reducedMotion() ? 'auto' : 'smooth'
      });
    });
  }

  // ---------- Page view ----------
  trackEvent('page_view', {
    page_title: document.title,
    page_location: location.href
  });

});
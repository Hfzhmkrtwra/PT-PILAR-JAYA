document.addEventListener('DOMContentLoaded', function() {
  
  // 1. PRELOADER
  window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    preloader.classList.add('hide');
    setTimeout(function() {
      preloader.style.display = 'none';
    }, 500);
  });
  
  // 2. NAVBAR SCROLL EFFECT & BACK TO TOP
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');
  
  window.addEventListener('scroll', function() {
    const scrollY = window.scrollY;
    navbar.classList.toggle('scrolled', scrollY > 50);
    backToTop.classList.toggle('show', scrollY > 600);
  });
  
  // 3. MOBILE MENU
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  
  hamburger.addEventListener('click', function() {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
  });
  
  document.querySelectorAll('.nav-link').forEach(function(link) {
    link.addEventListener('click', function() {
      navMenu.classList.remove('active');
      hamburger.classList.remove('active');
    });
  });
  
  // 4. STAT COUNTER
  const statNumbers = document.querySelectorAll('.stat-number');
  const observerOptions = { threshold: 0.5 };
  
  const statObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'), 10);
        let count = 0;
        const speed = target / 50;
        
        function updateCount() {
          if (count < target) {
            count += speed;
            el.innerText = Math.ceil(count);
            requestAnimationFrame(updateCount);
          } else {
            el.innerText = target;
          }
        }
        
        updateCount();
        statObserver.unobserve(el);
      }
    });
  }, observerOptions);
  
  statNumbers.forEach(function(num) {
    statObserver.observe(num);
  });
  
  // 5. TESTIMONIAL SLIDER
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.testimonial-dots .dot');
  let currentSlide = 0;
  
  function showSlide(index) {
    slides.forEach(function(slide) {
      slide.classList.remove('active');
    });
    dots.forEach(function(dot) {
      dot.classList.remove('active');
    });
    
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    currentSlide = index;
  }
  
  dots.forEach(function(dot) {
    dot.addEventListener('click', function() {
      const index = parseInt(this.dataset.index, 10);
      showSlide(index);
    });
  });
  
  setInterval(function() {
    const next = (currentSlide + 1) % slides.length;
    showSlide(next);
  }, 5000);
  
  // 6. GALERI – RENDER & LIGHTBOX (dengan dukungan kolase)
  const galeriData = [
    // --- Proyek Residensial ---
    {
      img: 'IMG-20260709-WA0028.jpg',
      fallback: 'IMG-20260709-WA0028.jpg',
      title: 'Bukit Permai Extension Tipe 66',
      desc: 'Proyek extension rumah tipe 66 di Cluster Bukit Permai, Citra Indah City, Jonggol.',
      tag: 'Residensial'
    },
    {
      img: 'IMG-20260709-WA0058.jpg',
      fallback: 'IMG-20260709-WA0058.jpg',
      title: 'Matoa Tipe 22',
      desc: 'Pembangunan unit rumah tipe 22 di Cluster Matoa, Citra Indah City, Jonggol.',
      tag: 'Residensial'
    },
    {
      img: 'IMG-20260709-WA0013.jpg',
      fallback: 'IMG-20260709-WA0013.jpg',
      title: 'Bukit Freesia Tipe 36',
      desc: 'Proyek perumahan tipe 36 di Cluster Bukit Freesia, Citra Indah City, Jonggol.',
      tag: 'Residensial'
    },
    {
      img: 'IMG-20260709-WA0048.jpg',
      fallback: 'IMG-20260709-WA0048.jpg',
      title: 'Bukit Permai Tipe 89',
      desc: 'Pembangunan dan renovasi rumah tipe 89 di Cluster Bukit Permai.',
      tag: 'Residensial'
    },
    {
      img: 'IMG-20260709-WA0034.jpg',
      fallback: 'IMG-20260709-WA0034.jpg',
      title: 'Bukit Freesia Tipe 47 & 39',
      desc: 'Proyek pembangunan cluster besar tipe 47 dan 39 di Bukit Freesia yang telah selesai.',
      tag: 'Residensial'
    },
    
    // --- Desain (single image) ---
    {
      img: 'IMG-20260709-WA0111.jpg',
      fallback: 'IMG-20260709-WA0111.jpg',
      title: 'Rumah Cream Dormitory.',
      desc: 'Gambar desain 3D, rumah cream dormitory - Tanggerang.',
      tag: 'Desain'
    },
    {
      img: 'IMG-20260709-WA0114.jpg',
      fallback: 'IMG-20260709-WA0114.jpg',
      title: 'Bani Hafidz Center',
      desc: 'Gambar desain 3D, bani hafidz center - Subang.',
      tag: 'Desain'
    },
    {
      img: 'IMG-20260709-WA0112.jpg',
      fallback: 'IMG-20260709-WA0112.jpg',
      title: 'Sentul Edu Center & Residence',
      desc: 'Gambar desain 3D, sentul edu center & residence.',
      tag: 'Desain'
    },
    {
      img: 'IMG-20260714-WA0001.jpg',
      fallback: 'IMG-20260714-WA0001.jpg',
      title: 'Apartemen Ketapang',
      desc: 'Gambar desain 3D, apartemen ketapang.',
      tag: 'Desain'
    },
    
    // --- KOLASE 1 (3 gambar) ---
    {
      isCollage: true,
      images: [
        'IMG-20260709-WA0155.jpg',
        'IMG-20260709-WA0154.jpg',
        'IMG-20260709-WA0153.jpg'
      ],
      fallback: 'IMG-20260709-WA0155.jpg',
      title: 'Taman',
      desc: 'Desain outdoor menghadirkan lingkungan yang asri melalui perpaduan material kayu, pepohonan, dan elemen air.',
      tag: 'Desain Interior'
    },
    
    // --- KOLASE 2 (4 gambar - Mushola) ---
    {
      isCollage: true,
      images: [
        'IMG-20260709-WA0133.jpg',
        'IMG-20260709-WA0139.jpg',
        'IMG-20260709-WA0135.jpg',
        'IMG-20260709-WA0138.jpg'
      ],
      fallback: 'IMG-20260709-WA0140.jpg',
      title: 'Mushola',
      desc: 'Mushola dengan desain interior yang estetik, nyaman, dan fungsional untuk tempat ibadah.',
      tag: 'Desain Interior'
    },
    
    // --- KOLASE 3 (2 gambar - Ruang Ganti) ---
    {
      isCollage: true,
      images: [
        'IMG-20260709-WA0136.jpg',
        'IMG-20260709-WA0137.jpg'
      ],
      fallback: 'IMG-20260709-WA0136.jpg',
      title: 'Ruang Ganti',
      desc: 'Ruang ganti ini dirancang dengan konsep minimalis modern yang mengutamakan kenyamanan, kebersihan, dan efisiensi.',
      tag: 'Desain Interior'
    },

    // --- KOLASE 4 (2 gambar - Tambahan Baru) ---
    {
      isCollage: true,
      images: [
        'IMG-20260709-WA0141.jpg',
        'IMG-20260709-WA0144.jpg'
      ],
      fallback: 'IMG-20260709-WA0141.jpg',
      title: 'Ruang Kerja',
      desc: 'Ruang kerja ini mengusung konsep modern minimalis dengan dominasi warna netral seperti putih, abu-abu, hitam, dan aksen kayu terang.',
      tag: 'Desain Interior'
    },
    
    // --- KOLASE 5 (4 gambar - Cafetaria) ---
    {
      isCollage: true,
      images: [
        'IMG-20260709-WA0126.jpg',
        'IMG-20260709-WA0130.jpg',
        'IMG-20260709-WA0131.jpg',
        'IMG-20260709-WA0132.jpg'
      ],
      fallback: 'IMG-20260709-WA0126.jpg',
      title: 'Cafetaria',
      desc: 'Desain cafetaria ini mengombinasikan nuansa modern dengan sentuhan natural melalui penggunaan material kayu dan pencahayaan alami.',
      tag: 'Desain Interior'
    },
    
    // --- KOLASE 6 (4 gambar - Cafetaria) ---
    {
      isCollage: true,
      images: [
        'IMG-20260709-WA0148.jpg',
        'IMG-20260709-WA0149.jpg',
        'IMG-20260709-WA0150.jpg',
        'IMG-20260709-WA0151.jpg'
      ],
      fallback: 'IMG-20260709-WA0148.jpg',
      title: 'Cafetaria',
      desc: 'Area lounge ini dirancang dengan mengusung konsep modern kontemporer yang mengutamakan keseimbangan antara aspek estetika, kenyamanan, dan fungsionalitas.',
      tag: 'Desain Interior'
    }
  ];
  
  const galeriGrid = document.getElementById('galeriGrid');
  
  if (galeriGrid) {
    let html = '';
    
    galeriData.forEach(function(item) {
      if (item.isCollage) {
        // Tentukan class grid berdasarkan jumlah gambar
        let gridClass = 'collage-grid';
        if (item.images.length === 4) {
          gridClass += ' collage-grid-4';
        } else if (item.images.length === 3) {
          gridClass += ' collage-grid-3';
        } else if (item.images.length === 2) {
          gridClass += ' collage-grid-2';
        }
        
        html += `
          <div class="galeri-item collage-item"
               data-img="${item.images[0]}"
               data-fallback="${item.fallback}"
               data-title="${item.title}"
               data-desc="${item.desc}">
            <div class="galeri-image ${gridClass}">
              ${item.images.map(function(src) {
                return `<img src="${src}" alt="${item.title}" loading="lazy" onerror="this.src='${item.fallback}'">`;
              }).join('')}
              <div class="galeri-overlay">
                <i class="fas fa-search-plus"></i>
              </div>
            </div>
            <div class="galeri-info">
              <h4>${item.title}</h4>
              <p>${item.desc}</p>
              <span class="galeri-tag">${item.tag}</span>
            </div>
          </div>
        `;
      } else {
        // Kartu biasa (satu gambar)
        html += `
          <div class="galeri-item"
               data-img="${item.img}"
               data-fallback="${item.fallback}"
               data-title="${item.title}"
               data-desc="${item.desc}">
            <div class="galeri-image">
              <img src="${item.img}"
                   alt="${item.title}"
                   loading="lazy"
                   onerror="this.src='${item.fallback}'">
              <div class="galeri-overlay">
                <i class="fas fa-search-plus"></i>
              </div>
            </div>
            <div class="galeri-info">
              <h4>${item.title}</h4>
              <p>${item.desc}</p>
              <span class="galeri-tag">${item.tag}</span>
            </div>
          </div>
        `;
      }
    });
    
    galeriGrid.innerHTML = html;
    
    // ---- Lightbox ----
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');
    
    document.querySelectorAll('.galeri-item').forEach(function(item) {
      item.addEventListener('click', function() {
        const imgSrc = this.dataset.img;
        const fallbackSrc = this.dataset.fallback;
        const title = this.dataset.title;
        const desc = this.dataset.desc;
        
        lightboxImg.src = imgSrc;
        lightboxImg.onerror = function() {
          lightboxImg.src = fallbackSrc;
        };
        
        lightboxCaption.innerHTML = '<strong>' + title + '</strong><br>' + desc;
        lightbox.classList.add('active');
      });
    });
    
    lightboxClose.addEventListener('click', function() {
      lightbox.classList.remove('active');
    });
    
    lightbox.addEventListener('click', function(e) {
      if (e.target === this) {
        lightbox.classList.remove('active');
      }
    });
  }
  
  // 7. CONTACT FORM
  const kontakForm = document.getElementById('kontakForm');
  
  if (kontakForm) {
    kontakForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const successMsg = document.getElementById('formSuccess');
      successMsg.style.display = 'block';
      
      this.reset();
      
      setTimeout(function() {
        successMsg.style.display = 'none';
      }, 4000);
    });
  }
  
  // 8. NEWSLETTER FORM
  const newsletterForm = document.getElementById('newsletterForm');
  
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Terima kasih telah berlangganan newsletter kami!');
      this.reset();
    });
  }
  
  // 9. BACK TO TOP
  backToTop.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
});
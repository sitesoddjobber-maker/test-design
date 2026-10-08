/* ========================================
   O bag Japan - Portfolio 2: Bold Contrast
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- Header ---
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.pageYOffset > 60);
  });

  // --- Mobile Menu (Full Overlay) ---
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isActive = hamburger.classList.toggle('active');
      mobileNav.classList.toggle('active');
      document.body.style.overflow = isActive ? 'hidden' : '';
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Hero Slider ---
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  let currentSlide = 0;
  let slideInterval;

  function goToSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');

    // Restart animations
    const content = slides[currentSlide].querySelector('.hero-content');
    if (content) {
      const animated = content.querySelectorAll('.hero-badge, .hero-line, .hero-subtitle, .hero-actions');
      animated.forEach(el => {
        el.style.animation = 'none';
        el.offsetHeight;
        el.style.animation = '';
      });
    }
  }

  function nextSlide() { goToSlide(currentSlide + 1); }
  function startAutoSlide() { slideInterval = setInterval(nextSlide, 6000); }
  function resetAutoSlide() { clearInterval(slideInterval); startAutoSlide(); }

  if (slides.length > 1) {
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        goToSlide(parseInt(dot.dataset.slide));
        resetAutoSlide();
      });
    });
    startAutoSlide();

    // Touch support
    let touchStartX = 0;
    const heroEl = document.querySelector('.hero');
    if (heroEl) {
      heroEl.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      heroEl.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) {
          goToSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1);
          resetAutoSlide();
        }
      }, { passive: true });
    }
  }

  // --- Scroll Reveal ---
  const revealElements = document.querySelectorAll(
    '.tag-label, .section-title-lg, .section-text, .myo-content, .myo-visual, .how-card, .product-card, .part-tile, .about-img, .about-content, .newsletter-card, .sustainability-card, .insta-item, .value-item'
  );

  revealElements.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const parent = entry.target.parentElement;
        if (parent) {
          const siblings = Array.from(parent.children).filter(c => c.classList.contains('reveal'));
          const idx = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = `${idx * 0.08}s`;
        }
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  // --- Parallax ---
  const parallaxBg = document.querySelector('.parallax-bg');
  if (parallaxBg) {
    window.addEventListener('scroll', () => {
      const section = parallaxBg.parentElement;
      const rect = section.getBoundingClientRect();
      const speed = 0.3;
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const offset = rect.top * speed;
        parallaxBg.style.transform = `translateY(${offset}px)`;
      }
    }, { passive: true });
  }

  // --- Smooth Scroll ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerH = header.offsetHeight;
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerH;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // --- MYO Image Stack: slight mouse parallax on desktop ---
  const myoVisual = document.querySelector('.myo-visual');
  if (myoVisual && window.matchMedia('(min-width: 769px)').matches) {
    const cards = myoVisual.querySelectorAll('.myo-image-card');
    myoVisual.addEventListener('mousemove', (e) => {
      const rect = myoVisual.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      cards.forEach((card, i) => {
        const depth = (i + 1) * 6;
        card.style.transform = `translate(${x * depth}px, ${y * depth}px) rotate(${card.dataset.rotate || 0}deg)`;
      });
    });

    // Set initial rotation data
    const rotations = [-4, 2, -1];
    cards.forEach((card, i) => {
      card.dataset.rotate = rotations[i];
    });

    myoVisual.addEventListener('mouseleave', () => {
      cards.forEach((card, i) => {
        card.style.transform = `rotate(${rotations[i]}deg)`;
      });
    });
  }

});

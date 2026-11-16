/**
 * SRI SHANANMATHI'S BIRTHDAY CELEBRATION — VIEWER / CONSUMER MODE
 * Dedicated to Sri Shananmathi to explore & celebrate!
 * Pure exploration experience: no edit buttons, no uploaders, no editing toolbars.
 * Reads saved customizations from window.BIRTHDAY_DATA (exported file) or browser localStorage.
 */

(function () {
  'use strict';

  // ===================================================================
  // 1. DATA LOADER (From window.BIRTHDAY_DATA or localStorage)
  // ===================================================================
  function getCustomValue(key) {
    if (window.BIRTHDAY_DATA && window.BIRTHDAY_DATA[key]) {
      return window.BIRTHDAY_DATA[key];
    }
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function loadCustomizations() {
    // 1. Profile avatar photo (Page 5)
    const profileImg = document.getElementById('profile-avatar-img');
    const customProfilePhoto = getCustomValue('sri_shananmathi_custom_profile_photo');
    if (profileImg && customProfilePhoto) {
      profileImg.src = customProfilePhoto;
    }

    // 2. Memory Polaroid photos (Page 4)
    for (let i = 1; i <= 6; i++) {
      const memoryImg = document.getElementById('memory-img-' + i);
      const customMemory = getCustomValue('sri_memory_card_img_' + i);
      if (memoryImg && customMemory) {
        memoryImg.src = customMemory;
      }
    }

    // 3. Custom Memory cards (if any added)
    try {
      const extraMemories = JSON.parse(getCustomValue('sri_shananmathi_custom_memories') || '[]');
      if (Array.isArray(extraMemories)) {
        extraMemories.forEach(mem => {
          if (mem && mem.url) {
            renderViewerPolaroid(mem.url, mem.title || 'Precious Moment', mem.quote || 'A memory that shines forever.');
          }
        });
      }
    } catch (e) {}

    // 4. Custom Gallery photos (Page 3)
    try {
      const customGallery = JSON.parse(getCustomValue('sri_shananmathi_custom_gallery') || '[]');
      if (Array.isArray(customGallery)) {
        // Reverse so newest appears first
        customGallery.slice().reverse().forEach(photo => {
          if (photo && photo.url) {
            renderViewerGalleryItem(photo.url, photo.title || 'Celebration Memory', photo.subtitle || 'Golden Birthday Moment');
          }
        });
      }
    } catch (e) {}

    // 5. Custom Birthday Letter (Page 6 Surprise)
    try {
      const customLetter = JSON.parse(getCustomValue('sri_shananmathi_custom_letter') || 'null');
      if (customLetter) {
        const greetingEl = document.getElementById('proclamation-greeting');
        const subtitleEl = document.getElementById('proclamation-subtitle');
        const bodyEl = document.getElementById('proclamation-body');
        const signoffEl = document.getElementById('proclamation-signoff');

        if (greetingEl && customLetter.greeting) greetingEl.innerHTML = customLetter.greeting;
        if (subtitleEl && customLetter.subtitle) subtitleEl.innerHTML = customLetter.subtitle;
        if (bodyEl && customLetter.body) bodyEl.innerHTML = customLetter.body;
        if (signoffEl && customLetter.signoff) signoffEl.innerHTML = customLetter.signoff;
      }
    } catch (e) {}
  }

  function renderViewerGalleryItem(src, title, subtitle) {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.setAttribute('data-title', title);
    item.setAttribute('data-subtitle', subtitle);
    item.innerHTML = `
      <img src="${src}" alt="${title}">
      <div class="gallery-overlay">
        <h4>${title}</h4>
        <p>${subtitle}</p>
      </div>
    `;
    item.addEventListener('click', () => openLightbox(src, title, subtitle));
    galleryGrid.prepend(item);
  }

  function renderViewerPolaroid(src, title, quote) {
    const polaroidGrid = document.querySelector('.polaroid-grid');
    if (!polaroidGrid) return;
    const card = document.createElement('div');
    card.className = 'polaroid-card';
    card.innerHTML = `
      <div class="polaroid-photo-frame">
        <img src="${src}" alt="${title}">
      </div>
      <div class="polaroid-caption">
        <h4>${title}</h4>
        <p>${quote}</p>
      </div>
    `;
    card.addEventListener('click', () => openLightbox(src, title, quote));
    polaroidGrid.prepend(card);
  }

  // ===================================================================
  // 2. PRESENTATION NAVIGATION (CLICK-TO-ADVANCE, NO AUTO-RUN BY DEFAULT)
  // ===================================================================
  const SLIDES = [
    { id: 'home', name: 'Home', title: 'Happy Birthday Sri Shananmathi' },
    { id: 'wishes', name: 'Wishes', title: 'Heartfelt Birthday Wishes' },
    { id: 'gallery', name: 'Gallery', title: 'Celebration Moments' },
    { id: 'memories', name: 'Memories', title: 'Polaroid Memories' },
    { id: 'about', name: 'About', title: 'About Sri Shananmathi' },
    { id: 'surprise', name: 'Surprise', title: 'Special Birthday Surprise' }
  ];

  let currentSlideIndex = 0;
  let isAutoPlayActive = false;
  let autoPlayTimer = null;
  const AUTO_DURATION = 9000;

  const isPresentationMode = document.querySelector('.presentation-container') !== null;
  const sections = document.querySelectorAll('.page-section');
  const navLinks = document.querySelectorAll('.nav-link');
  const progressBar = document.getElementById('slide-progress-bar');
  const slideCounter = document.getElementById('slide-counter');
  const slideTitleLabel = document.getElementById('slide-title-label');
  const nextBtn = document.getElementById('next-btn') || document.getElementById('skip-btn');
  const prevBtn = document.getElementById('prev-btn');
  const autoPlayToggleBtn = document.getElementById('autoplay-toggle-btn');
  const musicToggleBtn = document.getElementById('music-toggle-btn');
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');

  function initPresentation() {
    if (!isPresentationMode || sections.length === 0) return;

    const hash = window.location.hash.replace('#', '');
    const foundIndex = SLIDES.findIndex(s => s.id === hash);
    if (foundIndex !== -1) currentSlideIndex = foundIndex;

    goToSlide(currentSlideIndex);

    if (nextBtn) nextBtn.addEventListener('click', () => nextSlide());
    if (prevBtn) prevBtn.addEventListener('click', () => prevSlide());
    if (autoPlayToggleBtn) autoPlayToggleBtn.addEventListener('click', toggleAutoPlay);

    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') nextSlide();
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') prevSlide();
    });

    let touchStartX = 0;
    let touchEndX = 0;
    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 60) {
        if (diff > 0) nextSlide();
        else prevSlide();
      }
    }, { passive: true });

    window.addEventListener('hashchange', () => {
      const h = window.location.hash.replace('#', '');
      const idx = SLIDES.findIndex(s => s.id === h);
      if (idx !== -1 && idx !== currentSlideIndex) goToSlide(idx);
    });
  }

  function goToSlide(index) {
    if (index < 0) index = SLIDES.length - 1;
    if (index >= SLIDES.length) index = 0;
    currentSlideIndex = index;
    const currentSlide = SLIDES[index];

    sections.forEach((sec, idx) => {
      sec.classList.toggle('active', idx === index);
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      const targetId = href ? href.split('#')[1] || href.replace('.html', '') : '';
      link.classList.toggle('active', targetId === currentSlide.id);
    });

    if (slideCounter) slideCounter.textContent = `0${index + 1} / 0${SLIDES.length}`;
    if (slideTitleLabel) slideTitleLabel.textContent = `• ${currentSlide.name}`;
    if (progressBar) progressBar.style.width = `${((index + 1) / SLIDES.length) * 100}%`;
    if (history.replaceState) history.replaceState(null, null, `#${currentSlide.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (currentSlide.id === 'surprise') {
      createSparkleBurst(window.innerWidth / 2, window.innerHeight / 2, 30);
    }

    if (isAutoPlayActive) {
      clearTimeout(autoPlayTimer);
      autoPlayTimer = setTimeout(() => {
        if (isAutoPlayActive) nextSlide();
      }, AUTO_DURATION);
    }
  }

  function nextSlide() { goToSlide(currentSlideIndex + 1); }
  function prevSlide() { goToSlide(currentSlideIndex - 1); }

  function toggleAutoPlay() {
    isAutoPlayActive = !isAutoPlayActive;
    if (autoPlayToggleBtn) {
      if (isAutoPlayActive) {
        autoPlayToggleBtn.classList.add('active');
        autoPlayToggleBtn.textContent = '⏸ Auto-Play: ON';
        autoPlayTimer = setTimeout(nextSlide, AUTO_DURATION);
      } else {
        autoPlayToggleBtn.classList.remove('active');
        autoPlayToggleBtn.textContent = '▶ Auto-Play: OFF';
        clearTimeout(autoPlayTimer);
      }
    }
  }

  const exploreBtn = document.getElementById('explore-btn');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', (e) => {
      if (isPresentationMode) {
        e.preventDefault();
        goToSlide(1);
        if (!audioEngine.isPlaying) audioEngine.start();
      }
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (isPresentationMode && href && href.includes('#')) {
        e.preventDefault();
        const targetId = href.split('#')[1];
        const idx = SLIDES.findIndex(s => s.id === targetId);
        if (idx !== -1) goToSlide(idx);
        if (navMenu && navMenu.classList.contains('open')) navMenu.classList.remove('open');
      }
    });
  });

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => navMenu.classList.toggle('open'));
  }

  // ===================================================================
  // 3. CRYSTAL MUSIC BOX SYNTHESIZER (PLAY/PAUSE)
  // ===================================================================
  class BirthdayAudioEngine {
    constructor() {
      this.ctx = null;
      this.isPlaying = false;
      this.currentTimeout = null;
      this.tempo = 145;
      this.volume = 0.8;
      this.currentPreset = 'chimes';
    }

    initContext() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
    }

    getNotes() {
      return {
        'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
        'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
        'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46,
        'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
        'REST': 0
      };
    }

    getMelody() {
      return [
        { note: 'G4', dur: 0.75 }, { note: 'G4', dur: 0.25 }, { note: 'A4', dur: 1.0 }, { note: 'G4', dur: 1.0 }, { note: 'C5', dur: 1.0 }, { note: 'B4', dur: 2.0 },
        { note: 'G4', dur: 0.75 }, { note: 'G4', dur: 0.25 }, { note: 'A4', dur: 1.0 }, { note: 'G4', dur: 1.0 }, { note: 'D5', dur: 1.0 }, { note: 'C5', dur: 2.0 },
        { note: 'G4', dur: 0.75 }, { note: 'G4', dur: 0.25 }, { note: 'G5', dur: 1.0 }, { note: 'E5', dur: 1.0 }, { note: 'C5', dur: 1.0 }, { note: 'B4', dur: 1.0 }, { note: 'A4', dur: 1.5 },
        { note: 'F5', dur: 0.75 }, { note: 'F5', dur: 0.25 }, { note: 'E5', dur: 1.0 }, { note: 'C5', dur: 1.0 }, { note: 'D5', dur: 1.0 }, { note: 'C5', dur: 2.5 },
        { note: 'REST', dur: 1.0 }
      ];
    }

    playNote(freq, duration) {
      if (!this.ctx || freq === 0) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      const vol = this.volume * 0.2;

      osc.type = 'sine';
      osc2.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc2.frequency.setValueAtTime(freq * 2.02, now);
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(vol, now + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration + 0.7);

      osc.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + duration + 1.3);
      osc2.stop(now + duration + 1.3);
    }

    start() {
      this.isPlaying = true;
      this.updateUI(true);
      this.initContext();
      this.playSequence(0);
    }

    playSequence(index) {
      if (!this.isPlaying) return;
      const melody = this.getMelody();
      const notes = this.getNotes();
      if (index >= melody.length) index = 0;
      const item = melody[index];
      const freq = notes[item.note] || 0;
      const beatDurationSec = 60 / this.tempo;
      const duration = item.dur * beatDurationSec;

      if (freq > 0) this.playNote(freq, duration);

      this.currentTimeout = setTimeout(() => {
        if (this.isPlaying) this.playSequence(index + 1);
      }, duration * 1000);
    }

    stop() {
      this.isPlaying = false;
      clearTimeout(this.currentTimeout);
      this.updateUI(false);
    }

    toggle() {
      if (this.isPlaying) this.stop();
      else this.start();
    }

    updateUI(playing) {
      if (musicToggleBtn) {
        if (playing) {
          musicToggleBtn.classList.add('playing');
          musicToggleBtn.querySelector('.music-label').textContent = 'Pause Music';
        } else {
          musicToggleBtn.classList.remove('playing');
          musicToggleBtn.querySelector('.music-label').textContent = 'Play Music';
        }
      }
    }
  }

  const audioEngine = new BirthdayAudioEngine();
  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', () => audioEngine.toggle());
  }

  // ===================================================================
  // 4. BACKGROUND PARTICLES CANVAS
  // ===================================================================
  function initParticleCanvas() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const NUM_PARTICLES = Math.min(50, Math.floor(width / 24));
    const colors = [
      'rgba(255, 215, 0, ',
      'rgba(255, 117, 140, ',
      'rgba(189, 89, 234, ',
      'rgba(255, 255, 255, '
    ];

    class Particle {
      constructor() { this.reset(true); }
      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : height + 20;
        this.size = Math.random() * 4 + 2;
        this.type = Math.random() < 0.35 ? 'heart' : Math.random() < 0.65 ? 'star' : 'orb';
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.6 + 0.2;
        this.speedY = Math.random() * 0.7 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.6;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.02;
        this.pulse = Math.random() * Math.PI;
      }
      update() {
        this.y -= this.speedY;
        this.x += this.speedX + Math.sin(this.pulse) * 0.3;
        this.pulse += 0.02;
        this.rotation += this.rotSpeed;
        if (this.y < -30 || this.x < -30 || this.x > width + 30) this.reset(false);
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color + this.alpha + ')';
        ctx.shadowColor = this.color + '0.8)';
        ctx.shadowBlur = 10;
        if (this.type === 'heart') {
          const s = this.size * 1.3;
          ctx.beginPath();
          ctx.moveTo(0, -s / 2);
          ctx.bezierCurveTo(-s, -s * 1.2, -s * 1.5, s / 3, 0, s * 1.2);
          ctx.bezierCurveTo(s * 1.5, s / 3, s, -s * 1.2, 0, -s / 2);
          ctx.fill();
        } else if (this.type === 'star') {
          const s = this.size * 1.5;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.quadraticCurveTo(0, 0, s, 0);
          ctx.quadraticCurveTo(0, 0, 0, s);
          ctx.quadraticCurveTo(0, 0, -s, 0);
          ctx.quadraticCurveTo(0, 0, 0, -s);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    for (let i = 0; i < NUM_PARTICLES; i++) particles.push(new Particle());

    function animate() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animate);
    }
    animate();
  }

  // ===================================================================
  // 5. CONFETTI CANNON
  // ===================================================================
  let confettiCanvas = null;
  let confettiCtx = null;
  let confettiParticles = [];
  let isConfettiRunning = false;

  function initConfetti() {
    confettiCanvas = document.getElementById('confetti-canvas');
    if (!confettiCanvas) return;
    confettiCtx = confettiCanvas.getContext('2d');
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
      if (confettiCanvas) {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
      }
    });
  }

  function launchConfetti(count = 120) {
    if (!confettiCanvas || !confettiCtx) return;
    const colors = ['#ffd700', '#ff4d79', '#9d2ec9', '#ffffff', '#ffb3c6', '#ffe082', '#ff758c'];
    for (let i = 0; i < count; i++) {
      confettiParticles.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
        y: window.innerHeight / 2 + 50,
        w: Math.random() * 10 + 6,
        h: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 18,
        vy: -Math.random() * 16 - 8,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        gravity: 0.35,
        drag: 0.98,
        alpha: 1
      });
    }
    if (!isConfettiRunning) {
      isConfettiRunning = true;
      requestAnimationFrame(renderConfetti);
    }
  }

  function renderConfetti() {
    if (!confettiCtx) return;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    for (let i = confettiParticles.length - 1; i >= 0; i--) {
      const p = confettiParticles[i];
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotSpeed;
      p.alpha -= 0.005;

      if (p.alpha <= 0 || p.y > confettiCanvas.height + 50) {
        confettiParticles.splice(i, 1);
        continue;
      }

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate(p.rot);
      confettiCtx.globalAlpha = Math.max(0, p.alpha);
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      confettiCtx.restore();
    }
    if (confettiParticles.length > 0) {
      requestAnimationFrame(renderConfetti);
    } else {
      isConfettiRunning = false;
    }
  }

  function createSparkleBurst(x, y, count = 20) {
    if (!confettiCanvas || !confettiCtx) return;
    const colors = ['#ffd700', '#ff80ab', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      confettiParticles.push({
        x: x, y: y, w: 5, h: 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: 0, rotSpeed: 0,
        gravity: 0.15, drag: 0.96, alpha: 1
      });
    }
    if (!isConfettiRunning) {
      isConfettiRunning = true;
      requestAnimationFrame(renderConfetti);
    }
  }

  // ===================================================================
  // 6. INTERACTIVE BIRTHDAY CAKE
  // ===================================================================
  function initInteractiveCake() {
    const heroCake = document.getElementById('hero-cake-interactive');
    if (!heroCake) return;
    let isBlownOut = false;

    heroCake.addEventListener('click', (e) => {
      const rect = heroCake.getBoundingClientRect();
      const clickX = e.clientX || rect.left + rect.width / 2;
      const clickY = e.clientY || rect.top + rect.height / 3;

      launchConfetti(50);
      createSparkleBurst(clickX, clickY, 30);

      audioEngine.initContext();
      if (audioEngine.ctx) {
        audioEngine.playNote(784, 0.4);
        setTimeout(() => audioEngine.playNote(1046, 0.8), 200);
      }

      const hint = document.getElementById('cake-hint-text');
      if (hint) {
        isBlownOut = !isBlownOut;
        hint.textContent = isBlownOut 
          ? "🎉 Happy Birthday Sri Shananmathi! Wish Granted!" 
          : "✨ Click the cake again to send more wishes!";
      }
    });
  }

  // ===================================================================
  // 7. PHOTO GALLERY & LIGHTBOX
  // ===================================================================
  function initGalleryLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const polaroidCards = document.querySelectorAll('.polaroid-card');
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxClose = document.getElementById('lightbox-close');

    if (!lightboxModal) return;

    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const title = item.getAttribute('data-title') || 'Celebration';
        const subtitle = item.getAttribute('data-subtitle') || 'Birthday Moment';
        if (img) openLightbox(img.src, title, subtitle);
      });
    });

    polaroidCards.forEach(card => {
      card.addEventListener('click', () => {
        const img = card.querySelector('.polaroid-photo-frame img');
        const h4 = card.querySelector('.polaroid-caption h4');
        const p = card.querySelector('.polaroid-caption p');
        const title = h4 ? h4.textContent : 'Cherished Memory';
        const desc = p ? p.textContent : '';
        if (img) openLightbox(img.src, title, desc);
      });
    });

    function closeLightbox() {
      lightboxModal.classList.remove('active');
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightboxModal.classList.contains('active')) closeLightbox();
    });
  }

  function openLightbox(src, title, subtitle) {
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxSubcaption = document.getElementById('lightbox-subcaption');

    if (!lightboxModal || !lightboxImg) return;

    lightboxImg.src = src;
    lightboxImg.alt = title;
    if (lightboxCaption) lightboxCaption.textContent = title;
    if (lightboxSubcaption) lightboxSubcaption.textContent = subtitle;
    lightboxModal.classList.add('active');
  }

  // ===================================================================
  // 8. SURPRISE GIFT BOX & PROCLAMATION LETTER
  // ===================================================================
  function initSurpriseFeature() {
    const openSurpriseBtn = document.getElementById('open-surprise-btn');
    const interactiveGift = document.getElementById('interactive-gift-box');
    const surpriseRevealModal = document.getElementById('surprise-card-reveal');
    const proclamationCloseBtn = document.getElementById('proclamation-close-btn');
    const celebrateAgainBtn = document.getElementById('celebrate-again-btn');

    function triggerSurprise() {
      launchConfetti(220);

      audioEngine.initContext();
      if (audioEngine.ctx) {
        const fanfareNotes = [523.25, 659.25, 783.99, 1046.50];
        fanfareNotes.forEach((f, i) => {
          setTimeout(() => audioEngine.playNote(f, 0.6), i * 140);
        });
      }

      if (!audioEngine.isPlaying) {
        setTimeout(() => audioEngine.start(), 800);
      }

      if (surpriseRevealModal) {
        setTimeout(() => {
          surpriseRevealModal.classList.add('active');
        }, 400);
      }
    }

    if (openSurpriseBtn) openSurpriseBtn.addEventListener('click', triggerSurprise);
    if (interactiveGift) interactiveGift.addEventListener('click', triggerSurprise);

    if (proclamationCloseBtn && surpriseRevealModal) {
      proclamationCloseBtn.addEventListener('click', () => {
        surpriseRevealModal.classList.remove('active');
      });
    }

    if (celebrateAgainBtn) {
      celebrateAgainBtn.addEventListener('click', () => {
        launchConfetti(150);
        audioEngine.playNote(880, 0.4);
      });
    }
  }

  // ===================================================================
  // INITIALIZATION ON DOM READY
  // ===================================================================
  document.addEventListener('DOMContentLoaded', () => {
    loadCustomizations();
    initPresentation();
    initParticleCanvas();
    initConfetti();
    initInteractiveCake();
    initGalleryLightbox();
    initSurpriseFeature();
  });

})();

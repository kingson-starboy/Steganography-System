/**
 * SRI SHANANMATHI'S BIRTHDAY CELEBRATION
 * Common Script for Automatic Presentation, Animations, Particles,
 * Melodic Synthesizer, Confetti, and Interactive Surprises.
 */

(function () {
  'use strict';

  // --- Configuration ---
  const SLIDE_DURATION = 9000; // 9 seconds per slide (between 8-10 seconds)
  const SLIDES = [
    { id: 'home', name: 'Home', title: 'Happy Birthday Sri Shananmathi' },
    { id: 'wishes', name: 'Wishes', title: 'Heartfelt Birthday Wishes' },
    { id: 'gallery', name: 'Gallery', title: 'Celebration Moments' },
    { id: 'memories', name: 'Memories', title: 'Polaroid Memories' },
    { id: 'about', name: 'About', title: 'About Sri Shananmathi' },
    { id: 'surprise', name: 'Surprise', title: 'Special Birthday Surprise' }
  ];

  let currentSlideIndex = 0;
  let isPaused = true; // Start in Explore Mode so visitors can explore at their own pace
  let slideTimer = null;
  let slideStartTime = Date.now();
  let remainingTime = SLIDE_DURATION;
  let progressAnimationId = null;

  // --- DOM Elements ---
  const isPresentationMode = document.querySelector('.presentation-container') !== null;
  const sections = document.querySelectorAll('.page-section');
  const navLinks = document.querySelectorAll('.nav-link');
  const progressBar = document.getElementById('slide-progress-bar');
  const slideCounter = document.getElementById('slide-counter');
  const slideTitleLabel = document.getElementById('slide-title-label');
  const autoStatusIndicator = document.getElementById('auto-status-indicator');
  const pauseResumeBtn = document.getElementById('pause-resume-btn');
  const skipBtn = document.getElementById('skip-btn');
  const prevBtn = document.getElementById('prev-btn');
  const musicToggleBtn = document.getElementById('music-toggle-btn');
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');

  // ===================================================================
  // 1. AUTOMATIC PRESENTATION CONTROLLER
  // ===================================================================
  function initPresentation() {
    if (!isPresentationMode || sections.length === 0) return;

    // Check URL hash for initial slide
    const hash = window.location.hash.replace('#', '');
    const foundIndex = SLIDES.findIndex(s => s.id === hash);
    if (foundIndex !== -1) {
      currentSlideIndex = foundIndex;
    }

    goToSlide(currentSlideIndex, false);

    // Initialize in Explore Mode
    if (pauseResumeBtn) {
      pauseResumeBtn.innerHTML = `<span>Auto Play</span><i style="font-style:normal;">▶</i>`;
    }
    if (autoStatusIndicator) {
      autoStatusIndicator.classList.add('paused');
      autoStatusIndicator.title = "Explore Mode (Click Auto Play to auto-tour)";
    }

    // Event Listeners for Controls
    if (pauseResumeBtn) {
      pauseResumeBtn.addEventListener('click', togglePauseResume);
    }
    if (skipBtn) {
      skipBtn.addEventListener('click', nextSlide);
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', prevSlide);
    }

    // Keyboard navigation (Arrow keys, Space to pause)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === ' ' && e.target.tagName !== 'BUTTON') {
        e.preventDefault();
        togglePauseResume();
      }
    });

    // Sync presentation on hash change
    window.addEventListener('hashchange', () => {
      const h = window.location.hash.replace('#', '');
      const idx = SLIDES.findIndex(s => s.id === h);
      if (idx !== -1 && idx !== currentSlideIndex) {
        goToSlide(idx, true);
      }
    });
  }

  function goToSlide(index, resetTimer = true) {
    if (index < 0) index = SLIDES.length - 1;
    if (index >= SLIDES.length) index = 0;

    currentSlideIndex = index;
    const currentSlide = SLIDES[index];

    // Update section visibility
    sections.forEach((sec, idx) => {
      if (idx === index) {
        sec.classList.add('active');
      } else {
        sec.classList.remove('active');
      }
    });

    // Update Navigation Links
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      const targetId = href ? href.split('#')[1] || href.replace('.html', '') : '';
      if (targetId === currentSlide.id) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update Bottom Controller Indicators
    if (slideCounter) {
      slideCounter.textContent = `0${index + 1} / 0${SLIDES.length}`;
    }
    if (slideTitleLabel) {
      slideTitleLabel.textContent = `• ${currentSlide.name}`;
    }

    // Update URL hash smoothly without jump
    if (history.replaceState) {
      history.replaceState(null, null, `#${currentSlide.id}`);
    }

    // Trigger Slide Entrance Effects
    if (currentSlide.id === 'surprise') {
      // Gentle sparkle burst on landing
      createSparkleBurst(window.innerWidth / 2, window.innerHeight / 2, 25);
    }

    if (resetTimer) {
      remainingTime = SLIDE_DURATION;
      slideStartTime = Date.now();
      if (!isPaused) {
        startSlideTimer();
      } else {
        if (progressBar) progressBar.style.width = '0%';
      }
    }
  }

  function nextSlide() {
    goToSlide(currentSlideIndex + 1, true);
  }

  function prevSlide() {
    goToSlide(currentSlideIndex - 1, true);
  }

  function startSlideTimer() {
    clearTimeout(slideTimer);
    cancelAnimationFrame(progressAnimationId);

    slideStartTime = Date.now();

    function updateProgressBar() {
      if (isPaused) return;

      const elapsed = Date.now() - slideStartTime;
      const progress = Math.min(100, (elapsed / remainingTime) * 100);

      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }

      if (elapsed < remainingTime) {
        progressAnimationId = requestAnimationFrame(updateProgressBar);
      }
    }

    progressAnimationId = requestAnimationFrame(updateProgressBar);

    slideTimer = setTimeout(() => {
      if (!isPaused) {
        nextSlide();
      }
    }, remainingTime);
  }

  function togglePauseResume() {
    isPaused = !isPaused;

    if (isPaused) {
      clearTimeout(slideTimer);
      cancelAnimationFrame(progressAnimationId);
      if (progressBar) progressBar.style.width = '0%';

      if (pauseResumeBtn) {
        pauseResumeBtn.innerHTML = `<span>Auto Play</span><i style="font-style:normal;">▶</i>`;
      }
      if (autoStatusIndicator) {
        autoStatusIndicator.classList.add('paused');
        autoStatusIndicator.title = "Explore Mode Active";
      }
    } else {
      if (pauseResumeBtn) {
        pauseResumeBtn.innerHTML = `<span>Pause</span><i style="font-style:normal;">⏸</i>`;
      }
      if (autoStatusIndicator) {
        autoStatusIndicator.classList.remove('paused');
        autoStatusIndicator.title = "Auto Presentation Active";
      }
      remainingTime = SLIDE_DURATION;
      startSlideTimer();
    }
  }

  // Explore Button Navigation
  const exploreBtn = document.getElementById('explore-btn');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', (e) => {
      if (isPresentationMode) {
        e.preventDefault();
        goToSlide(1, true); // Move to Wishes
        // Play music softly if not already playing
        if (!audioEngine.isPlaying) {
          audioEngine.start();
        }
      }
    });
  }

  // Navigation Links Click Handler for single-page presentation
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (isPresentationMode && href && href.includes('#')) {
        e.preventDefault();
        const targetId = href.split('#')[1];
        const idx = SLIDES.findIndex(s => s.id === targetId);
        if (idx !== -1) {
          goToSlide(idx, true);
        }
        if (navMenu && navMenu.classList.contains('open')) {
          navMenu.classList.remove('open');
        }
      }
    });
  });

  // Mobile Menu Toggle
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
  }

  // ===================================================================
  // 2. CRYSTAL MUSIC BOX SYNTHESIZER (HAPPY BIRTHDAY MELODY)
  // ===================================================================
  /**
   * Generates a sweet, gentle music-box / celesta acoustic melody using
   * the Web Audio API. 100% self-contained, no external MP3 dependencies,
   * completely offline and reliable without CORS restrictions.
   */
  class BirthdayAudioEngine {
    constructor() {
      this.ctx = null;
      this.isPlaying = false;
      this.currentTimeout = null;
      this.tempo = 145; // BPM
    }

    initContext() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    // Note frequencies in Hz
    getNotes() {
      return {
        'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
        'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
        'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46,
        'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
        'REST': 0
      };
    }

    // Happy Birthday melody notes and durations (in beats)
    getMelody() {
      return [
        { note: 'G4', dur: 0.75 }, { note: 'G4', dur: 0.25 }, { note: 'A4', dur: 1.0 }, { note: 'G4', dur: 1.0 }, { note: 'C5', dur: 1.0 }, { note: 'B4', dur: 2.0 },
        { note: 'G4', dur: 0.75 }, { note: 'G4', dur: 0.25 }, { note: 'A4', dur: 1.0 }, { note: 'G4', dur: 1.0 }, { note: 'D5', dur: 1.0 }, { note: 'C5', dur: 2.0 },
        { note: 'G4', dur: 0.75 }, { note: 'G4', dur: 0.25 }, { note: 'G5', dur: 1.0 }, { note: 'E5', dur: 1.0 }, { note: 'C5', dur: 1.0 }, { note: 'B4', dur: 1.0 }, { note: 'A4', dur: 1.5 },
        { note: 'F5', dur: 0.75 }, { note: 'F5', dur: 0.25 }, { note: 'E5', dur: 1.0 }, { note: 'C5', dur: 1.0 }, { note: 'D5', dur: 1.0 }, { note: 'C5', dur: 2.5 },
        { note: 'REST', dur: 1.0 }
      ];
    }

    // Play a crystal music box chime note
    playChime(freq, duration) {
      if (!this.ctx || freq === 0) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const oscHarmonic = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      // Sine wave with overtone creates music-box / vibraphone chime quality
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      oscHarmonic.type = 'triangle';
      oscHarmonic.frequency.setValueAtTime(freq * 2.02, now); // Sweet bell overtone

      // Gain Envelope: quick bright attack, lingering gentle decay
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.18, now + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration + 0.6);

      osc.connect(gainNode);
      oscHarmonic.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(now);
      oscHarmonic.start(now);
      osc.stop(now + duration + 0.7);
      oscHarmonic.stop(now + duration + 0.7);
    }

    start() {
      this.initContext();
      this.isPlaying = true;
      if (musicToggleBtn) {
        musicToggleBtn.classList.add('playing');
        musicToggleBtn.querySelector('.music-label').textContent = 'Pause Music';
      }
      this.playSequence(0);
    }

    playSequence(index) {
      if (!this.isPlaying) return;

      const melody = this.getMelody();
      const notes = this.getNotes();

      if (index >= melody.length) {
        index = 0; // Loop melody
      }

      const item = melody[index];
      const freq = notes[item.note] || 0;
      const beatDurationSec = 60 / this.tempo;
      const duration = item.dur * beatDurationSec;

      if (freq > 0) {
        this.playChime(freq, duration);
      }

      this.currentTimeout = setTimeout(() => {
        if (this.isPlaying) {
          this.playSequence(index + 1);
        }
      }, duration * 1000);
    }

    stop() {
      this.isPlaying = false;
      clearTimeout(this.currentTimeout);
      if (musicToggleBtn) {
        musicToggleBtn.classList.remove('playing');
        musicToggleBtn.querySelector('.music-label').textContent = 'Play Music';
      }
    }

    toggle() {
      if (this.isPlaying) {
        this.stop();
      } else {
        this.start();
      }
    }
  }

  const audioEngine = new BirthdayAudioEngine();

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', () => {
      audioEngine.toggle();
    });
  }

  // ===================================================================
  // 3. BACKGROUND PARTICLES: HEARTS, STARS, FLOWERS & SPARKLES
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
    const NUM_PARTICLES = Math.min(55, Math.floor(width / 22));

    const colors = [
      'rgba(255, 215, 0, ',   // Gold
      'rgba(255, 117, 140, ', // Pink
      'rgba(189, 89, 234, ',  // Violet
      'rgba(255, 255, 255, '  // White sparkle
    ];

    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : height + 20;
        this.size = Math.random() * 4 + 2;
        this.type = Math.random() < 0.35 ? 'heart' : Math.random() < 0.65 ? 'star' : 'orb';
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.6 + 0.2;
        this.speedY = Math.random() * 0.8 + 0.3;
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

        if (this.y < -30 || this.x < -30 || this.x > width + 30) {
          this.reset(false);
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color + this.alpha + ')';
        ctx.shadowColor = this.color + '0.8)';
        ctx.shadowBlur = 10;

        if (this.type === 'heart') {
          // Draw sweet heart
          const s = this.size * 1.3;
          ctx.beginPath();
          ctx.moveTo(0, -s / 2);
          ctx.bezierCurveTo(-s, -s * 1.2, -s * 1.5, s / 3, 0, s * 1.2);
          ctx.bezierCurveTo(s * 1.5, s / 3, s, -s * 1.2, 0, -s / 2);
          ctx.fill();
        } else if (this.type === 'star') {
          // Draw four-point twinkle star
          const s = this.size * 1.5;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.quadraticCurveTo(0, 0, s, 0);
          ctx.quadraticCurveTo(0, 0, 0, s);
          ctx.quadraticCurveTo(0, 0, -s, 0);
          ctx.quadraticCurveTo(0, 0, 0, -s);
          ctx.fill();
        } else {
          // Glowing orb
          ctx.beginPath();
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    }

    animate();
  }

  // ===================================================================
  // 4. CONFETTI CANNON SYSTEM
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
        x: x,
        y: y,
        w: 5,
        h: 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: 0,
        rotSpeed: 0,
        gravity: 0.15,
        drag: 0.96,
        alpha: 1
      });
    }
    if (!isConfettiRunning) {
      isConfettiRunning = true;
      requestAnimationFrame(renderConfetti);
    }
  }

  // ===================================================================
  // 5. INTERACTIVE BIRTHDAY CAKE & CANDLE
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

      // Gentle chime sound
      audioEngine.initContext();
      if (audioEngine.ctx) {
        audioEngine.playChime(784, 0.4); // G5
        setTimeout(() => audioEngine.playChime(1046, 0.8), 200); // C6
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
  // 6. PHOTO GALLERY & LIGHTBOX
  // ===================================================================
  function initGalleryLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxSubcaption = document.getElementById('lightbox-subcaption');
    const lightboxClose = document.getElementById('lightbox-close');

    if (!lightboxModal) return;

    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const title = item.getAttribute('data-title') || 'Celebration';
        const subtitle = item.getAttribute('data-subtitle') || 'Birthday Moment';

        if (img && lightboxImg) {
          lightboxImg.src = img.src;
          lightboxImg.alt = title;
        }
        if (lightboxCaption) lightboxCaption.textContent = title;
        if (lightboxSubcaption) lightboxSubcaption.textContent = subtitle;

        lightboxModal.classList.add('active');
        // Pause slide presentation while viewing photo
        if (!isPaused && isPresentationMode) {
          togglePauseResume();
        }
      });
    });

    function closeLightbox() {
      lightboxModal.classList.remove('active');
    }

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }

    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

  // ===================================================================
  // 7. SPECIAL SURPRISE GIFT BOX & PROCLAMATION CARD
  // ===================================================================
  function initSurpriseFeature() {
    const openSurpriseBtn = document.getElementById('open-surprise-btn');
    const interactiveGift = document.getElementById('interactive-gift-box');
    const surpriseRevealModal = document.getElementById('surprise-card-reveal');
    const proclamationCloseBtn = document.getElementById('proclamation-close-btn');
    const celebrateAgainBtn = document.getElementById('celebrate-again-btn');

    function triggerSurprise() {
      // Grand celebratory confetti cannon burst
      launchConfetti(220);

      // Play special chime fanfare
      audioEngine.initContext();
      if (audioEngine.ctx) {
        const fanfareNotes = [523.25, 659.25, 783.99, 1046.50];
        fanfareNotes.forEach((f, i) => {
          setTimeout(() => audioEngine.playChime(f, 0.6), i * 140);
        });
      }

      // Start music box if not already playing
      if (!audioEngine.isPlaying) {
        setTimeout(() => audioEngine.start(), 800);
      }

      // Show Proclamation Card
      if (surpriseRevealModal) {
        setTimeout(() => {
          surpriseRevealModal.classList.add('active');
        }, 400);
      }
    }

    if (openSurpriseBtn) {
      openSurpriseBtn.addEventListener('click', triggerSurprise);
    }
    if (interactiveGift) {
      interactiveGift.addEventListener('click', triggerSurprise);
    }

    if (proclamationCloseBtn && surpriseRevealModal) {
      proclamationCloseBtn.addEventListener('click', () => {
        surpriseRevealModal.classList.remove('active');
      });
    }

    if (celebrateAgainBtn) {
      celebrateAgainBtn.addEventListener('click', () => {
        launchConfetti(150);
        audioEngine.playChime(880, 0.4);
      });
    }
  }

  // ===================================================================
  // INITIALIZATION ON DOM READY
  // ===================================================================
  document.addEventListener('DOMContentLoaded', () => {
    initPresentation();
    initParticleCanvas();
    initConfetti();
    initInteractiveCake();
    initGalleryLightbox();
    initSurpriseFeature();
  });

})();

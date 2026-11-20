/**
 * SRI SHANANMATHI'S BIRTHDAY CELEBRATION
 * Manual Click-to-Advance Navigation, In-Place Polaroid Memory Customization (Text Preserved),
 * Instagram-Style Profile Photo Customization, User-Customizable Birthday Letter,
 * Custom Music Studio & Background Particles.
 */

(function () {
  'use strict';

  // --- Presentation Configuration ---
  const SLIDES = [
    { id: 'home', name: 'Home', title: 'Happy Birthday' },
    { id: 'wishes', name: 'Wishes', title: 'Heartfelt Birthday Wishes' },
    { id: 'memories', name: 'Memories', title: 'Polaroid Memories' },
    { id: 'about', name: 'About', title: 'About' },
    { id: 'surprise', name: 'Surprise', title: 'Special Birthday Surprise' }
  ];

  let currentSlideIndex = 0;
  let isAutoPlayActive = false; // Stopped by default! User must click next
  let autoPlayTimer = null;
  const AUTO_DURATION = 9000;

  // --- DOM Elements ---
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
  const musicChangeBtn = document.getElementById('music-change-btn');
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');

  // ===================================================================
  // 0. DUAL-MODE DETECTION & NAME/DOB SYNCHRONIZATION
  // ===================================================================
  const NAME_STORAGE_KEY = 'sri_birthday_custom_name';
  const DOB_STORAGE_KEY = 'sri_birthday_custom_dob';
  let currentCelebrationName = 'Sri Shananmathi';
  let currentCelebrationDob = '21 November 2007';
  let isViewerMode = false;

  function initModeAndName() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check viewer mode: ?view=1 or ?mode=view or hash #view
    if (urlParams.get('view') === '1' || urlParams.get('mode') === 'view' || window.location.hash === '#view') {
      isViewerMode = true;
      document.body.classList.add('viewer-mode');
    }

    // Name priority: 1) URL param (n or name), 2) localStorage, 3) default
    const urlName = urlParams.get('n') || urlParams.get('name');
    const savedName = localStorage.getItem(NAME_STORAGE_KEY);
    if (urlName) {
      currentCelebrationName = decodeURIComponent(urlName).trim();
    } else if (savedName) {
      currentCelebrationName = savedName.trim();
    }

    // DOB priority: 1) URL param, 2) localStorage, 3) default
    const urlDob = urlParams.get('dob');
    const savedDob = localStorage.getItem(DOB_STORAGE_KEY);
    if (urlDob) {
      currentCelebrationDob = decodeURIComponent(urlDob).trim();
    } else if (savedDob) {
      currentCelebrationDob = savedDob.trim();
    }

    applyCelebrationNameAndDob(currentCelebrationName, currentCelebrationDob);
  }

  function applyCelebrationNameAndDob(name, dob) {
    currentCelebrationName = name;
    currentCelebrationDob = dob;

    // Update document title
    document.title = `Happy Birthday ${name}! ✨ Royal Birthday Celebration`;
    const pageTitleEl = document.getElementById('page-title');
    if (pageTitleEl) pageTitleEl.textContent = document.title;

    // Update all elements with class .birthday-person-name
    document.querySelectorAll('.birthday-person-name').forEach(el => {
      el.textContent = name;
    });

    // Update all elements with class .birthday-dob-text
    document.querySelectorAll('.birthday-dob-text').forEach(el => {
      el.textContent = dob;
    });

    // Update cake hint if wish was already granted
    const hint = document.getElementById('cake-hint-text');
    if (hint && hint.textContent.includes('Wish Granted')) {
      hint.textContent = `🎉 Happy Birthday ${name}! Wish Granted!`;
    }

    // Update inputs in modals if they exist
    const nameInput = document.getElementById('custom-name-input');
    if (nameInput) nameInput.value = name;
    const dobInput = document.getElementById('custom-dob-input');
    if (dobInput) dobInput.value = dob;
  }

  // ===================================================================
  // 1. MANUAL PAGE NAVIGATION (STOPPED RUNNING PAGE LOAD)
  // ===================================================================
  function initPresentation() {
    if (!isPresentationMode || sections.length === 0) return;

    // Check URL hash
    const hash = window.location.hash.replace('#', '');
    const foundIndex = SLIDES.findIndex(s => s.id === hash);
    if (foundIndex !== -1) {
      currentSlideIndex = foundIndex;
    }

    goToSlide(currentSlideIndex);

    // Manual Next / Prev Buttons
    if (nextBtn) {
      nextBtn.addEventListener('click', () => nextSlide());
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', () => prevSlide());
    }

    // Optional Autoplay button if user explicitly wants to turn it on
    if (autoPlayToggleBtn) {
      autoPlayToggleBtn.addEventListener('click', toggleAutoPlay);
    }

    // Keyboard navigation (Strict guard to prevent slide jumping during editing or modals)
    document.addEventListener('keydown', (e) => {
      // Check if typing inside any form field, contenteditable, or card container
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.tagName === 'SELECT' ||
        e.target.isContentEditable ||
        (e.target.closest && (
          e.target.closest('[contenteditable="true"]') ||
          e.target.closest('.royal-proclamation-card') ||
          e.target.closest('.name-modal-card') ||
          e.target.closest('.music-studio-card') ||
          e.target.closest('.share-modal-card') ||
          e.target.closest('.polaroid-card')
        ))
      ) {
        return;
      }

      // Block keyboard slide navigation if ANY modal is currently open
      const anyModalOpen = document.querySelector(
        '.name-customizer-modal.active, .music-studio-modal.active, .surprise-card-reveal.active, .lightbox-modal.active, .share-modal.active'
      );
      if (anyModalOpen) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        prevSlide();
      }
    });

    // Touch swipe navigation with strict filtering (prevents vertical scrolling or text selection from jumping slides)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let isTouchValid = false;

    document.addEventListener('touchstart', (e) => {
      if (!e.touches || e.touches.length !== 1) {
        isTouchValid = false;
        return;
      }
      // Ignore swipe if inside editable element, modal, card, or button
      if (
        (e.target.closest && (
          e.target.closest('[contenteditable="true"]') ||
          e.target.closest('input, textarea, select, button, a') ||
          e.target.closest('.name-customizer-modal, .music-studio-modal, .surprise-card-reveal, .lightbox-modal, .share-modal, .royal-proclamation-card, .polaroid-card')
        ))
      ) {
        isTouchValid = false;
        return;
      }
      isTouchValid = true;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      if (!isTouchValid || !e.changedTouches || e.changedTouches.length === 0) return;
      const touch = e.changedTouches[0];
      const diffX = touchStartX - touch.clientX;
      const diffY = touchStartY - touch.clientY;
      const duration = Date.now() - touchStartTime;

      // Must be a quick, deliberate horizontal swipe:
      // - Under 500ms
      // - Horizontal distance > 85px
      // - Horizontal distance > 2.5x vertical distance (to never trigger on vertical scrolling)
      if (duration < 500 && Math.abs(diffX) > 85 && Math.abs(diffX) > Math.abs(diffY) * 2.5) {
        if (diffX > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
      isTouchValid = false;
    }, { passive: true });

    // Hash sync
    window.addEventListener('hashchange', () => {
      const h = window.location.hash.replace('#', '');
      const idx = SLIDES.findIndex(s => s.id === h);
      if (idx !== -1 && idx !== currentSlideIndex) {
        goToSlide(idx);
      }
    });
  }

  function goToSlide(index) {
    if (index < 0) index = SLIDES.length - 1;
    if (index >= SLIDES.length) index = 0;

    currentSlideIndex = index;
    const currentSlide = SLIDES[index];

    // Update section active state
    sections.forEach((sec, idx) => {
      if (idx === index) {
        sec.classList.add('active');
      } else {
        sec.classList.remove('active');
      }
    });

    // Synchronize Top Navbar links
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      const targetId = href ? href.split('#')[1] || href.replace('.html', '') : '';
      if (targetId === currentSlide.id) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update Bottom Dock Slide Progress & Indicators
    if (slideCounter) {
      slideCounter.textContent = `0${index + 1} / 0${SLIDES.length}`;
    }
    if (slideTitleLabel) {
      slideTitleLabel.textContent = `• ${currentSlide.name}`;
    }
    if (progressBar) {
      const pct = ((index + 1) / SLIDES.length) * 100;
      progressBar.style.width = `${pct}%`;
    }

    // Update URL hash smoothly
    if (history.replaceState) {
      history.replaceState(null, null, `#${currentSlide.id}`);
    }

    // Scroll to top of section smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Slide specific effects
    if (currentSlide.id === 'surprise') {
      createSparkleBurst(window.innerWidth / 2, window.innerHeight / 2, 25);
    }

    // If autoplay was explicitly enabled by user, queue next
    if (isAutoPlayActive) {
      clearTimeout(autoPlayTimer);
      autoPlayTimer = setTimeout(() => {
        if (isAutoPlayActive) nextSlide();
      }, AUTO_DURATION);
    }
  }

  function nextSlide() {
    goToSlide(currentSlideIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentSlideIndex - 1);
  }

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

  // Explore Button Link Handler
  const exploreBtn = document.getElementById('explore-btn');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', (e) => {
      if (isPresentationMode) {
        e.preventDefault();
        goToSlide(1);
        if (!audioEngine.isPlaying) {
          audioEngine.start();
        }
      }
    });
  }

  // Navbar Links click handler for Presentation Mode
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (isPresentationMode && href && href.includes('#')) {
        e.preventDefault();
        const targetId = href.split('#')[1];
        const idx = SLIDES.findIndex(s => s.id === targetId);
        if (idx !== -1) {
          goToSlide(idx);
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
  // 2. PAGE 4 MEMORIES: IN-PLACE PHOTO REPLACEMENT (TEXT PRESERVED)
  // & GALLERY UPLOADER (ALL IMAGE FORMATS SUPPORTED)
  // ===================================================================
  const GALLERY_STORAGE_KEY = 'sri_shananmathi_custom_gallery';
  const MEMORY_CARD_PREFIX = 'sri_memory_card_img_';

  function initPhotoUploaders() {
    // Gallery Elements
    const galleryUploadBtn = document.getElementById('upload-gallery-photo-btn');
    const galleryFileInput = document.getElementById('gallery-file-input');
    const galleryGrid = document.querySelector('.gallery-grid');

    // Load saved gallery photos
    loadSavedGalleryPhotos();

    // Gallery File Input trigger
    if (galleryUploadBtn && galleryFileInput) {
      galleryUploadBtn.addEventListener('click', () => galleryFileInput.click());
      galleryFileInput.addEventListener('change', (e) => {
        handleGalleryImageUpload(e.target.files);
        galleryFileInput.value = '';
      });
    }

    if (galleryGrid) {
      galleryGrid.addEventListener('dragover', (e) => {
        e.preventDefault();
        galleryGrid.style.borderColor = '#ffd700';
      });
      galleryGrid.addEventListener('dragleave', () => {
        galleryGrid.style.borderColor = '';
      });
      galleryGrid.addEventListener('drop', (e) => {
        e.preventDefault();
        galleryGrid.style.borderColor = '';
        if (e.dataTransfer && e.dataTransfer.files.length > 0) {
          handleGalleryImageUpload(e.dataTransfer.files);
        }
      });
    }

    // Setup In-Place Polaroid Memory Photo Replacement
    setupPolaroidCardUploaders();
  }

  function handleGalleryImageUpload(files) {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        addGalleryItem(dataUrl, true);
        saveCustomPhoto(GALLERY_STORAGE_KEY, { url: dataUrl });
        launchConfetti(40);
      };
      reader.readAsDataURL(file);
    });
  }

  function addGalleryItem(src, isCustom = false) {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;

    const item = document.createElement('div');
    item.className = 'gallery-item';

    let deleteBtnHtml = '';
    if (isCustom) {
      deleteBtnHtml = `<button class="photo-delete-btn" title="Remove Photo">✕</button>`;
    }

    item.innerHTML = `
      ${deleteBtnHtml}
      <img src="${src}" alt="Celebration Photo">
      <div class="gallery-overlay">
        <span class="gallery-zoom-icon">🔍</span>
      </div>
    `;

    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('photo-delete-btn')) {
        e.stopPropagation();
        if (confirm('Remove this photo from gallery?')) {
          item.remove();
          removeCustomPhoto(GALLERY_STORAGE_KEY, src);
        }
        return;
      }
      openLightbox(src);
    });

    galleryGrid.prepend(item);
  }

  function saveCustomPhoto(key, item) {
    try {
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.unshift(item);
      if (existing.length > 20) existing.pop();
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (err) {
      console.warn('LocalStorage quota reached:', err);
    }
  }

  function removeCustomPhoto(key, src) {
    try {
      let existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing = existing.filter(x => x.url !== src);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (err) {
      console.warn(err);
    }
  }

  function loadSavedGalleryPhotos() {
    try {
      const saved = JSON.parse(localStorage.getItem(GALLERY_STORAGE_KEY) || '[]');
      saved.reverse().forEach(p => addGalleryItem(p.url, true));
    } catch (e) { /* ignore */ }
  }

  /**
   * Page 4 Memories: Click on ANY polaroid photo frame to customize the photo,
   * WHILE KEEPING THE TEXT DOWN THE IMAGE 100% UNCHANGED!
   */
  function setupPolaroidCardUploaders() {
    const memoryCards = document.querySelectorAll('.polaroid-card:not(.add-memory-card)');
    const singleFileInput = document.createElement('input');
    singleFileInput.type = 'file';
    singleFileInput.accept = 'image/*';
    singleFileInput.style.display = 'none';
    document.body.appendChild(singleFileInput);

    let activeCardIndex = null;
    let activeCardImg = null;
    let activeResetBtn = null;

    memoryCards.forEach((card, idx) => {
      const cardId = idx + 1;
      const photoFrame = card.querySelector('.polaroid-photo-frame');
      const img = photoFrame ? photoFrame.querySelector('img') : null;
      if (!photoFrame || !img) return;

      const originalSrc = img.src;

      // Add hover overlay indicating click to change photo
      if (!photoFrame.querySelector('.polaroid-change-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'polaroid-change-overlay';
        overlay.innerHTML = `<span>📷 Click to Change Photo</span>`;
        photoFrame.appendChild(overlay);
      }

      // Add reset button
      let resetBtn = photoFrame.querySelector('.polaroid-reset-photo-btn');
      if (!resetBtn) {
        resetBtn = document.createElement('button');
        resetBtn.className = 'polaroid-reset-photo-btn';
        resetBtn.title = 'Reset to default illustration';
        resetBtn.innerHTML = '↺';
        resetBtn.style.display = 'none';
        photoFrame.appendChild(resetBtn);
      }

      // Check LocalStorage for previously saved custom photo for this card
      const savedCustomImg = localStorage.getItem(MEMORY_CARD_PREFIX + cardId);
      if (savedCustomImg) {
        img.src = savedCustomImg;
        resetBtn.style.display = 'flex';
      }

      // Clicking photo frame triggers file upload for THIS specific card
      photoFrame.addEventListener('click', (e) => {
        if (e.target === resetBtn) {
          e.stopPropagation();
          img.src = originalSrc;
          resetBtn.style.display = 'none';
          localStorage.removeItem(MEMORY_CARD_PREFIX + cardId);
          return;
        }

        activeCardIndex = cardId;
        activeCardImg = img;
        activeResetBtn = resetBtn;
        singleFileInput.click();
      });
    });

    singleFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0] && activeCardImg) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (evt) => {
          const dataUrl = evt.target.result;
          activeCardImg.src = dataUrl;
          if (activeResetBtn) activeResetBtn.style.display = 'flex';
          try {
            localStorage.setItem(MEMORY_CARD_PREFIX + activeCardIndex, dataUrl);
          } catch (err) {
            console.warn('LocalStorage error:', err);
          }
          launchConfetti(45);
        };
        reader.readAsDataURL(file);
      }
      singleFileInput.value = '';
    });

    // Also support "Add Memory" card if clicked
    const addMemoryCard = document.getElementById('add-memory-card');
    const memoryFileInput = document.getElementById('memory-file-input');
    const uploadMemoryBtn = document.getElementById('upload-memory-photo-btn');

    if (memoryFileInput) {
      if (addMemoryCard) addMemoryCard.addEventListener('click', () => memoryFileInput.click());
      if (uploadMemoryBtn) uploadMemoryBtn.addEventListener('click', () => memoryFileInput.click());

      memoryFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (evt) => {
            const dataUrl = evt.target.result;
            // Add as new polaroid with default sweet caption
            addNewCustomPolaroid(dataUrl, 'Golden Moments', 'Laughter and happiness that shine forever.');
            launchConfetti(50);
          };
          reader.readAsDataURL(file);
        }
        memoryFileInput.value = '';
      });
    }
  }

  function addNewCustomPolaroid(src, title, quote) {
    const polaroidGrid = document.querySelector('.polaroid-grid');
    if (!polaroidGrid) return;

    const card = document.createElement('div');
    card.className = 'polaroid-card';
    card.innerHTML = `
      <button class="photo-delete-btn" style="top:12px;right:12px;" title="Remove Memory">✕</button>
      <div class="polaroid-photo-frame">
        <img src="${src}" alt="${title}">
      </div>
      <div class="polaroid-caption">
        <h4>${title}</h4>
        <p>${quote}</p>
      </div>
    `;

    card.querySelector('.photo-delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      card.remove();
    });

    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('photo-delete-btn')) return;
      openLightbox(src, title, quote);
    });

    const addCard = document.getElementById('add-memory-card');
    if (addCard && addCard.nextSibling) {
      polaroidGrid.insertBefore(card, addCard.nextSibling);
    } else {
      polaroidGrid.prepend(card);
    }
  }

  // ===================================================================
  // 3. PAGE 5: INSTAGRAM-STYLE PROFILE PHOTO CUSTOMIZATION
  // ===================================================================
  const PROFILE_PHOTO_STORAGE_KEY = 'sri_shananmathi_custom_profile_photo';

  function initInstagramProfileCustomizer() {
    const profileTrigger = document.getElementById('profile-avatar-trigger');
    const profileImg = document.getElementById('profile-avatar-img');
    const profileFileInput = document.getElementById('profile-photo-input');
    const uploadProfileBtn = document.getElementById('upload-profile-photo-btn');
    const resetProfileBtn = document.getElementById('reset-profile-photo-btn');

    if (!profileImg) return;

    const originalSrc = profileImg.src;

    // Load saved profile photo from localStorage
    const savedProfilePhoto = localStorage.getItem(PROFILE_PHOTO_STORAGE_KEY);
    if (savedProfilePhoto) {
      profileImg.src = savedProfilePhoto;
      if (resetProfileBtn) resetProfileBtn.style.display = 'inline-block';
    }

    function triggerPhotoPicker() {
      if (profileFileInput) profileFileInput.click();
    }

    if (profileTrigger) profileTrigger.addEventListener('click', triggerPhotoPicker);
    if (uploadProfileBtn) uploadProfileBtn.addEventListener('click', triggerPhotoPicker);

    if (profileFileInput) {
      profileFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (evt) => {
            const dataUrl = evt.target.result;
            profileImg.src = dataUrl;
            if (resetProfileBtn) resetProfileBtn.style.display = 'inline-block';
            try {
              localStorage.setItem(PROFILE_PHOTO_STORAGE_KEY, dataUrl);
            } catch (err) {
              console.warn(err);
            }
            launchConfetti(60);
          };
          reader.readAsDataURL(file);
        }
        profileFileInput.value = '';
      });
    }

    if (resetProfileBtn) {
      resetProfileBtn.addEventListener('click', () => {
        profileImg.src = originalSrc;
        resetProfileBtn.style.display = 'none';
        localStorage.removeItem(PROFILE_PHOTO_STORAGE_KEY);
      });
    }
  }

  // ===================================================================
  // 4. PAGE 6: USER CUSTOMIZABLE BIRTHDAY LETTER
  // ===================================================================
  const LETTER_STORAGE_KEY = 'sri_shananmathi_custom_letter';

  function initLetterCustomizer() {
    const editBtn = document.getElementById('edit-letter-btn');
    const saveBtn = document.getElementById('save-letter-btn');
    const resetBtn = document.getElementById('reset-letter-btn');
    const letterCard = document.querySelector('.royal-proclamation-card');

    const greetingEl = document.getElementById('proclamation-greeting');
    const subtitleEl = document.getElementById('proclamation-subtitle');
    const bodyEl = document.getElementById('proclamation-body');
    const signoffEl = document.getElementById('proclamation-signoff');

    if (!letterCard || !bodyEl) return;

    // Default template backup
    const defaultData = {
      greeting: greetingEl ? greetingEl.innerHTML : 'Dearest Sri Shananmathi,',
      subtitle: subtitleEl ? subtitleEl.innerHTML : 'A Special Message • 21 November 2007',
      body: bodyEl.innerHTML,
      signoff: signoffEl ? signoffEl.innerHTML : 'Happy Birthday, Sri Shananmathi! 🎂✨💖'
    };

    // Load saved custom letter (from URL param or localStorage)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      let saved = null;
      if (urlParams.get('l')) {
        saved = JSON.parse(decodeURIComponent(urlParams.get('l')));
      } else {
        saved = JSON.parse(localStorage.getItem(LETTER_STORAGE_KEY));
      }

      if (saved) {
        if (greetingEl && saved.greeting) greetingEl.innerHTML = saved.greeting;
        if (subtitleEl && saved.subtitle) subtitleEl.innerHTML = saved.subtitle;
        if (bodyEl && saved.body) bodyEl.innerHTML = saved.body;
        if (signoffEl && saved.signoff) signoffEl.innerHTML = saved.signoff;
        if (resetBtn) resetBtn.style.display = 'inline-flex';
      } else if (currentCelebrationName !== 'Sri Shananmathi') {
        if (greetingEl) greetingEl.innerHTML = `Dearest <span class="birthday-person-name">${currentCelebrationName}</span>,`;
        if (signoffEl) signoffEl.innerHTML = `Happy Birthday, <span class="birthday-person-name">${currentCelebrationName}</span>! 🎂✨💖`;
      }
    } catch (e) { /* ignore */ }

    // Toggle Edit Mode
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        setLetterEditable(true);
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        setLetterEditable(false);
        // Save to LocalStorage
        const currentData = {
          greeting: greetingEl ? greetingEl.innerHTML : '',
          subtitle: subtitleEl ? subtitleEl.innerHTML : '',
          body: bodyEl.innerHTML,
          signoff: signoffEl ? signoffEl.innerHTML : ''
        };
        try {
          localStorage.setItem(LETTER_STORAGE_KEY, JSON.stringify(currentData));
        } catch (err) {
          console.warn(err);
        }
        if (resetBtn) resetBtn.style.display = 'inline-flex';
        launchConfetti(50);
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Restore the original birthday letter?')) {
          if (greetingEl) greetingEl.innerHTML = defaultData.greeting;
          if (subtitleEl) subtitleEl.innerHTML = defaultData.subtitle;
          bodyEl.innerHTML = defaultData.body;
          if (signoffEl) signoffEl.innerHTML = defaultData.signoff;
          localStorage.removeItem(LETTER_STORAGE_KEY);
          resetBtn.style.display = 'none';
          setLetterEditable(false);
        }
      });
    }

    function setLetterEditable(editable) {
      const elements = [greetingEl, subtitleEl, bodyEl, signoffEl].filter(Boolean);
      elements.forEach(el => {
        el.contentEditable = editable ? 'true' : 'false';
      });

      const hintEl = document.getElementById('letter-editing-hint');

      if (editable) {
        if (editBtn) editBtn.style.display = 'none';
        if (saveBtn) saveBtn.style.display = 'inline-flex';
        if (resetBtn) resetBtn.style.display = 'inline-flex';
        if (hintEl) hintEl.style.display = 'inline-block';
        if (bodyEl) bodyEl.focus();
      } else {
        if (editBtn) editBtn.style.display = 'inline-flex';
        if (saveBtn) saveBtn.style.display = 'none';
        if (hintEl) hintEl.style.display = 'none';
      }
    }
  }

  // ===================================================================
  // 5. MUSIC STUDIO: CUSTOM SONG UPLOADER & MELODY CHANGER (WITH INDEXEDDB PERSISTENCE)
  // ===================================================================

  // IndexedDB Helper for Storing Large Custom Audio Files
  const AudioStorage = {
    DB_NAME: 'SriBirthdayAudioDB',
    STORE_NAME: 'audio_tracks',
    DB_VERSION: 1,

    openDB() {
      return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
          return reject(new Error('IndexedDB not supported'));
        }
        const req = indexedDB.open(this.DB_NAME, this.DB_VERSION);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(this.STORE_NAME)) {
            db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    },

    async saveTrack(id, dataUrl, name) {
      try {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
          const tx = db.transaction(this.STORE_NAME, 'readwrite');
          const store = tx.objectStore(this.STORE_NAME);
          store.put({ id, dataUrl, name, updatedAt: Date.now() });
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => reject(tx.error);
        });
      } catch (err) {
        console.warn('AudioStorage save failed:', err);
        return false;
      }
    },

    async getTrack(id) {
      try {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
          const tx = db.transaction(this.STORE_NAME, 'readonly');
          const store = tx.objectStore(this.STORE_NAME);
          const req = store.get(id);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => reject(req.error);
        });
      } catch (err) {
        console.warn('AudioStorage get failed:', err);
        return null;
      }
    },

    async deleteTrack(id) {
      try {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
          const tx = db.transaction(this.STORE_NAME, 'readwrite');
          const store = tx.objectStore(this.STORE_NAME);
          store.delete(id);
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => reject(tx.error);
        });
      } catch (err) {
        console.warn('AudioStorage delete failed:', err);
        return false;
      }
    }
  };

  class BirthdayAudioEngine {
    constructor() {
      this.ctx = null;
      this.isPlaying = false;
      this.currentTimeout = null;
      this.tempo = 145;
      this.volume = 0.8;
      this.currentPreset = 'chimes';

      // Use the audio element in DOM or fallback
      this.customAudio = document.getElementById('main-custom-audio') || new Audio();
      this.customAudio.loop = true;
      this.customAudioName = '';

      this.customAudio.addEventListener('ended', () => {
        if (this.isPlaying && this.currentPreset === 'custom') {
          this.customAudio.currentTime = 0;
          this.customAudio.play().catch(e => console.log('Audio loop prevented:', e));
        }
      });

      this.customAudio.addEventListener('play', () => {
        this.updateCustomSongUI(true);
      });

      this.customAudio.addEventListener('pause', () => {
        this.updateCustomSongUI(false);
      });

      // Load previously saved song from IndexedDB
      this.loadPersistedAudio();
    }

    async loadPersistedAudio() {
      try {
        const saved = await AudioStorage.getTrack('custom_song');
        if (saved && saved.dataUrl) {
          this.customAudio.src = saved.dataUrl;
          this.customAudio.volume = this.volume;
          this.customAudioName = saved.name || 'Custom Song';
          this.currentPreset = 'custom'; // ← critical: tell engine to use custom audio on play
          this.showCustomSongBox(this.customAudioName);
          const songLabel = document.getElementById('current-song-label');
          if (songLabel) {
            songLabel.textContent = `🎵 Custom: ${this.customAudioName}`;
          }
          // Also mark custom preset item as active in Music Studio UI if open
          const presetItems = document.querySelectorAll('.track-preset-item');
          presetItems.forEach(p => p.classList.remove('active'));
        }
      } catch (err) {
        console.warn('Could not restore persisted audio:', err);
      }
    }

    showCustomSongBox(name) {
      const box = document.getElementById('custom-song-status-box');
      const title = document.getElementById('custom-song-title-text');
      if (box && title) {
        title.textContent = name;
        box.style.display = 'flex';
      }
    }

    hideCustomSongBox() {
      const box = document.getElementById('custom-song-status-box');
      if (box) box.style.display = 'none';
    }

    updateCustomSongUI(isPlaying) {
      const testBtn = document.getElementById('custom-song-play-test-btn');
      if (testBtn) {
        testBtn.textContent = isPlaying ? '⏸ Pause Song' : '▶ Play Song';
      }
      this.updateUI(isPlaying);
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

      if (this.currentPreset === 'piano') {
        osc.type = 'triangle';
        osc2.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc2.frequency.setValueAtTime(freq * 0.5, now);
        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.linearRampToValueAtTime(vol * 1.2, now + 0.04);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration + 0.9);
      } else if (this.currentPreset === 'harp') {
        osc.type = 'sine';
        osc2.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc2.frequency.setValueAtTime(freq * 3, now);
        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.linearRampToValueAtTime(vol * 1.1, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration + 1.2);
      } else if (this.currentPreset === 'lullaby') {
        osc.type = 'sine';
        osc2.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc2.frequency.setValueAtTime(freq * 2, now);
        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.linearRampToValueAtTime(vol * 0.9, now + 0.06);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration + 1.0);
      } else {
        osc.type = 'sine';
        osc2.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc2.frequency.setValueAtTime(freq * 2.02, now);
        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.linearRampToValueAtTime(vol, now + 0.03);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration + 0.7);
      }

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
      clearTimeout(this.currentTimeout);

      if (this.currentPreset === 'custom' && this.customAudio && this.customAudio.src) {
        this.customAudio.volume = this.volume;
        this.customAudio.play().then(() => {
          this.updateUI(true);
          this.updateCustomSongUI(true);
        }).catch(e => {
          console.warn('Audio playback prevented:', e);
          this.updateUI(false);
          this.updateCustomSongUI(false);
        });
      } else {
        if (this.customAudio) {
          this.customAudio.pause();
        }
        this.initContext();
        this.playSequence(0);
        this.updateUI(true);
      }
    }

    playSequence(index) {
      if (!this.isPlaying || this.currentPreset === 'custom') return;

      const melody = this.getMelody();
      const notes = this.getNotes();

      if (index >= melody.length) index = 0;

      const item = melody[index];
      const freq = notes[item.note] || 0;
      const beatDurationSec = 60 / this.tempo;
      const duration = item.dur * beatDurationSec;

      if (freq > 0) {
        this.playNote(freq, duration);
      }

      this.currentTimeout = setTimeout(() => {
        if (this.isPlaying && this.currentPreset !== 'custom') {
          this.playSequence(index + 1);
        }
      }, duration * 1000);
    }

    stop() {
      this.isPlaying = false;
      clearTimeout(this.currentTimeout);
      if (this.customAudio) {
        this.customAudio.pause();
      }
      this.updateUI(false);
      this.updateCustomSongUI(false);
    }

    toggle() {
      if (this.isPlaying) this.stop();
      else this.start();
    }

    setPreset(preset) {
      this.currentPreset = preset;
      if (preset !== 'custom' && this.customAudio) {
        this.customAudio.pause();
      }
      if (this.isPlaying) {
        clearTimeout(this.currentTimeout);
        this.start();
      }
    }

    loadCustomFile(file) {
      if (!file) return;
      this.stop(); // Stop ongoing synth or audio

      this.customAudioName = file.name;
      this.currentPreset = 'custom';

      // Instant blob URL for immediate playback feedback
      const blobUrl = URL.createObjectURL(file);
      this.customAudio.src = blobUrl;
      this.customAudio.volume = this.volume;
      this.customAudio.load();

      this.showCustomSongBox(file.name);
      const songLabel = document.getElementById('current-song-label');
      if (songLabel) {
        songLabel.textContent = `🎵 Playing: ${file.name}`;
      }

      this.start();

      // Read as DataURL in background and persist in IndexedDB
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target.result;
        await AudioStorage.saveTrack('custom_song', dataUrl, file.name);
      };
      reader.readAsDataURL(file);
    }

    async removeCustomAudio() {
      this.stop();
      if (this.customAudio) {
        this.customAudio.pause();
        this.customAudio.src = '';
      }
      this.customAudioName = '';
      this.currentPreset = 'chimes';
      this.hideCustomSongBox();
      await AudioStorage.deleteTrack('custom_song');

      const songLabel = document.getElementById('current-song-label');
      if (songLabel) {
        songLabel.textContent = '🎵 Playing: Celebration Chimes';
      }
      const presetItems = document.querySelectorAll('.track-preset-item');
      presetItems.forEach(p => {
        if (p.getAttribute('data-preset') === 'chimes') p.classList.add('active');
        else p.classList.remove('active');
      });
    }

    toggleCustomPlayback() {
      if (!this.customAudio.src) return;
      if (this.currentPreset !== 'custom') {
        this.setPreset('custom');
      }
      if (this.customAudio.paused) {
        this.start();
      } else {
        this.stop();
      }
    }

    setVolume(vol) {
      this.volume = Math.max(0, Math.min(1, vol));
      if (this.customAudio) {
        this.customAudio.volume = this.volume;
      }
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

  function initMusicStudio() {
    const musicModal = document.getElementById('music-studio-modal');
    const musicModalClose = document.getElementById('music-studio-close');
    const audioFileInput = document.getElementById('custom-audio-file-input');
    const audioDropZone = document.getElementById('audio-upload-dropzone');
    const presetItems = document.querySelectorAll('.track-preset-item');
    const volumeSlider = document.getElementById('music-volume-slider');
    const customTestBtn = document.getElementById('custom-song-play-test-btn');
    const customRemoveBtn = document.getElementById('custom-song-remove-btn');

    if (musicChangeBtn && musicModal) {
      musicChangeBtn.addEventListener('click', () => {
        musicModal.classList.add('active');
      });
    }

    if (musicModalClose && musicModal) {
      musicModalClose.addEventListener('click', () => {
        musicModal.classList.remove('active');
      });
    }

    if (musicModal) {
      musicModal.addEventListener('click', (e) => {
        if (e.target === musicModal) musicModal.classList.remove('active');
      });
    }

    if (audioDropZone && audioFileInput) {
      audioDropZone.addEventListener('click', () => audioFileInput.click());

      audioDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        audioDropZone.style.borderColor = '#ffd700';
      });

      audioDropZone.addEventListener('dragleave', () => {
        audioDropZone.style.borderColor = '';
      });

      audioDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        audioDropZone.style.borderColor = '';
        if (e.dataTransfer && e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          audioEngine.loadCustomFile(file);
          presetItems.forEach(p => p.classList.remove('active'));
        }
      });

      audioFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          audioEngine.loadCustomFile(e.target.files[0]);
          presetItems.forEach(p => p.classList.remove('active'));
        }
      });
    }

    // Play/Pause test button for uploaded custom song
    if (customTestBtn) {
      customTestBtn.addEventListener('click', () => {
        audioEngine.toggleCustomPlayback();
      });
    }

    // Remove custom song button
    if (customRemoveBtn) {
      customRemoveBtn.addEventListener('click', () => {
        audioEngine.removeCustomAudio();
      });
    }

    presetItems.forEach(item => {
      item.addEventListener('click', () => {
        presetItems.forEach(p => p.classList.remove('active'));
        item.classList.add('active');
        const preset = item.getAttribute('data-preset');
        audioEngine.setPreset(preset);

        const songLabel = document.getElementById('current-song-label');
        if (songLabel) {
          songLabel.textContent = `🎵 Playing: ${item.querySelector('.track-name').textContent.trim()}`;
        }
      });
    });

    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        audioEngine.setVolume(parseFloat(e.target.value));
      });
    }
  }

  // ===================================================================
  // 6. BACKGROUND PARTICLES CANVAS
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
  // 7. CONFETTI CANNON SYSTEM
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
  // 8. INTERACTIVE BIRTHDAY CAKE & CANDLE
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
          ? `🎉 Happy Birthday ${currentCelebrationName}! Wish Granted!` 
          : "✨ Click the cake again to send more wishes!";
      }
    });
  }

  // ===================================================================
  // 9. PHOTO GALLERY & LIGHTBOX (CLEAN - NO FILENAME MENTIONED)
  // ===================================================================
  function initGalleryLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxClose = document.getElementById('lightbox-close');

    if (!lightboxModal) return;

    galleryItems.forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.classList.contains('photo-delete-btn')) return;
        const img = item.querySelector('img');
        if (img) openLightbox(img.src);
      });
    });

    function closeLightbox() {
      lightboxModal.classList.remove('active');
    }

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }

    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

  function openLightbox(src) {
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxSubcaption = document.getElementById('lightbox-subcaption');

    if (!lightboxModal || !lightboxImg) return;

    lightboxImg.src = src;
    lightboxImg.alt = 'Celebration Moment';
    if (lightboxCaption) lightboxCaption.textContent = '';
    if (lightboxSubcaption) lightboxSubcaption.textContent = '';

    lightboxModal.classList.add('active');
  }

  // ===================================================================
  // 10. SPECIAL SURPRISE GIFT BOX
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
  // 11. NAME & DATE OF BIRTH CUSTOMIZER
  // ===================================================================
  function initNameCustomizer() {
    const editNameBtn = document.getElementById('edit-name-btn');
    const heroNameEditBtn = document.getElementById('hero-name-edit-btn');
    const nameModal = document.getElementById('name-modal');
    const nameModalClose = document.getElementById('name-modal-close');
    const saveNameBtn = document.getElementById('save-name-btn');
    const nameInput = document.getElementById('custom-name-input');
    const dobInput = document.getElementById('custom-dob-input');

    function openNameModal() {
      if (nameModal) {
        if (nameInput) nameInput.value = currentCelebrationName;
        if (dobInput) dobInput.value = currentCelebrationDob;
        nameModal.classList.add('active');
        if (nameInput) setTimeout(() => nameInput.focus(), 150);
      }
    }

    function closeNameModal() {
      if (nameModal) nameModal.classList.remove('active');
    }

    if (editNameBtn) editNameBtn.addEventListener('click', openNameModal);
    if (heroNameEditBtn) heroNameEditBtn.addEventListener('click', openNameModal);
    if (nameModalClose) nameModalClose.addEventListener('click', closeNameModal);

    if (nameModal) {
      nameModal.addEventListener('click', (e) => {
        if (e.target === nameModal) closeNameModal();
      });
    }

    if (saveNameBtn) {
      saveNameBtn.addEventListener('click', () => {
        const newName = nameInput ? nameInput.value.trim() : '';
        const newDob = dobInput ? dobInput.value.trim() : '';

        if (!newName) {
          alert('Please enter a celebration name!');
          return;
        }

        applyCelebrationNameAndDob(newName, newDob || currentCelebrationDob);
        try {
          localStorage.setItem(NAME_STORAGE_KEY, newName);
          if (newDob) localStorage.setItem(DOB_STORAGE_KEY, newDob);
        } catch (e) {
          console.warn(e);
        }

        closeNameModal();
        launchConfetti(80);
      });
    }
  }

  // ===================================================================
  // 12. DEDICATED SAVE BUTTON & SHARE LINK GENERATOR
  // ===================================================================
  function saveAllEdits() {
    // 1. Current name & DOB
    try {
      localStorage.setItem(NAME_STORAGE_KEY, currentCelebrationName);
      localStorage.setItem(DOB_STORAGE_KEY, currentCelebrationDob);
    } catch (e) {}

    // 2. Birthday letter
    const greetingEl = document.getElementById('proclamation-greeting');
    const subtitleEl = document.getElementById('proclamation-subtitle');
    const bodyEl = document.getElementById('proclamation-body');
    const signoffEl = document.getElementById('proclamation-signoff');
    if (bodyEl) {
      const letterData = {
        greeting: greetingEl ? greetingEl.innerHTML : '',
        subtitle: subtitleEl ? subtitleEl.innerHTML : '',
        body: bodyEl.innerHTML,
        signoff: signoffEl ? signoffEl.innerHTML : ''
      };
      try {
        localStorage.setItem(LETTER_STORAGE_KEY, JSON.stringify(letterData));
      } catch (e) {}
    }

    // Visual feedback on save buttons
    const saveLabel = document.getElementById('save-btn-label');
    const saveIcon = document.getElementById('save-btn-icon');
    if (saveLabel) saveLabel.textContent = 'Saved!';
    if (saveIcon) saveIcon.textContent = '✅';

    const bannerSave = document.getElementById('banner-save-btn');
    if (bannerSave) bannerSave.innerHTML = '<span>✅ Saved!</span>';

    showToast('💾 All changes and photos saved successfully!');
    launchConfetti(60);

    setTimeout(() => {
      if (saveLabel) saveLabel.textContent = 'Save';
      if (saveIcon) saveIcon.textContent = '💾';
      if (bannerSave) bannerSave.innerHTML = '<span>💾 Save</span>';
    }, 2500);
  }

  function initShareModal() {
    const navSaveBtn = document.getElementById('nav-save-btn');
    const bannerSaveBtn = document.getElementById('banner-save-btn');

    const navShareBtn = document.getElementById('nav-share-btn');
    const bannerShareBtn = document.getElementById('banner-share-btn');
    const oldShareBtn = document.getElementById('save-and-share-btn');

    const shareModal = document.getElementById('share-modal');
    const shareModalClose = document.getElementById('share-modal-close');
    const shareLinkInput = document.getElementById('share-link-input');
    const copyBtn = document.getElementById('copy-share-link-btn');
    const copyBtnText = document.getElementById('copy-btn-text');
    const previewLink = document.getElementById('preview-receiver-link');
    const whatsappBtn = document.getElementById('whatsapp-share-btn');

    // Attach save handlers
    if (navSaveBtn) navSaveBtn.addEventListener('click', saveAllEdits);
    if (bannerSaveBtn) bannerSaveBtn.addEventListener('click', saveAllEdits);

    function generateShareUrl() {
      const url = new URL(window.location.href);
      url.search = '';
      url.hash = '';

      url.searchParams.set('view', '1');
      if (currentCelebrationName) {
        url.searchParams.set('n', currentCelebrationName);
      }
      if (currentCelebrationDob && currentCelebrationDob !== '21 November 2007') {
        url.searchParams.set('dob', currentCelebrationDob);
      }

      // Encode custom letter if any
      try {
        const savedLetter = localStorage.getItem(LETTER_STORAGE_KEY);
        if (savedLetter) {
          url.searchParams.set('l', encodeURIComponent(savedLetter));
        }
      } catch (e) {}

      return url.toString();
    }

    function openShare() {
      saveAllEdits();
      const shareUrl = generateShareUrl();
      if (shareLinkInput) shareLinkInput.value = shareUrl;
      if (previewLink) previewLink.href = shareUrl;
      if (whatsappBtn) {
        const text = `👑 A magical royal birthday celebration curated for ${currentCelebrationName}! Open your surprise here: ${shareUrl}`;
        whatsappBtn.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      }
      if (shareModal) shareModal.classList.add('active');
      launchConfetti(90);
    }

    if (navShareBtn) navShareBtn.addEventListener('click', openShare);
    if (bannerShareBtn) bannerShareBtn.addEventListener('click', openShare);
    if (oldShareBtn) oldShareBtn.addEventListener('click', openShare);

    if (shareModalClose && shareModal) {
      shareModalClose.addEventListener('click', () => shareModal.classList.remove('active'));
    }

    if (shareModal) {
      shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) shareModal.classList.remove('active');
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        if (!shareLinkInput) return;
        shareLinkInput.select();
        shareLinkInput.setSelectionRange(0, 99999);

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(shareLinkInput.value).then(() => {
            showCopiedFeedback();
          }).catch(() => {
            document.execCommand('copy');
            showCopiedFeedback();
          });
        } else {
          document.execCommand('copy');
          showCopiedFeedback();
        }
      });
    }

    function showCopiedFeedback() {
      if (copyBtnText) copyBtnText.textContent = '✅ Copied!';
      copyBtn.style.background = '#25D366';
      copyBtn.style.color = '#fff';
      setTimeout(() => {
        if (copyBtnText) copyBtnText.textContent = 'Copy Link';
        copyBtn.style.background = '';
        copyBtn.style.color = '';
      }, 2500);
    }
  }

  // ===================================================================
  // 13. PREVIEW MODE SWITCHER (EDITOR BANNER)
  // ===================================================================
  function initPreviewModeSwitch() {
    const switchBtn = document.getElementById('preview-mode-switch-btn');
    if (!switchBtn) return;

    switchBtn.addEventListener('click', () => {
      const isNowViewer = document.body.classList.toggle('viewer-mode');
      const span = switchBtn.querySelector('span');
      if (isNowViewer) {
        if (span) span.textContent = '✏️ Return to Editor Mode';
        showToast('👀 Switched to Receiver Viewer Mode! Edit buttons hidden.');
      } else {
        if (span) span.textContent = '👀 Preview Receiver View';
        showToast('✏️ Returned to Editor Mode!');
      }
    });
  }

  function showToast(text) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:rgba(255,215,0,0.95);color:#0e0216;padding:0.75rem 1.6rem;border-radius:25px;font-weight:700;font-size:0.85rem;z-index:99999;box-shadow:0 8px 30px rgba(0,0,0,0.4);animation:fadeIn 0.3s ease;';
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transition = 'opacity 0.4s ease';
      setTimeout(() => t.remove(), 400);
    }, 3000);
  }

  // ===================================================================
  // INITIALIZATION ON DOM READY
  // ===================================================================
  document.addEventListener('DOMContentLoaded', () => {
    initModeAndName();
    initPresentation();
    initParticleCanvas();
    initConfetti();
    initInteractiveCake();
    initGalleryLightbox();
    initSurpriseFeature();
    initPhotoUploaders();
    initMusicStudio();
    initInstagramProfileCustomizer();
    initLetterCustomizer();
    initNameCustomizer();
    initShareModal();
    initPreviewModeSwitch();
  });

})();

const musicBtn = document.getElementById('music-toggle');
const musicIcon = document.getElementById('music-icon');
const weddingAudio = document.getElementById('wedding-audio');

document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('intro-overlay');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let isIntroHidden = false;

  requestAnimationFrame(() => {
    document.body.classList.add('page-ready');
  });

  if (!overlay) return;

  function hideIntro(removeDelayOverride = null) {
    if (isIntroHidden || !overlay) return;
    isIntroHidden = true;

    overlay.classList.add('intro-hide');
    const removeDelay = removeDelayOverride !== null
      ? removeDelayOverride
      : (prefersReduced ? 0 : 900);

    setTimeout(() => {
      overlay.remove();
    }, removeDelay);
  }

  const hideDelay = prefersReduced ? 300 : 2300;
  setTimeout(() => hideIntro(null), hideDelay);

  overlay.addEventListener('click', () => hideIntro(420));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hideIntro(420);
  });
});

function smoothScrollTo(targetY, duration = 1600) {
  const startY = window.pageYOffset;
  const distance = targetY - startY;
  const startTime = performance.now();

  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutCubic(progress);

    window.scrollTo(0, startY + distance * eased);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const targetId = anchor.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();

    const header = document.querySelector('.site-header');
    const headerHeight = header ? header.offsetHeight : 0;
    const targetY = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 10;

    smoothScrollTo(Math.max(0, targetY), 1700);
  });
});

let isPlaying = false;
musicBtn.addEventListener('click', () => {
  if (!weddingAudio) return;

  if (!isPlaying) {
    weddingAudio.volume = 0.6;
    const playPromise = weddingAudio.play();
    if (playPromise) {
      playPromise.catch(() => {
        isPlaying = false;
        musicBtn.classList.remove('vinyl-playing');
        musicIcon.textContent = '♫';
      });
    }
    isPlaying = true;
  } else {
    weddingAudio.pause();
    isPlaying = false;
  }

  musicBtn.classList.toggle('vinyl-playing', isPlaying);
  musicIcon.textContent = isPlaying ? '♪' : '♫';
});

const weddingDate = new Date('January 6, 2026 12:00:00').getTime();

function updateCountdown() {
  const now = Date.now();
  const distance = Math.max(0, weddingDate - now);

  const d = Math.floor(distance / (1000 * 60 * 60 * 24));
  const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((distance % (1000 * 60)) / 1000);

  document.getElementById('days').innerText = String(d).padStart(2, '0');
  document.getElementById('hours').innerText = String(h).padStart(2, '0');
  document.getElementById('minutes').innerText = String(m).padStart(2, '0');
  document.getElementById('seconds').innerText = String(s).padStart(2, '0');

  requestAnimationFrame(updateCountdown);
}
requestAnimationFrame(updateCountdown);

const progressBar = document.getElementById('progress-bar');
const revealSections = document.querySelectorAll('.reveal-section');
const heroParallax = document.getElementById('hero-parallax');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealSections.forEach((section, index) => {
  section.style.transitionDelay = `${index * 0.08}s`;
  observer.observe(section);
});

const revealItemsObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    entry.target.classList.add('visible');
    const storyRow = entry.target.closest('.story-row');
    if (storyRow) storyRow.classList.add('visible');
    revealItemsObserver.unobserve(entry.target);
  });
}, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

function registerRevealItem(element, revealClass, delay = 0) {
  if (!element) return;
  element.classList.add('reveal-item', revealClass);
  element.style.transitionDelay = `${delay}s`;
  revealItemsObserver.observe(element);
}

function setupRichRevealAnimations() {
  const storyRows = document.querySelectorAll('.story-row');
  storyRows.forEach((row, index) => {
    const text = row.querySelector('.story-text');
    const image = row.querySelector('.story-image');
    const node = row.querySelector('.story-node');
    const isReverse = row.classList.contains('reverse');
    const baseDelay = index * 0.04;

    registerRevealItem(text, isReverse ? 'reveal-right' : 'reveal-left', baseDelay);
    registerRevealItem(image, isReverse ? 'reveal-left' : 'reveal-right', baseDelay + 0.08);
    registerRevealItem(node, 'reveal-pop', baseDelay + 0.16);
  });

  const programEvents = document.querySelectorAll('.program-event');
  programEvents.forEach((event, index) => {
    const card = event.querySelector('.program-card');
    const icon = event.querySelector('.program-icon');
    const fromLeft = event.classList.contains('left');
    const baseDelay = index * 0.05;

    registerRevealItem(card, fromLeft ? 'reveal-left' : 'reveal-right', baseDelay);
    registerRevealItem(icon, 'reveal-pop', baseDelay + 0.1);
  });

  registerRevealItem(document.querySelector('.location .location-name'), 'reveal-down', 0.02);
  registerRevealItem(document.querySelector('.location .location-addr'), 'reveal-down', 0.08);
  registerRevealItem(document.querySelector('.location .actions'), 'reveal-up', 0.14);
  registerRevealItem(document.querySelector('.location .map-wrap'), 'reveal-up', 0.2);

  registerRevealItem(document.querySelector('.gallery .gallery-slider'), 'reveal-up', 0.08);

  registerRevealItem(document.querySelector('.rsvp .sub'), 'reveal-down', 0.04);
  registerRevealItem(document.querySelector('.rsvp .rsvp-form'), 'reveal-up', 0.12);

  registerRevealItem(document.querySelector('.gift .gift-card'), 'reveal-up', 0.08);
  registerRevealItem(document.querySelector('.thanks h2'), 'reveal-down', 0.04);
  registerRevealItem(document.querySelector('.thanks p'), 'reveal-up', 0.12);
}

setupRichRevealAnimations();

window.addEventListener('scroll', () => {
  const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = height > 0 ? winScroll / height : 0;

  progressBar.style.transform = `scaleX(${scrolled})`;

  const scrollY = window.pageYOffset;
  if (scrollY < window.innerHeight) {
    heroParallax.style.transform = `translateY(${scrollY * 0.4}px) scale(1.1)`;
  }
});

document.addEventListener('mousemove', (e) => {
  if (Math.random() > 0.75) createHeartTrail(e.clientX, e.clientY);
});

function createHeartTrail(x, y) {
  const heart = document.createElement('div');
  heart.innerHTML = '❤';
  heart.className = 'heart-trail';
  heart.style.left = `${x - 10}px`;
  heart.style.top = `${y - 10}px`;

  const rotation = Math.random() * 60 - 30;
  heart.style.setProperty('--rotation', `${rotation}deg`);
  heart.style.transform = `rotate(${Math.random() * 20 - 10}deg)`;

  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), 1200);
}

const canvas = document.getElementById('fireworks-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animationId = null;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = Math.random() * 3 + 1;

    const velocity = Math.random() * 8 + 4;
    const angle = Math.random() * Math.PI * 2;

    this.speedX = Math.cos(angle) * velocity;
    this.speedY = Math.sin(angle) * velocity;
    this.alpha = 1;
    this.decay = Math.random() * 0.015 + 0.005;
  }

  update() {
    this.speedY += 0.05;
    this.x += this.speedX;
    this.y += this.speedY;
    this.alpha -= this.decay;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}

function createExplosion(x, y) {
  const colors = ['#ee2b6c', '#d4af37', '#ffffff', '#ffccd5'];
  for (let i = 0; i < 60; i++) {
    particles.push(new Particle(x, y, colors[Math.floor(Math.random() * colors.length)]));
  }
}

function animateFireworks() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();

    if (particles[i].alpha <= 0) {
      particles.splice(i, 1);
      i--;
    }
  }

  if (particles.length > 0) {
    animationId = requestAnimationFrame(animateFireworks);
  } else {
    animationId = null;
  }
}

function launchFireworks() {
  let count = 0;

  const interval = setInterval(() => {
    createExplosion(
      Math.random() * canvas.width,
      Math.random() * canvas.height * 0.6 + canvas.height * 0.1
    );

    if (!animationId) animateFireworks();

    count++;
    if (count > 12) clearInterval(interval);
  }, 300);
}

const rsvpForm = document.getElementById('rsvp-form');
const submitBtn = document.getElementById('submit-btn');
const btnText = document.getElementById('btn-text');
const btnSpinner = document.getElementById('btn-spinner');
const modal = document.getElementById('thank-you-modal');

rsvpForm.addEventListener('submit', (e) => {
  e.preventDefault();

  submitBtn.disabled = true;
  btnText.classList.add('hidden');
  btnSpinner.classList.remove('hidden');

  setTimeout(() => {
    const name = document.getElementById('rsvp-name').value || 'bạn';
    const status = document.getElementById('rsvp-status').value;

    const msg = status === 'yes'
      ? `Chúng mình rất vui vì ${name} sẽ tham dự!`
      : `Rất tiếc vì ${name} không thể tham dự!`;

    document.getElementById('modal-msg').textContent = msg;
    launchFireworks();

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');

    submitBtn.disabled = false;
    btnText.classList.remove('hidden');
    btnSpinner.classList.add('hidden');

    rsvpForm.reset();
  }, 1500);
});

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');

  setTimeout(() => {
    particles = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, 500);
}

window.closeModal = closeModal;

function copyToClipboard(text, element) {
  navigator.clipboard.writeText(text).then(() => {
    const tooltip = element.querySelector('.copy-tooltip');
    tooltip.classList.add('show');

    setTimeout(() => {
      tooltip.classList.remove('show');
    }, 2000);
  }).catch((err) => {
    console.error('Failed to copy: ', err);
  });
}

window.copyToClipboard = copyToClipboard;

function renderJanuaryCalendar() {
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;

  const firstDayOffset = 4;
  const daysInMonth = 31;

  for (let i = 0; i < firstDayOffset; i++) {
    const blank = document.createElement('div');
    blank.className = 'calendar-day empty';
    blank.setAttribute('aria-hidden', 'true');
    grid.appendChild(blank);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    cell.className = `calendar-day${day === 6 ? ' highlight' : ''}`;
    if (day === 6) {
      cell.innerHTML = '<span class="calendar-heart"><span>6</span></span>';
    } else {
      cell.textContent = day;
    }
    grid.appendChild(cell);
  }
}

renderJanuaryCalendar();

const galleryTrack = document.getElementById('gallery-track');
const gallerySlides = Array.from(document.querySelectorAll('.gallery-slide'));
const galleryPrev = document.getElementById('gallery-prev');
const galleryNext = document.getElementById('gallery-next');

let currentGalleryIndex = 0;
let galleryTimer = null;

function updateGallerySlider() {
  if (!galleryTrack || gallerySlides.length === 0) return;
  galleryTrack.style.transform = `translateX(-${currentGalleryIndex * 100}%)`;
}

function goToGallerySlide(index) {
  if (gallerySlides.length === 0) return;
  currentGalleryIndex = (index + gallerySlides.length) % gallerySlides.length;
  updateGallerySlider();
}

function startGalleryAutoplay() {
  if (gallerySlides.length <= 1) return;
  stopGalleryAutoplay();
  galleryTimer = setInterval(() => {
    goToGallerySlide(currentGalleryIndex + 1);
  }, 3500);
}

function stopGalleryAutoplay() {
  if (galleryTimer) {
    clearInterval(galleryTimer);
    galleryTimer = null;
  }
}

if (galleryPrev && galleryNext && galleryTrack) {
  galleryPrev.addEventListener('click', () => {
    goToGallerySlide(currentGalleryIndex - 1);
    startGalleryAutoplay();
  });

  galleryNext.addEventListener('click', () => {
    goToGallerySlide(currentGalleryIndex + 1);
    startGalleryAutoplay();
  });

  galleryTrack.addEventListener('mouseenter', stopGalleryAutoplay);
  galleryTrack.addEventListener('mouseleave', startGalleryAutoplay);

  updateGallerySlider();
  startGalleryAutoplay();
}

const lightbox = document.getElementById('image-lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');
const zoomableImages = Array.from(document.querySelectorAll('.zoomable-image'));

let currentLightboxIndex = 0;

function updateLightboxImage() {
  if (!lightboxImage || zoomableImages.length === 0) return;
  const target = zoomableImages[currentLightboxIndex];
  lightboxImage.src = target.src;
  lightboxImage.alt = target.alt || 'Wedding image';
}

function openLightbox(index) {
  if (!lightbox) return;
  currentLightboxIndex = index;
  updateLightboxImage();
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
}

function shiftLightbox(step) {
  if (zoomableImages.length === 0) return;
  currentLightboxIndex = (currentLightboxIndex + step + zoomableImages.length) % zoomableImages.length;
  updateLightboxImage();
}

zoomableImages.forEach((image, index) => {
  image.addEventListener('click', () => openLightbox(index));
});

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightboxPrev) lightboxPrev.addEventListener('click', () => shiftLightbox(-1));
if (lightboxNext) lightboxNext.addEventListener('click', () => shiftLightbox(1));

if (lightbox) {
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
}

document.addEventListener('keydown', (event) => {
  if (!lightbox || !lightbox.classList.contains('open')) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') shiftLightbox(-1);
  if (event.key === 'ArrowRight') shiftLightbox(1);
});

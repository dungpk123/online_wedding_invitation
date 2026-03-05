const viewInviteBtn = document.getElementById("viewInviteBtn");
const inviteSection = document.getElementById("invite");
const revealItems = document.querySelectorAll(".reveal");
const sectionFxItems = document.querySelectorAll(".fx-story, .fx-event, .fx-timeline, .fx-album, .fx-rsvp, .fx-gift, .fx-thankyou");
const petalsLayer = document.getElementById("petalsLayer");
const petalsCrossLayer = document.getElementById("petalsCrossLayer");

const guestNameEl = document.getElementById("guestName");
const guestInput = document.getElementById("guestInput");
const calendarBtn = document.getElementById("calendarBtn");
const downloadPdfBtn = document.getElementById("downloadPdfBtn");
const countdownHoursEl = document.getElementById("countdownHours");
const countdownMinutesEl = document.getElementById("countdownMinutes");
const countdownSecondsEl = document.getElementById("countdownSeconds");

const albumButtons = document.querySelectorAll(".album-item");
const hangerItems = document.querySelectorAll(".fx-hanger-wind");
const albumCanvas = document.getElementById("albumCanvas");
const albumPetalsBack = document.getElementById("albumPetalsBack");
const albumPetalsFront = document.getElementById("albumPetalsFront");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const closeLightbox = document.getElementById("closeLightbox");
const prevImageBtn = document.getElementById("prevImage");
const nextImageBtn = document.getElementById("nextImage");

const rsvpForm = document.getElementById("rsvpForm");
const rsvpCard = document.getElementById("rsvpCard");
const rsvpMessage = document.getElementById("rsvpMessage");

const musicToggle = document.getElementById("musicToggle");
const bgMusic = document.getElementById("bgMusic");

let currentIndex = 0;
let slideshowTimer = null;
let albumGustTimer = null;
let lastProximityGust = 0;
const petalParticles = [];
const pointerWind = { x: 0, y: 0, active: false, timeout: null };
const albumSources = Array.from(albumButtons).map((button) => button.dataset.src);

if (viewInviteBtn && inviteSection) {
viewInviteBtn.addEventListener("click", () => {
inviteSection.scrollIntoView({ behavior: "smooth", block: "start" });
});
}

const urlParams = new URLSearchParams(window.location.search);
const guestParam = (urlParams.get("guest") || "").trim();

function updateWeddingCountdown() {
if (!countdownHoursEl || !countdownMinutesEl || !countdownSecondsEl) {
return;
}

const targetDate = new Date(2026, 11, 26, 18, 0, 0);
const now = new Date();
const diffMs = Math.max(0, targetDate.getTime() - now.getTime());
const totalSeconds = Math.floor(diffMs / 1000);

const hours = Math.floor(totalSeconds / 3600);
const minutes = Math.floor((totalSeconds % 3600) / 60);
const seconds = totalSeconds % 60;

countdownHoursEl.textContent = String(hours);
countdownMinutesEl.textContent = String(minutes).padStart(2, "0");
countdownSecondsEl.textContent = String(seconds).padStart(2, "0");
}

updateWeddingCountdown();
setInterval(updateWeddingCountdown, 1000);

if (guestParam) {
const guestText = decodeURIComponent(guestParam.replace(/\+/g, " "));
if (guestNameEl) {
guestNameEl.textContent = guestText;
}
if (guestInput) {
guestInput.value = guestText;
}
}

if (calendarBtn) {
const calendarUrl = new URL("https://calendar.google.com/calendar/render");
calendarUrl.searchParams.set("action", "TEMPLATE");
calendarUrl.searchParams.set("text", "Le Thanh Hon Hoang Anh va Ngoc Anh");
calendarUrl.searchParams.set("dates", "20261226T103000Z/20261226T150000Z");
calendarUrl.searchParams.set("details", "Tran trong kinh moi ban den chung vui cung chung minh trong dem tiec sakura.");
calendarUrl.searchParams.set("location", "Sakura Garden, 178 Nguyen Trai, Ha Noi");
calendarBtn.href = calendarUrl.toString();
}

if (downloadPdfBtn) {
downloadPdfBtn.addEventListener("click", () => {
window.print();
});
}

const revealObserver = new IntersectionObserver(
(entries, observer) => {
entries.forEach((entry) => {
if (entry.isIntersecting) {
entry.target.classList.add("show");
observer.unobserve(entry.target);
}
});
},
{ threshold: 0.16 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const sectionFxObserver = new IntersectionObserver(
(entries) => {
entries.forEach((entry) => {
if (entry.isIntersecting) {
entry.target.classList.add("in-view");
return;
}

entry.target.classList.remove("in-view");
});
},
{ threshold: 0.28, rootMargin: "0px 0px -10% 0px" }
);

sectionFxItems.forEach((section) => sectionFxObserver.observe(section));

function spawnParticle(particle, viewportWidth, viewportHeight, spawnAtTop = false) {
const startX = Math.random() * viewportWidth;
particle.x = startX;
particle.y = spawnAtTop ? -20 - Math.random() * viewportHeight * 0.35 : Math.random() * viewportHeight;
particle.vx = -0.22 + Math.random() * 0.44;
particle.vy = 0.28 + Math.random() * 0.52;
particle.angle = Math.random() * 360;
particle.spin = -0.7 + Math.random() * 1.4;
particle.phase = Math.random() * Math.PI * 2;
particle.freq = 0.3 + Math.random() * 0.42;
particle.sway = 6 + Math.random() * 12;
particle.opacity = particle.baseOpacity * (0.82 + Math.random() * 0.34);
particle.el.style.opacity = `${particle.opacity}`;
}

function buildPetalField() {
if (!petalsLayer || !petalsCrossLayer) {
return;
}

petalsLayer.innerHTML = "";
petalsCrossLayer.innerHTML = "";
petalParticles.length = 0;

const width = window.innerWidth;
const height = window.innerHeight;
const frontCount = Math.min(30, Math.max(14, Math.round(width / 64)));
const backCount = Math.min(16, Math.max(7, Math.round(width / 120)));

for (let index = 0; index < frontCount; index += 1) {
const el = document.createElement("span");
el.className = "petal";
const size = 8 + Math.random() * 10;
el.style.width = `${size}px`;
el.style.height = `${size * 0.68}px`;
petalsLayer.appendChild(el);
const particle = { el, depth: 1, size, baseOpacity: 0.56 };
spawnParticle(particle, width, height, false);
petalParticles.push(particle);
}

for (let index = 0; index < backCount; index += 1) {
const el = document.createElement("span");
el.className = "petal-cross";
const size = 7 + Math.random() * 8;
el.style.width = `${size}px`;
el.style.height = `${size * 0.66}px`;
petalsCrossLayer.appendChild(el);
const particle = { el, depth: 0.68, size, baseOpacity: 0.34 };
spawnParticle(particle, width, height, false);
petalParticles.push(particle);
}
}

function animatePetalField(now) {
if (!petalParticles.length) {
window.requestAnimationFrame(animatePetalField);
return;
}

const width = window.innerWidth;
const height = window.innerHeight;
const radius = 140;

petalParticles.forEach((particle) => {
const drift = Math.sin(now * 0.001 * particle.freq + particle.phase) * 0.26 * particle.sway;

if (pointerWind.active) {
const dx = particle.x - pointerWind.x;
const dy = particle.y - pointerWind.y;
const distance = Math.hypot(dx, dy);
if (distance < radius) {
const force = (radius - distance) / radius;
const pushX = (dx / (distance || 1)) * (1.5 + particle.depth) * force;
const pushY = (dy / (distance || 1)) * (1.2 + particle.depth) * force;
particle.vx += pushX;
particle.vy += pushY * 0.55;
}
}

particle.vx *= 0.985;
particle.vy = Math.min(1.35, particle.vy + 0.0016 * particle.depth);
particle.x += particle.vx + drift * particle.depth;
particle.y += particle.vy * particle.depth;
particle.angle += particle.spin * particle.depth;

if (particle.y > height + 40 || particle.x < -60 || particle.x > width + 60) {
spawnParticle(particle, width, height, true);
}

particle.el.style.transform = `translate3d(${particle.x}px, ${particle.y}px, 0) rotate(${particle.angle}deg)`;
});

window.requestAnimationFrame(animatePetalField);
}

function createAlbumPetal(layer) {
if (!layer) {
return;
}

const petal = document.createElement("span");
petal.className = "album-petal";

const left = Math.random() * 100;
const size = 7 + Math.random() * 8;
const duration = 11 + Math.random() * 9;
const delay = Math.random() * 1.5;

petal.style.left = `${left}%`;
petal.style.width = `${size}px`;
petal.style.height = `${size * 0.68}px`;
petal.style.animationDuration = `${duration}s`;
petal.style.animationDelay = `-${delay}s`;

layer.appendChild(petal);

setTimeout(() => {
petal.remove();
}, (duration + 1.2) * 1000);
}

function triggerAlbumGust() {
if (!albumCanvas) {
return;
}

hangerItems.forEach((item) => {
item.classList.remove("is-gusting");
void item.offsetWidth;
item.classList.add("is-gusting");
});

if (albumGustTimer) {
clearTimeout(albumGustTimer);
}

albumGustTimer = setTimeout(() => {
hangerItems.forEach((item) => item.classList.remove("is-gusting"));
}, 1750);
}

buildPetalField();
window.requestAnimationFrame(animatePetalField);

window.addEventListener("resize", () => {
buildPetalField();
});

window.addEventListener("pointermove", (event) => {
pointerWind.x = event.clientX;
pointerWind.y = event.clientY;
pointerWind.active = true;
if (pointerWind.timeout) {
clearTimeout(pointerWind.timeout);
}
pointerWind.timeout = setTimeout(() => {
pointerWind.active = false;
}, 140);

const now = performance.now();
if (now - lastProximityGust < 620) {
return;
}

let isNearAnyPhoto = false;
albumButtons.forEach((button) => {
const rect = button.getBoundingClientRect();
const cx = rect.left + rect.width / 2;
const cy = rect.top + rect.height / 2;
const distance = Math.hypot(event.clientX - cx, event.clientY - cy);
if (distance < 130) {
isNearAnyPhoto = true;
}
});

if (isNearAnyPhoto) {
lastProximityGust = now;
triggerAlbumGust();
}
});

window.addEventListener("pointerleave", () => {
pointerWind.active = false;
});

for (let index = 0; index < 5; index += 1) {
createAlbumPetal(albumPetalsBack);
}

for (let index = 0; index < 7; index += 1) {
createAlbumPetal(albumPetalsFront);
}

setInterval(() => {
createAlbumPetal(albumPetalsBack);
if (Math.random() > 0.45) {
createAlbumPetal(albumPetalsFront);
}
}, 1800);

let ticking = false;
window.addEventListener("scroll", () => {
if (ticking) {
return;
}

ticking = true;
window.requestAnimationFrame(() => {
const parallaxShift = Math.min(90, window.scrollY * 0.08);
document.documentElement.style.setProperty("--parallax-shift", `${parallaxShift}px`);
ticking = false;
});
});

function showImage(index) {
if (!albumSources.length || !lightboxImage) {
return;
}

currentIndex = (index + albumSources.length) % albumSources.length;
const src = albumSources[currentIndex];

lightboxImage.classList.remove("visible");
requestAnimationFrame(() => {
lightboxImage.src = src;
lightboxImage.onload = () => {
lightboxImage.classList.add("visible");
};
});
}

function startSlideshow() {
stopSlideshow();
slideshowTimer = setInterval(() => {
showImage(currentIndex + 1);
}, 4200);
}

function stopSlideshow() {
if (slideshowTimer) {
clearInterval(slideshowTimer);
slideshowTimer = null;
}
}

function openLightbox(index) {
if (!lightbox) {
return;
}

lightbox.classList.add("open");
lightbox.setAttribute("aria-hidden", "false");
document.body.style.overflow = "hidden";
showImage(index);
startSlideshow();
}

function closeModal() {
if (!lightbox) {
return;
}

lightbox.classList.remove("open");
lightbox.setAttribute("aria-hidden", "true");
document.body.style.overflow = "";
stopSlideshow();

if (albumCanvas) {
albumCanvas.classList.remove("focus-mode");
}

albumButtons.forEach((button) => button.classList.remove("is-active"));
}

albumButtons.forEach((button, index) => {
button.addEventListener("mouseenter", triggerAlbumGust);
button.addEventListener("focus", triggerAlbumGust);

button.addEventListener("click", () => {
if (albumCanvas) {
albumCanvas.classList.add("focus-mode");
}

albumButtons.forEach((item) => item.classList.remove("is-active"));
button.classList.add("is-active");

setTimeout(() => {
openLightbox(index);
}, 120);
});
});

if (closeLightbox) {
closeLightbox.addEventListener("click", closeModal);
}

if (prevImageBtn) {
prevImageBtn.addEventListener("click", () => {
showImage(currentIndex - 1);
startSlideshow();
});
}

if (nextImageBtn) {
nextImageBtn.addEventListener("click", () => {
showImage(currentIndex + 1);
startSlideshow();
});
}

if (lightbox) {
lightbox.addEventListener("click", (event) => {
if (event.target === lightbox) {
closeModal();
}
});
}

document.addEventListener("keydown", (event) => {
if (!lightbox || !lightbox.classList.contains("open")) {
return;
}

if (event.key === "Escape") {
closeModal();
}

if (event.key === "ArrowLeft") {
showImage(currentIndex - 1);
startSlideshow();
}

if (event.key === "ArrowRight") {
showImage(currentIndex + 1);
startSlideshow();
}
});

if (rsvpForm) {
rsvpForm.addEventListener("submit", (event) => {
event.preventDefault();

const formData = new FormData(rsvpForm);
const guestName = String(formData.get("guestName") || "").trim();
const attendance = String(formData.get("attendance") || "").trim();
const phone = String(formData.get("phone") || "").trim();

if (!guestName || !attendance || !phone) {
if (rsvpMessage) {
rsvpMessage.textContent = "Vui long nhap day du thong tin bat buoc.";
}
return;
}

if (rsvpMessage) {
rsvpMessage.textContent = "Dang gui xac nhan...";
}

if (rsvpCard) {
rsvpCard.classList.remove("success");
}

setTimeout(() => {
if (rsvpMessage) {
const attendanceText = attendance === "yes" ? "Hen gap ban trong ngay cuoi!" : "Cam on ban da gui loi nhan.";
rsvpMessage.textContent = `Cam on ${guestName}! ${attendanceText}`;
}

if (rsvpCard) {
rsvpCard.classList.add("success");
}

rsvpForm.reset();
if (guestParam && guestInput) {
guestInput.value = decodeURIComponent(guestParam.replace(/\+/g, " "));
}
}, 700);
});
}

if (musicToggle && bgMusic) {
musicToggle.addEventListener("click", async () => {
if (bgMusic.paused) {
try {
await bgMusic.play();
musicToggle.textContent = "Nhac nen: On";
} catch (_error) {
musicToggle.textContent = "Khong the phat nhac";
}
return;
}

bgMusic.pause();
musicToggle.textContent = "Nhac nen: Off";
});
}

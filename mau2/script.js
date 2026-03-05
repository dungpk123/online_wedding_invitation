// ===== COUNTDOWN =====
const countdownSection = document.querySelector(".countdown-plus");
const countdownData = countdownSection?.dataset?.weddingDate;

const buildWeddingDate = () => {
    const now = new Date();
    const fallback = new Date(now.getFullYear(), 11, 15, 18, 0, 0);
    const parsed = countdownData ? new Date(countdownData) : fallback;
    const target = Number.isNaN(parsed.getTime()) ? fallback : parsed;

    while (target.getTime() <= Date.now()) {
        target.setFullYear(target.getFullYear() + 1);
    }

    return target.getTime();
};

const weddingDate = buildWeddingDate();

const updateCountdown = () => {
    const now = Date.now();
    const distance = Math.max(0, weddingDate - now);

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");

    if (daysEl) daysEl.innerText = days.toString().padStart(2, "0");
    if (hoursEl) hoursEl.innerText = hours.toString().padStart(2, "0");
    if (minutesEl) minutesEl.innerText = minutes.toString().padStart(2, "0");
    if (secondsEl) secondsEl.innerText = seconds.toString().padStart(2, "0");
};

updateCountdown();
setInterval(updateCountdown, 1000);

// ===== SCROLL ANIMATIONS =====
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobileViewport = window.matchMedia("(max-width: 768px)").matches;
const revealTargets = document.querySelectorAll(".reveal, .fade");

if (revealTargets.length) {
    revealTargets.forEach((target) => {
        if (!target.classList.contains("reveal")) {
            target.classList.add("reveal");
        }

        if (!target.matches(".fx-fade-up, .fx-fade-down, .fx-scale-blur")) {
            target.classList.add("fx-fade-up");
        }

        if (target.classList.contains("reveal-stagger")) {
            const children = Array.from(target.children).slice(0, 14);
            children.forEach((child, index) => {
                child.classList.add("reveal-child");
                child.style.setProperty("--stagger-index", String(index));
            });
        }
    });

    if (prefersReducedMotion) {
        revealTargets.forEach((target) => {
            target.classList.add("is-visible", "show");
        });
    } else {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("is-visible", "show");
                    observer.unobserve(entry.target);
                });
            },
            {
                threshold: isMobileViewport ? 0.12 : 0.22,
                rootMargin: isMobileViewport ? "0px 0px -10% 0px" : "0px 0px -14% 0px"
            }
        );

        revealTargets.forEach((target) => revealObserver.observe(target));
    }
}

const parallaxElements = Array.from(document.querySelectorAll(".parallax-bg"));

if (!prefersReducedMotion && parallaxElements.length) {
    const activeParallaxElements = new Set();
    let isParallaxTicking = false;

    const updateParallax = () => {
        isParallaxTicking = false;
        const viewportCenter = window.innerHeight * 0.5;

        activeParallaxElements.forEach((element) => {
            const rect = element.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > window.innerHeight) return;

            const centerDelta = rect.top + rect.height * 0.5 - viewportCenter;
            const speed = Number.parseFloat(element.dataset.parallaxSpeed || "") || (isMobileViewport ? 0.04 : 0.075);
            const maxShift = isMobileViewport ? 12 : 20;
            const shift = Math.max(-maxShift, Math.min(maxShift, -centerDelta * speed));

            element.style.setProperty("--parallax-shift", `${shift.toFixed(2)}px`);
        });
    };

    const requestParallaxTick = () => {
        if (isParallaxTicking) return;
        isParallaxTicking = true;
        window.requestAnimationFrame(updateParallax);
    };

    const parallaxObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    activeParallaxElements.add(entry.target);
                } else {
                    activeParallaxElements.delete(entry.target);
                }
            });

            requestParallaxTick();
        },
        { threshold: 0, rootMargin: "120px 0px" }
    );

    parallaxElements.forEach((element) => parallaxObserver.observe(element));
    window.addEventListener("scroll", requestParallaxTick, { passive: true });
    window.addEventListener("resize", requestParallaxTick);
    requestParallaxTick();
}

// ===== VIDEO MODAL =====
const modal = document.getElementById("videoModal");
const openBtn = document.getElementById("openVideo");
const closeBtn = document.getElementById("closeModal");

const openModal = () => modal.classList.add("is-open");
const closeModal = () => modal.classList.remove("is-open");

if (modal && openBtn && closeBtn) {
    openBtn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
        if (event.target === modal) closeModal();
    });
    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeModal();
    });
}

// ===== WISHES =====
const wishForm = document.getElementById("wishForm");
const wishList = document.getElementById("wishList");
const WISH_STORAGE_KEY = "wedding_wishes";

const createWishItem = (name, text) => {
    const article = document.createElement("article");
    article.className = "wish-item";

    const wishText = document.createElement("p");
    wishText.className = "wish-item-text";
    wishText.textContent = text;

    const author = document.createElement("p");
    author.className = "wish-item-author";
    author.textContent = `— ${name}`;

    article.appendChild(wishText);
    article.appendChild(author);
    return article;
};

const loadSavedWishes = () => {
    if (!wishList) return [];
    try {
        const stored = localStorage.getItem(WISH_STORAGE_KEY);
        const wishes = stored ? JSON.parse(stored) : [];
        wishes.forEach((wish) => {
            if (!wish?.name || !wish?.text) return;
            wishList.prepend(createWishItem(wish.name, wish.text));
        });
        return wishes;
    } catch {
        return [];
    }
};

let savedWishes = loadSavedWishes();

if (wishForm && wishList) {
    wishForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const nameInput = document.getElementById("wish-name");
        const textInput = document.getElementById("wish-text");
        const name = nameInput?.value.trim();
        const text = textInput?.value.trim();

        if (!name || !text) return;

        wishList.prepend(createWishItem(name, text));
        savedWishes = [{ name, text }, ...savedWishes].slice(0, 30);
        localStorage.setItem(WISH_STORAGE_KEY, JSON.stringify(savedWishes));
        wishForm.reset();
    });
}

// ===== ALBUM SLIDESHOW =====
const albumMainImage = document.getElementById("albumMainImage");
const albumThumbs = Array.from(document.querySelectorAll(".album-thumb"));
const albumPrev = document.getElementById("albumPrev");
const albumNext = document.getElementById("albumNext");
const albumStripPrev = document.getElementById("albumStripPrev");
const albumStripNext = document.getElementById("albumStripNext");
const albumThumbnails = document.getElementById("albumThumbnails");
const albumLightbox = document.getElementById("albumLightbox");
const albumLightboxImage = document.getElementById("albumLightboxImage");
const albumLightboxClose = document.getElementById("albumLightboxClose");
const albumLightboxPrev = document.getElementById("albumLightboxPrev");
const albumLightboxNext = document.getElementById("albumLightboxNext");
const albumLightboxPlayPause = document.getElementById("albumLightboxPlayPause");
const albumLightboxProgressBar = document.getElementById("albumLightboxProgressBar");
const ALBUM_FALLBACK = "https://picsum.photos/seed/wedding-fallback/1400/900";
const ALBUM_AUTOPLAY_INTERVAL = 3600;

if (albumMainImage && albumThumbs.length) {
    let currentIndex = Math.max(0, albumThumbs.findIndex((thumb) => thumb.classList.contains("is-active")));
    let mainChangeToken = 0;
    let lightboxChangeToken = 0;
    let slideshowTimer = null;
    let isPlaying = false;

    const getThumbByIndex = (index) => {
        const safeIndex = (index + albumThumbs.length) % albumThumbs.length;
        return albumThumbs[safeIndex];
    };

    const getSafeIndex = (index) => (index + albumThumbs.length) % albumThumbs.length;

    const getImageData = (thumb) => ({
        src: thumb?.dataset.image || ALBUM_FALLBACK,
        alt: thumb?.dataset.alt || "Ảnh kỷ niệm cưới"
    });

    const updatePlayPauseLabel = () => {
        if (!albumLightboxPlayPause) return;
        albumLightboxPlayPause.textContent = isPlaying ? "⏸ Pause" : "▶ Play";
        albumLightboxPlayPause.setAttribute("aria-pressed", isPlaying ? "true" : "false");
    };

    const resetProgressBar = (animate = false) => {
        if (!albumLightboxProgressBar) return;

        albumLightboxProgressBar.style.transition = "none";
        albumLightboxProgressBar.style.width = "0%";

        if (!animate) return;

        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                albumLightboxProgressBar.style.transition = `width ${ALBUM_AUTOPLAY_INTERVAL}ms linear`;
                albumLightboxProgressBar.style.width = "100%";
            });
        });
    };

    const restartSlideshowClock = () => {
        if (!isPlaying) return;

        if (slideshowTimer) {
            clearInterval(slideshowTimer);
        }

        slideshowTimer = window.setInterval(() => {
            goToIndex(currentIndex + 1);
            resetProgressBar(true);
        }, ALBUM_AUTOPLAY_INTERVAL);

        resetProgressBar(true);
    };

    const stopSlideshow = () => {
        if (slideshowTimer) {
            clearInterval(slideshowTimer);
            slideshowTimer = null;
        }
        isPlaying = false;
        updatePlayPauseLabel();
        resetProgressBar(false);
    };

    const updateLightboxImage = (src, alt, withFade = true) => {
        if (!albumLightboxImage) return;

        const token = ++lightboxChangeToken;
        const applyImage = () => {
            if (token !== lightboxChangeToken) return;
            albumLightboxImage.src = src;
            albumLightboxImage.alt = alt;
            albumLightboxImage.classList.remove("is-fading");
            albumLightboxImage.classList.remove("is-entering");
            void albumLightboxImage.offsetWidth;
            albumLightboxImage.classList.add("is-entering");
        };

        if (!withFade) {
            applyImage();
            return;
        }

        albumLightboxImage.classList.add("is-fading");
        window.setTimeout(applyImage, 120);
    };

    const activateThumb = (activeThumb, scroll = true) => {
        albumThumbs.forEach((thumb, index) => {
            const isActive = thumb === activeThumb;
            thumb.classList.toggle("is-active", isActive);
            thumb.setAttribute("aria-label", isActive ? `Ảnh ${index + 1} đang chọn` : `Chọn ảnh ${index + 1}`);
            if (isActive) {
                currentIndex = index;
                if (scroll) {
                    thumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                }
            }
        });
    };

    const setMainImageByIndex = (index, withFade = true, scrollThumb = true) => {
        const safeIndex = getSafeIndex(index);
        const thumb = getThumbByIndex(safeIndex);
        if (!thumb) return;

        const { src, alt } = getImageData(thumb);
        const token = ++mainChangeToken;

        activateThumb(thumb, scrollThumb);

        const applyImage = () => {
            if (token !== mainChangeToken) return;
            albumMainImage.src = src;
            albumMainImage.alt = alt;
            albumMainImage.classList.remove("is-fading");
            albumMainImage.classList.remove("is-entering");
            void albumMainImage.offsetWidth;
            albumMainImage.classList.add("is-entering");

            if (albumLightbox?.classList.contains("is-open")) {
                updateLightboxImage(src, alt, true);
            }
        };

        if (!withFade) {
            applyImage();
            return;
        }

        albumMainImage.classList.add("is-fading");
        window.setTimeout(applyImage, 120);
    };

    const goToIndex = (nextIndex) => setMainImageByIndex(nextIndex, true);

    const startSlideshow = () => {
        stopSlideshow();
        isPlaying = true;
        updatePlayPauseLabel();
        restartSlideshowClock();
    };

    const openLightbox = () => {
        if (!albumLightbox) return;
        albumLightbox.classList.add("is-open");
        albumLightbox.setAttribute("aria-hidden", "false");
        document.body.classList.add("album-lightbox-open");

        const activeThumb = getThumbByIndex(currentIndex);
        const { src, alt } = getImageData(activeThumb);
        updateLightboxImage(src, alt, false);
        updatePlayPauseLabel();
        resetProgressBar(false);
    };

    const closeLightbox = () => {
        if (!albumLightbox) return;
        albumLightbox.classList.remove("is-open");
        albumLightbox.setAttribute("aria-hidden", "true");
        document.body.classList.remove("album-lightbox-open");
        stopSlideshow();
    };

    albumThumbs.forEach((thumb, index) => {
        thumb.addEventListener("click", () => setMainImageByIndex(index, true));

        const thumbSrc = thumb.dataset.image;
        if (thumbSrc) {
            const preloadMainImage = new Image();
            preloadMainImage.src = thumbSrc;
        }

        const thumbImg = thumb.querySelector("img");
        if (thumbImg) {
            thumbImg.addEventListener("error", () => {
                thumbImg.src = "https://picsum.photos/seed/wedding-thumb-fallback/280/180";
                thumb.dataset.image = ALBUM_FALLBACK;
            }, { once: true });
        }
    });

    albumMainImage.addEventListener("error", () => {
        albumMainImage.src = ALBUM_FALLBACK;
    }, { once: true });

    albumMainImage.addEventListener("click", openLightbox);

    if (albumLightboxClose) albumLightboxClose.addEventListener("click", closeLightbox);

    if (albumLightboxPlayPause) {
        albumLightboxPlayPause.addEventListener("click", () => {
            if (isPlaying) {
                stopSlideshow();
            } else {
                startSlideshow();
            }
        });
    }

    if (albumLightbox) {
        albumLightbox.addEventListener("click", (event) => {
            if (event.target === albumLightbox) {
                closeLightbox();
            }
        });
    }

    const goToIndexWithClock = (nextIndex) => {
        goToIndex(nextIndex);
        if (isPlaying) restartSlideshowClock();
    };

    if (albumPrev) albumPrev.addEventListener("click", () => goToIndexWithClock(currentIndex - 1));
    if (albumNext) albumNext.addEventListener("click", () => goToIndexWithClock(currentIndex + 1));

    if (albumStripPrev && albumThumbnails) {
        albumStripPrev.addEventListener("click", () => {
            albumThumbnails.scrollBy({ left: -160, behavior: "smooth" });
            goToIndexWithClock(currentIndex - 1);
        });
    }

    if (albumStripNext && albumThumbnails) {
        albumStripNext.addEventListener("click", () => {
            albumThumbnails.scrollBy({ left: 160, behavior: "smooth" });
            goToIndexWithClock(currentIndex + 1);
        });
    }

    if (albumLightboxPrev) albumLightboxPrev.addEventListener("click", () => goToIndexWithClock(currentIndex - 1));
    if (albumLightboxNext) albumLightboxNext.addEventListener("click", () => goToIndexWithClock(currentIndex + 1));

    window.addEventListener("keydown", (event) => {
        if (!albumLightbox?.classList.contains("is-open")) return;

        if (event.key === "Escape") {
            closeLightbox();
            return;
        }

        if (event.key === "ArrowRight") {
            goToIndexWithClock(currentIndex + 1);
            return;
        }

        if (event.key === "ArrowLeft") {
            goToIndexWithClock(currentIndex - 1);
            return;
        }

        if (event.key === " " || event.code === "Space") {
            event.preventDefault();
            if (isPlaying) {
                stopSlideshow();
            } else {
                startSlideshow();
            }
        }
    });

    setMainImageByIndex(currentIndex, false, false);
    updatePlayPauseLabel();
    resetProgressBar(false);
}

// ===== HEART EFFECT =====
const spawnHeart = () => {
    const heart = document.createElement("span");
    heart.className = "floating-heart";
    heart.textContent = "❤";

    const size = Math.floor(Math.random() * 10) + 14;
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${size}px`;
    heart.style.animationDuration = `${Math.random() * 2 + 5}s`;

    document.body.appendChild(heart);

    heart.addEventListener("animationend", () => heart.remove());
};

setInterval(spawnHeart, 900);

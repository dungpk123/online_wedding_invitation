/* ============================================================
   WEDDING FLIP BOOK - script.js
   ============================================================ */

(function () {
  "use strict";

  const landing = document.getElementById("landing");
  const openBtn = document.getElementById("open-book-btn");
  const bookModal = document.getElementById("book-modal");
  const modalBg = document.getElementById("modal-bg");
  const closeBtn = document.getElementById("close-btn");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const pageCounter = document.getElementById("page-counter");
  const book = document.getElementById("book");
  const bookWrapper = document.querySelector(".book-wrapper");
  const petalsEl = document.getElementById("petals");

  const rsvpForm = document.getElementById("rsvp-form");
  const wishForm = document.getElementById("wish-form");
  const wishList = document.getElementById("wish-list");
  const rsvpToast = document.getElementById("rsvp-toast");
  const wishToast = document.getElementById("wish-toast");
  const noticeModal = document.getElementById("notice-modal");
  const noticeMessage = document.getElementById("notice-message");
  const noticeOkBtn = document.getElementById("notice-ok");
  const NOTICE_HIDE_DURATION = 320;

  const spreads = Array.from(document.querySelectorAll(".spread"));
  const TOTAL_SPREADS = spreads.length;
  const TOTAL_PAGES = 11;
  const FLIP_DURATION = 780;
  const OPEN_COVER_DURATION = 620;
  const CLOSE_COVER_DURATION = 620;

  let currentSpread = 0;
  let isAnimating = false;
  let isBookClosed = true;
  let noticeHideTimer = null;

  const PETAL_CHARS = [".", "*", "o", "+"];

  function decorateInnerPages() {
    const innerPages = document.querySelectorAll(".page:not(.cover-left):not(.cover-right) .page-inner");
    innerPages.forEach((inner) => {
      if (inner.querySelector(".inner-page-frame")) return;

      const frame = document.createElement("div");
      frame.className = "inner-page-frame";

      ["top-left", "top-right", "bottom-left", "bottom-right"].forEach((pos) => {
        const corner = document.createElement("div");
        corner.className = "inner-corner " + pos;

        const img = document.createElement("img");
        img.src = "/img/frame.png";
        img.alt = "";
        img.setAttribute("aria-hidden", "true");

        corner.appendChild(img);
        frame.appendChild(corner);
      });

      inner.prepend(frame);
    });
  }

  function spawnPetal() {
    if (!petalsEl) return;
    const p = document.createElement("span");
    p.className = "petal";
    p.textContent = PETAL_CHARS[Math.floor(Math.random() * PETAL_CHARS.length)];
    p.style.left = Math.random() * 100 + "vw";
    p.style.fontSize = 0.7 + Math.random() * 0.8 + "rem";
    p.style.opacity = (0.4 + Math.random() * 0.5).toString();
    const dur = 6 + Math.random() * 8;
    p.style.animationDuration = dur + "s";
    p.style.animationDelay = Math.random() * dur + "s";
    petalsEl.appendChild(p);
    setTimeout(() => p.remove(), (dur + 2) * 1000);
  }

  function startPetals() {
    if (!petalsEl) return;
    spawnPetal();
    for (let i = 0; i < 12; i += 1) {
      setTimeout(spawnPetal, Math.random() * 4000);
    }
    setInterval(spawnPetal, 800);
  }

  function getSpreadEl(idx) {
    return document.getElementById("spread-" + idx);
  }

  function updateNav() {
    if (!prevBtn || !nextBtn || !pageCounter) return;

    if (isBookClosed) {
      prevBtn.disabled = true;
      nextBtn.disabled = false;
      pageCounter.textContent = "Bia / " + TOTAL_PAGES;
      return;
    }

    prevBtn.disabled = currentSpread === 0;
    nextBtn.disabled = currentSpread === TOTAL_SPREADS - 1;

    if (currentSpread === 0) {
      pageCounter.textContent = "1 / " + TOTAL_PAGES;
    } else {
      const left = currentSpread * 2;
      const right = left + 1;
      pageCounter.textContent = left + "-" + right + " / " + TOTAL_PAGES;
    }
  }

  function resetBookToClosed() {
    for (let i = 0; i < TOTAL_SPREADS; i += 1) {
      const spread = getSpreadEl(i);
      if (!spread) continue;
      spread.classList.remove("no-fade");
      spread.classList.toggle("hidden", i !== 0);
    }

    currentSpread = 0;
    isAnimating = false;
    isBookClosed = true;
    if (book) { book.classList.remove("opening-cover"); book.classList.add("is-closed"); }
    if (prevBtn) prevBtn.style.display = "none";
    updateNav();
  }

  function closeModal() {
    if (isAnimating) return;
    if (bookModal) bookModal.classList.add("hidden");
    if (landing) landing.classList.remove("fade-out");
    void exitFullscreen();
    setTimeout(() => {
      resetBookToClosed();
    }, 400);
  }

  function openCoverFromRightToLeft() {
    if (isAnimating || !isBookClosed) return;
    if (!book) { isBookClosed = false; if (prevBtn) prevBtn.style.display = ""; updateNav(); return; }
    isAnimating = true;
    book.classList.add("opening-cover");
    setTimeout(() => {
      // Remove both state classes together to avoid one-frame flicker.
      book.classList.remove("opening-cover", "is-closed");
      isBookClosed = false;
      if (prevBtn) prevBtn.style.display = "";
      updateNav();
      isAnimating = false;
    }, OPEN_COVER_DURATION);
  }

  function closeCoverFromLeftToRight() {
    if (isAnimating || isBookClosed) return;
    if (!book) {
      isBookClosed = true;
      if (prevBtn) prevBtn.style.display = "none";
      updateNav();
      return;
    }

    isAnimating = true;
    book.classList.add("closing-cover");

    setTimeout(() => {
      book.classList.remove("closing-cover");
      book.classList.add("is-closed");
      isBookClosed = true;
      if (prevBtn) prevBtn.style.display = "none";
      updateNav();
      isAnimating = false;
    }, CLOSE_COVER_DURATION);
  }

  function flipTo(targetSpread) {
    if (isBookClosed || isAnimating) return;
    if (targetSpread === currentSpread) return;
    if (targetSpread < 0 || targetSpread >= TOTAL_SPREADS) return;

    const fromSpread = getSpreadEl(currentSpread);
    const toSpread = getSpreadEl(targetSpread);
    if (!fromSpread || !toSpread) return;

    const fromLeft = fromSpread.querySelector(".page-left");
    const fromRight = fromSpread.querySelector(".page-right");
    const toLeft = toSpread.querySelector(".page-left");
    const toRight = toSpread.querySelector(".page-right");

    isAnimating = true;
    const forward = targetSpread > currentSpread;

    fromSpread.classList.add("no-fade");
    toSpread.classList.add("no-fade");
    void toSpread.offsetWidth;

    if (forward) {
      toSpread.classList.remove("hidden");

      if (fromRight) fromRight.classList.add("flipping-out-right");
      if (toLeft) toLeft.classList.add("flipping-in-left");

      setTimeout(() => {
        fromSpread.classList.add("hidden");
        if (fromRight) fromRight.classList.remove("flipping-out-right");
        if (toLeft) toLeft.classList.remove("flipping-in-left");
        requestAnimationFrame(() => {
          fromSpread.classList.remove("no-fade");
          toSpread.classList.remove("no-fade");
        });
        currentSpread = targetSpread;
        updateNav();
        isAnimating = false;
      }, FLIP_DURATION);
    } else {
      if (fromLeft) fromLeft.classList.add("flipping-out-left");
      if (toRight) toRight.classList.add("flipping-in-right");
      toSpread.classList.remove("hidden");

      setTimeout(() => {
        fromSpread.classList.add("hidden");
        if (fromLeft) fromLeft.classList.remove("flipping-out-left");
        if (toRight) toRight.classList.remove("flipping-in-right");
        requestAnimationFrame(() => {
          fromSpread.classList.remove("no-fade");
          toSpread.classList.remove("no-fade");
        });
        currentSpread = targetSpread;
        updateNav();
        isAnimating = false;
      }, FLIP_DURATION);
    }
  }

  function showToast(el) {
    if (!el) return;
    el.classList.remove("hidden", "show");
    void el.offsetWidth;
    el.classList.add("show");
    setTimeout(() => {
      el.classList.remove("show");
      el.classList.add("hidden");
    }, 3800);
  }

  function showNotice(message, toastEl) {
    if (noticeMessage && noticeModal) {
      if (noticeHideTimer) {
        clearTimeout(noticeHideTimer);
        noticeHideTimer = null;
      }

      noticeMessage.textContent = message;
      noticeModal.classList.remove("hidden");
      noticeModal.classList.remove("is-hiding");
      void noticeModal.offsetWidth;
      noticeModal.classList.add("is-visible");
      noticeModal.setAttribute("aria-hidden", "false");

      if (noticeOkBtn) {
        setTimeout(() => noticeOkBtn.focus(), 20);
      }

      return;
    }

    // Fallback for unexpected DOM mismatches.
    if (toastEl) {
      toastEl.textContent = message;
      showToast(toastEl);
    }
  }

  function hideNotice() {
    if (!noticeModal) return;

    noticeModal.classList.remove("is-visible");
    noticeModal.classList.add("is-hiding");
    noticeModal.setAttribute("aria-hidden", "true");

    if (noticeHideTimer) {
      clearTimeout(noticeHideTimer);
    }

    noticeHideTimer = setTimeout(() => {
      noticeModal.classList.add("hidden");
      noticeModal.classList.remove("is-hiding");
      noticeHideTimer = null;
    }, NOTICE_HIDE_DURATION);
  }

  function sanitize(str) {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return str.replace(/[&<>"']/g, (c) => map[c]);
  }

  async function enterFullscreen() {
    const root = document.documentElement;

    if (!root || document.fullscreenElement || !root.requestFullscreen) return;

    try {
      await root.requestFullscreen({ navigationUI: "hide" });
    } catch (_error) {
      // Browser support varies on mobile; ignore rejected requests.
    }
  }

  async function exitFullscreen() {
    if (!document.fullscreenElement || !document.exitFullscreen) return;

    try {
      await document.exitFullscreen();
    } catch (_error) {
      // Ignore browsers that do not allow programmatic fullscreen exit.
    }
  }

  if (openBtn) {
    openBtn.addEventListener("click", () => {
      void enterFullscreen();
      if (landing) landing.classList.add("fade-out");
      if (bookModal) bookModal.classList.remove("hidden");
      resetBookToClosed();
    });
  }

  if (bookWrapper) {
    bookWrapper.addEventListener("click", (e) => e.stopPropagation());
  }

  if (noticeOkBtn) {
    noticeOkBtn.addEventListener("click", hideNotice);
  }

  if (noticeModal) {
    noticeModal.addEventListener("click", (e) => {
      if (e.target === noticeModal) hideNotice();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && noticeModal && !noticeModal.classList.contains("hidden")) {
      hideNotice();
    }
  });

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (modalBg) {
    modalBg.addEventListener("click", (e) => {
      if (e.target === modalBg) closeModal();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (isAnimating) return;
      if (isBookClosed) {
        openCoverFromRightToLeft();
        return;
      }
      flipTo(currentSpread + 1);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (isAnimating || isBookClosed) return;
      if (currentSpread === 0) {
        closeCoverFromLeftToRight();
        return;
      }
      flipTo(currentSpread - 1);
    });
  }

  document.addEventListener("keydown", (e) => {
    if (!bookModal || bookModal.classList.contains("hidden")) return;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      if (isBookClosed) {
        openCoverFromRightToLeft();
      } else {
        flipTo(currentSpread + 1);
      }
    }

    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      if (!isBookClosed && currentSpread === 0) {
        closeCoverFromLeftToRight();
      } else {
        flipTo(currentSpread - 1);
      }
    }

    if (e.key === "Escape") {
      closeModal();
    }
  });

  if (book) {
    let touchStartX = 0;
    book.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    book.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) <= 40) return;

      if (dx < 0) {
        if (isBookClosed) {
          openCoverFromRightToLeft();
        } else {
          flipTo(currentSpread + 1);
        }
      } else if (!isBookClosed && currentSpread === 0) {
        closeCoverFromLeftToRight();
      } else {
        flipTo(currentSpread - 1);
      }
    }, { passive: true });
  }

  if (rsvpForm) {
    rsvpForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showNotice("Đã gửi xác nhận tham dự thành công!", rsvpToast);
      rsvpForm.reset();
    });
  }

  if (wishForm && wishList) {
    wishForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameInput = wishForm.querySelector('input[type="text"]');
      const msgInput = wishForm.querySelector("textarea");
      const name = sanitize(nameInput ? nameInput.value.trim() : "");
      const msg = sanitize(msgInput ? msgInput.value.trim() : "");

      if (!name || !msg) return;

      const item = document.createElement("div");
      item.className = "wish-item";
      item.innerHTML = "<strong>" + name + ":</strong> \"" + msg + "\"";
      wishList.prepend(item);
      wishForm.reset();
      showNotice("Gửi lời chúc thành công!", wishToast);
    });
  }

  decorateInnerPages();
  startPetals();
  resetBookToClosed();
})();

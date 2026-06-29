/* ============================================================
   PROJECT ELIJAH — script.js
   Features:
     • Active nav highlight (based on current page)
     • Header shadow on scroll
     • Mobile hamburger menu
     • Scroll-triggered animations (slide-left / slide-right / fade-up)
     • Image grid alternating slide directions
     • Animated stat counters
     • Image lightbox
     • Back-to-top button
   ============================================================ */

(function () {
  "use strict";

  /* ────────────────────────────────────────
     1. ACTIVE NAV HIGHLIGHT
  ──────────────────────────────────────── */
  function setActiveNav() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const links = document.querySelectorAll("nav ul li a");

    links.forEach((link) => {
      link.classList.remove("active");
      const href = link.getAttribute("href");
      if (
        href === currentPage ||
        (currentPage === "" && href === "index.html") ||
        (currentPage === "index.html" && href === "index.html")
      ) {
        link.classList.add("active");
      }
    });
  }

  /* ────────────────────────────────────────
     2. HEADER SHADOW ON SCROLL
  ──────────────────────────────────────── */
  function initHeaderScroll() {
    const header = document.querySelector("header");
    if (!header) return;

    function updateHeader() {
      if (window.scrollY > 20) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }

    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();
  }

  /* ────────────────────────────────────────
     3. HAMBURGER / MOBILE MENU
  ──────────────────────────────────────── */
  function initHamburger() {
    // Inject hamburger button if not already in HTML
    const header = document.querySelector("header");
    if (!header) return;

    if (!header.querySelector(".hamburger")) {
      const btn = document.createElement("button");
      btn.className = "hamburger";
      btn.setAttribute("aria-label", "Toggle menu");
      btn.innerHTML = "<span></span><span></span><span></span>";
      header.appendChild(btn);
    }

    const hamburger = header.querySelector(".hamburger");
    const navUl = header.querySelector("nav ul");

    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("open");
      navUl.classList.toggle("open");
    });

    // Close menu on link click
    navUl.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("open");
        navUl.classList.remove("open");
      });
    });
  }

  /* ────────────────────────────────────────
     4. SCROLL ANIMATIONS
     Images in .grid: odd → slide-left, even → slide-right
     Section headings, cards, etc. → fade-up
  ──────────────────────────────────────── */
  function initScrollAnimations() {
    // Assign slide classes to grid images
    document.querySelectorAll(".grid img").forEach((img, i) => {
      img.classList.add(i % 2 === 0 ? "slide-left" : "slide-right");
    });

    // Assign fade-up to other animatable elements
    // NOTE: .page-banner h1 is intentionally excluded — it must always be visible
    const fadeTargets = [
      ".intro h2",
      ".intro p",
      ".stats .card",
      ".about-content h2",
      ".about-content p",
      ".member-card",
      ".contact-card",
      ".featured h2",
      ".gallery-section h2",
      ".donation h2",
      ".donation > p",
      ".donation-details",
      ".gcash-qr",
      ".hero-content",
    ];

    fadeTargets.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        if (!el.classList.contains("slide-left") && !el.classList.contains("slide-right")) {
          el.classList.add("fade-up");
        }
      });
    });

    // IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Stagger children in .grid
            const el = entry.target;

            // Small delay based on position in parent
            const siblings = el.parentElement
              ? Array.from(el.parentElement.children)
              : [];
            const idx = siblings.indexOf(el);
            const delay = idx * 80; // ms

            setTimeout(() => {
              el.classList.add("visible");
            }, delay);

            observer.unobserve(el);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    document
      .querySelectorAll(".slide-left, .slide-right, .fade-up")
      .forEach((el) => observer.observe(el));
  }

  /* ────────────────────────────────────────
     5. ANIMATED STAT COUNTERS
  ──────────────────────────────────────── */
  function initCounters() {
    const counters = document.querySelectorAll(".counter");
    if (!counters.length) return;

    function animateCounter(el) {
      const target = parseInt(el.getAttribute("data-target"), 10);
      const duration = 1800;
      const start = performance.now();

      function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target + (target >= 100 ? "+" : "");
      }

      requestAnimationFrame(step);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((c) => observer.observe(c));
  }

  /* ────────────────────────────────────────
     6. IMAGE LIGHTBOX
  ──────────────────────────────────────── */
  function initLightbox() {
    // Create overlay
    const overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    overlay.innerHTML = `
      <button class="lightbox-close" aria-label="Close">&times;</button>
      <img src="" alt="Gallery image">
    `;
    document.body.appendChild(overlay);

    const overlayImg = overlay.querySelector("img");
    const closeBtn = overlay.querySelector(".lightbox-close");

    function openLightbox(src) {
      overlayImg.src = src;
      overlay.classList.add("open");
      document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
      overlay.classList.remove("open");
      document.body.style.overflow = "";
      setTimeout(() => { overlayImg.src = ""; }, 300);
    }

    // Bind grid images
    document.querySelectorAll(".grid img").forEach((img) => {
      img.style.cursor = "pointer";
      img.addEventListener("click", () => openLightbox(img.src));
    });

    closeBtn.addEventListener("click", closeLightbox);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
    });
  }

  /* ────────────────────────────────────────
     7. BACK-TO-TOP BUTTON
  ──────────────────────────────────────── */
  function initBackToTop() {
    const btn = document.getElementById("topBtn");
    if (!btn) return;

    // Replace emoji with arrow
    btn.textContent = "↑";

    function updateBtn() {
      if (window.scrollY > 400) {
        btn.classList.add("visible");
      } else {
        btn.classList.remove("visible");
      }
    }

    window.addEventListener("scroll", updateBtn, { passive: true });
    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    updateBtn();
  }

  /* ────────────────────────────────────────
     8. HERO PARALLAX (subtle)
  ──────────────────────────────────────── */
  function initHeroParallax() {
    const hero = document.querySelector(".hero");
    if (!hero) return;

    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        hero.style.backgroundPositionY = `${y * 0.4}px`;
      },
      { passive: true }
    );
  }

  /* ────────────────────────────────────────
     INIT ALL
  ──────────────────────────────────────── */
  document.addEventListener("DOMContentLoaded", () => {
    setActiveNav();
    initHeaderScroll();
    initHamburger();
    initScrollAnimations();
    initCounters();
    initLightbox();
    initBackToTop();
    initHeroParallax();
  });
})();

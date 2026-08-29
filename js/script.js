(function () {
  "use strict";

  /* ============ Language switching ============ */
  var LANG_KEY = "cot-lang";

  function applyLang(lang) {
    var dict = translations[lang] || translations.en;
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key] !== undefined) {
        el.innerHTML = dict[key];
      }
    });

    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      var isActive = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });

    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
  }

  function initLang() {
    var stored = "en";
    try { stored = localStorage.getItem(LANG_KEY) || "en"; } catch (e) {}
    applyLang(stored);

    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyLang(btn.getAttribute("data-lang"));
      });
    });
  }

  /* ============ Sticky header shadow ============ */
  function initHeaderScroll() {
    var header = document.getElementById("site-header");
    if (!header) return;
    function onScroll() {
      header.classList.toggle("is-scrolled", window.scrollY > 10);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ============ Mobile menu ============ */
  function initMobileMenu() {
    var toggle = document.getElementById("menu-toggle");
    var nav = document.getElementById("main-nav");
    if (!toggle || !nav) return;

    function closeMenu() {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    }

    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ============ Dropdown (Our Actions) ============ */
  function initDropdown() {
    var item = document.querySelector(".has-dropdown");
    var btn = document.getElementById("actions-menu-btn");
    if (!item || !btn) return;

    function close() {
      item.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    }
    function open() {
      item.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
    }

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (item.classList.contains("is-open")) close(); else open();
    });

    document.addEventListener("click", function (e) {
      if (!item.contains(e.target)) close();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ============ Scroll reveal ============
     A plain scroll-position sweep rather than relying solely on
     IntersectionObserver: a single large jump (anchor click, Page Down,
     a fast trackpad flick, or window.scrollTo) can move a section past
     the viewport in one reflow, so it's never sampled as "intersecting"
     and would otherwise stay permanently at opacity:0. Checking bounding
     rects on scroll/resize/hashchange guarantees everything above the
     fold gets revealed no matter how the scroll happened. */
  function initReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (!items.length) return;

    var ticking = false;

    function sweep() {
      ticking = false;
      var viewBottom = window.innerHeight * 0.94;
      items = items.filter(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top < viewBottom) {
          el.classList.add("is-visible");
          return false;
        }
        return true;
      });
      if (!items.length) {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(sweep);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("hashchange", onScroll);
    sweep();

    /* Safety net: decorative animation must never be able to permanently
       hide real content (throttled background tabs, unusual input devices,
       a scroll event that never fires for some reason). Force everything
       visible shortly after load no matter what. */
    setTimeout(function () {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      items = [];
    }, 2500);
  }

  /* ============ Gallery carousel ============ */
  function initGallery() {
    var track = document.getElementById("gallery-track");
    var prev = document.querySelector(".gallery-prev");
    var next = document.querySelector(".gallery-next");
    if (!track || !prev || !next) return;

    function scrollByCard(direction) {
      var card = track.querySelector("li");
      var gap = 20;
      var amount = card ? (card.getBoundingClientRect().width + gap) * direction : 300 * direction;
      track.scrollBy({ left: amount, behavior: "smooth" });
    }

    prev.addEventListener("click", function () { scrollByCard(-1); });
    next.addEventListener("click", function () { scrollByCard(1); });
  }

  /* ============ Contact form (mailto fallback) ============ */
  function initContactForm() {
    var form = document.getElementById("contact-form");
    var note = document.getElementById("form-note");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var subject = form.subject.value;
      var message = form.message.value.trim();

      var body = "Name: " + name + "\nEmail: " + email + "\n\n" + message;
      var mailto = "mailto:contact@creativestomorrow.org" +
        "?subject=" + encodeURIComponent("[Creatives of Tomorrow] " + subject) +
        "&body=" + encodeURIComponent(body);

      window.location.href = mailto;

      var lang = document.documentElement.lang || "en";
      if (note) note.textContent = translations[lang].form_note_success;
    });
  }

  /* ============ Init ============ */
  document.addEventListener("DOMContentLoaded", function () {
    initLang();
    initHeaderScroll();
    initMobileMenu();
    initDropdown();
    initReveal();
    initGallery();
    initContactForm();
  });
})();

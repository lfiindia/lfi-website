// ============ LFI INDIA — shared site behavior ============

// Navbar solid-on-scroll + mobile menu
(function () {
  const nav = document.querySelector(".navbar");
  const toggle = document.querySelector(".nav-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const isHome = document.body.dataset.page === "home";

  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 40 || !isHome) nav.classList.add("solid");
    else nav.classList.remove("solid");
  }
  window.addEventListener("scroll", onScroll);
  onScroll();

  if (toggle && mobileMenu) {
    toggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
      const isOpen = mobileMenu.classList.contains("open");
      toggle.innerHTML = isOpen
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>';
      if (isOpen) nav.classList.add("solid");
    });
  }
})();

// Home hero slider - starts auto-advancing as soon as the page opens (every 8s),
// arrows/dots/swipe jump to a slide and restart the timer; only a hidden tab pauses it
(function () {
  const slider = document.querySelector(".hero-slider");
  if (!slider) return;
  const slides = slider.querySelectorAll(".hero-slide");
  const dots = slider.querySelectorAll(".hero-dot");
  if (slides.length < 2) return;

  const INTERVAL = 8000;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  slider.style.setProperty("--hero-interval", INTERVAL + "ms");
  let current = 0;
  let timer = null;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
      slide.inert = !active;
    });
    dots.forEach((dot, i) => {
      const active = i === current;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-selected", active ? "true" : "false");
      // Restart the progress bar animation on the newly active dot
      const bar = dot.querySelector("span");
      if (active && bar) { bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = ""; }
    });
  }

  function start() {
    if (reduceMotion) return;
    stop();
    slider.classList.remove("is-paused");
    timer = setInterval(() => show(current + 1), INTERVAL);
  }
  function stop() {
    clearInterval(timer);
    timer = null;
  }
  function pause() { stop(); slider.classList.add("is-paused"); }
  function go(index) { show(index); start(); }

  dots.forEach((dot, i) => dot.addEventListener("click", () => go(i)));
  slider.querySelectorAll(".hero-arrow").forEach((btn) =>
    btn.addEventListener("click", () => go(current + Number(btn.dataset.dir)))
  );

  document.addEventListener("visibilitychange", () => (document.hidden ? pause() : start()));

  let touchX = null;
  slider.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1));
  });

  if (reduceMotion) slider.classList.add("is-paused");
  show(0);
  start();
})();

// Scroll-reveal animation
(function () {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );
  items.forEach((el) => io.observe(el));

  // Safety net: if an element never crosses the observer threshold
  // (e.g. very short page, unusual layout), don't leave it hidden forever.
  setTimeout(() => {
    document.querySelectorAll(".reveal:not(.visible)").forEach((el) => el.classList.add("visible"));
  }, 2500);
})();

// Animated stat counters
(function () {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || "";
        const duration = 1500;
        const start = performance.now();
        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach((el) => io.observe(el));
})();

// Portfolio filter
(function () {
  const buttons = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll("[data-category]");
  if (!buttons.length) return;
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.dataset.filter;
      cards.forEach((card) => {
        const match = cat === "All" || card.dataset.category === cat;
        card.classList.toggle("hidden", !match);
      });
    });
  });
})();

// Generic carousel nav (prev/next buttons scroll the track)
document.querySelectorAll(".carousel").forEach((carousel) => {
  const track = carousel.querySelector(".carousel-track");
  const prev = carousel.querySelector(".carousel-prev");
  const next = carousel.querySelector(".carousel-next");
  if (!track) return;
  const scrollAmount = () => track.firstElementChild?.offsetWidth + 24 || 320;
  prev?.addEventListener("click", () => track.scrollBy({ left: -scrollAmount(), behavior: "smooth" }));
  next?.addEventListener("click", () => track.scrollBy({ left: scrollAmount(), behavior: "smooth" }));
});

// FAQ accordion
document.querySelectorAll(".faq-item").forEach((item) => {
  const q = item.querySelector(".faq-q");
  q?.addEventListener("click", () => {
    const wasOpen = item.classList.contains("open");
    item.parentElement.querySelectorAll(".faq-item").forEach((i) => i.classList.remove("open"));
    if (!wasOpen) item.classList.add("open");
  });
});

// Client-side validation + submission to FormSubmit (formsubmit.co) via
// their AJAX endpoint. Since this always runs on the live site over HTTPS —
// never opened as a local file — a fetch()-based JSON POST works reliably
// and isn't subject to the CORS issues a plain file:// page would hit.
function setupForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  const successPanel = document.getElementById(formId + "-success");
  const errorEl = form.querySelector(".form-submit-error");
  const endpoint = form.dataset.apiEndpoint;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let valid = true;
    form.querySelectorAll("[data-required]").forEach((field) => {
      const wrapper = field.closest(".field");
      const value = field.value.trim();
      let ok = value.length > 0;
      if (field.type === "email" && ok) ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (field.dataset.minlength && ok) ok = value.length >= parseInt(field.dataset.minlength, 10);
      wrapper.classList.toggle("error", !ok);
      if (!ok) valid = false;
    });
    if (!valid) return;

    if (errorEl) errorEl.style.display = "none";
    const btn = form.querySelector("button[type=submit]");
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = "Sending...";

    const payload = {};
    Array.from(form.elements).forEach((el) => {
      if (!el.name) return;
      const value = el.value.trim();
      if (value) payload[el.name] = value;
    });

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (!res.ok) throw new Error("Request failed: " + res.status);
        return res.json();
      })
      .then(() => {
        form.style.display = "none";
        if (successPanel) successPanel.style.display = "block";
        form.reset();
      })
      .catch(() => {
        if (errorEl) errorEl.style.display = "block";
      })
      .finally(() => {
        btn.disabled = false;
        btn.innerHTML = originalText;
      });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupForm("contact-form");
  setupForm("inquiry-form");
});

// PMS App download popup - every link marked data-download opens it.
// Without JS those links still go straight to the web-app install page.
(function () {
  // Windows installer, hosted as a GitHub release asset (direct download). New version = new release + update this URL
  const WINDOWS_DOWNLOAD_URL = "https://github.com/lfiindia/lfi-website/releases/download/pms-app-v1.0.2/PmsApp-Setup-1.0.2.exe";
  const INSTALL_URL = "https://pms.lfiindia.in/install";
  const BROWSER_URL = "https://pms.lfiindia.in/";

  // Keep every direct Windows download link (e.g. the footer card) on the current installer
  document.querySelectorAll("a[data-windows-download]").forEach((a) => { a.href = WINDOWS_DOWNLOAD_URL; });

  const links = document.querySelectorAll("a[data-download]");
  if (!links.length) return;

  const isWindows = /Windows/i.test(navigator.userAgent);
  const winIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 5.1 10.4 4v7.2H3zM11.3 3.9 21 2.5v8.7h-9.7zM3 12.1h7.4v7.2L3 18.2zM11.3 12.1H21v8.7l-9.7-1.4z"/></svg>';
  const webIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 21h8M12 18v3M12 7v7M9 11l3 3 3-3"/></svg>';

  const modal = document.createElement("div");
  modal.className = "dl-modal";
  modal.hidden = true;
  modal.innerHTML =
    '<div class="dl-backdrop" data-dl-close></div>' +
    '<div class="dl-dialog" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="dl-title">' +
      '<button type="button" class="dl-close" aria-label="Close" data-dl-close><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
      '<div class="dl-head"><img src="assets/app-icon.png?v=3" alt="" class="dl-logo" /><div><h2 id="dl-title">Get PMS App</h2><p>by LINCON FILMS AND INFOWAY</p></div></div>' +
      '<a class="dl-option dl-windows' + (isWindows ? "" : " is-disabled") + '" href="' + WINDOWS_DOWNLOAD_URL + '"' + (isWindows ? " download" : ' aria-disabled="true" tabindex="-1"') + '>' +
        '<span class="dl-icon">' + winIcon + '</span>' +
        '<span class="dl-text"><strong>Download for Windows</strong><small>' + (isWindows ? "PMS App Desktop &middot; Windows 10 / 11" : "PMS App Desktop is available for Windows only") + '</small></span>' +
        '<span class="dl-badge">Windows only</span>' +
      '</a>' +
      '<a class="dl-option dl-web" href="' + INSTALL_URL + '">' +
        '<span class="dl-icon">' + webIcon + '</span>' +
        '<span class="dl-text"><strong>Install PMS Web App</strong><small>Android, iPhone, Mac &amp; Windows</small></span>' +
      '</a>' +
      '<a class="dl-continue" href="' + BROWSER_URL + '">or continue in browser &rarr;</a>' +
    '</div>';
  document.body.appendChild(modal);

  const dialog = modal.querySelector(".dl-dialog");
  let lastFocus = null;

  function open(e) {
    e.preventDefault();
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("dl-open");
    requestAnimationFrame(() => modal.classList.add("is-open"));
    (modal.querySelector(".dl-option:not(.is-disabled)") || dialog).focus();
  }
  function close() {
    modal.classList.remove("is-open");
    document.body.classList.remove("dl-open");
    modal.hidden = true;
    if (lastFocus) lastFocus.focus();
  }

  links.forEach((a) => a.addEventListener("click", open));
  modal.addEventListener("click", (e) => {
    if (e.target.closest("[data-dl-close]")) close();
    if (e.target.closest(".dl-option.is-disabled")) e.preventDefault();
  });
  document.addEventListener("keydown", (e) => {
    if (!modal.hidden && e.key === "Escape") close();
  });
})();

/* ==========================================================================
   DESİL — main.js
   Hafif etkileşimler: sticky header · mobil menü · scroll-reveal ·
   hero veri-noktası dokusu (hafif canvas). Ağır animasyon yok.
   ========================================================================== */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Topbar + sticky header --------------------------------------------
     Topbar akışta durur; header absolute top:var(--topbar-h) başlar. Scroll
     topbar yüksekliğine ulaştığı anda is-stuck header'ı fixed top:0'a alır —
     geçiş pikselde dikişsizdir. --topbar-h JS ölçümüyle gerçek yükseklikte
     tutulur (mobilde satır yüksekliği değişebilir). */
  var header = document.querySelector(".site-header");
  var topbar = document.querySelector(".topbar");
  /* Hero perde (curtain) referansları — ayrıntı: header-scroll-kesif.md §5 */
  var heroZone = document.querySelector(".hero-zone");
  var heroSticky = document.querySelector(".hero.hero-sticky");
  var heroVideo = document.querySelector(".hero-video");
  var curtainMQ = window.matchMedia("(min-width: 1024px)");
  var heroCovered = false;                        // perde hero'yu tam örttü mü
  var canvasStart = null, canvasStop = null;      // canvas rAF kontrolü (canvas bloğu doldurur)
  function topbarH() { return topbar ? topbar.offsetHeight : 0; }
  function syncTopbar() {
    document.documentElement.style.setProperty("--topbar-h", topbarH() + "px");
  }
  syncTopbar();
  window.addEventListener("resize", syncTopbar);
  function onScroll() {
    if (header) header.classList.toggle("is-stuck", window.scrollY >= topbarH());
    syncHeroCurtain();
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* --- Hero perde (curtain) senkron -------------------------------------
     Perde ≥1024px + motion açıkken hero viewport'a çakılı sabit kalır; scrollY
     spacer yüksekliğini (100vh) geçince perde hero'yu tamamen örter. Fixed hero
     IntersectionObserver'a HEP "görünür" der; bu yüzden örtüldüğünde video +
     canvas motoru burada ELLE durdurulur (sürdürülebilirlik — §5.4-d).
     Mobil/reduced-motion'da active=false → hiç müdahale yok, normal akış. */
  function syncHeroCurtain() {
    if (!heroZone || !heroSticky) return;
    var active = curtainMQ.matches && !prefersReduced;
    var covered = active && window.scrollY > heroZone.offsetHeight;
    if (covered === heroCovered) return;          // durum değişmediyse çık (play() spam'i yok)
    heroCovered = covered;
    heroSticky.classList.toggle("is-hidden", covered);
    if (covered) {
      if (canvasStop) canvasStop();
      if (heroVideo) heroVideo.pause();
    } else {
      if (canvasStart) canvasStart();
      if (heroVideo && !prefersReduced) { var p = heroVideo.play(); if (p && p.catch) p.catch(function () {}); }
    }
  }
  window.addEventListener("resize", syncHeroCurtain);
  if (curtainMQ.addEventListener) curtainMQ.addEventListener("change", syncHeroCurtain);

  /* --- Mobil menü -------------------------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  function closeNav() {
    document.body.classList.remove("nav-open");
    if (nav) nav.classList.remove("is-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
    // Masaüstüne dönünce menüyü sıfırla
    window.matchMedia("(min-width: 901px)").addEventListener("change", closeNav);
  }

  /* --- Scroll-reveal (hafif) -------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* --- Hero veri-noktası dokusu ----------------------------------------
     Yükselen bir düğüm (node) alanı: markanın "veriyle etki" ve logonun
     yukarı yönelen ok motifini yansıtır. Hafif; reduced-motion'da statik. */
  var canvas = document.querySelector(".hero-canvas");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var nodes = [];
    var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var CYAN = "#2AD4FF";  // koyu video üstünde açık düğümler
    var raf = null;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (prefersReduced) draw(); // tek kare
    }

    function seed() {
      nodes = [];
      var count = Math.max(12, Math.min(24, Math.round((W * H) / 13000)));
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 1.4 + Math.random() * 2.2,
          vx: (Math.random() - 0.5) * 0.12,
          vy: -(0.05 + Math.random() * 0.14),        // hafif yukarı akış
          cyan: Math.random() < 0.22,
          t: Math.random() * Math.PI * 2
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var LINK = 118;

      // Bağlantı hairline'ları
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var a = nodes[i], b = nodes[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK) {
            var alpha = (1 - d / LINK) * 0.28;
            ctx.strokeStyle = "rgba(200,232,255," + alpha.toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Yükselen trend çizgisi (logonun ok motifi)
      ctx.beginPath();
      ctx.moveTo(W * 0.10, H * 0.82);
      ctx.bezierCurveTo(W * 0.35, H * 0.74, W * 0.52, H * 0.52, W * 0.90, H * 0.20);
      ctx.strokeStyle = "rgba(42,212,255,0.38)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Düğümler
      for (var k = 0; k < nodes.length; k++) {
        var n = nodes[k];
        var pulse = prefersReduced ? 0 : Math.sin(n.t) * 0.4;
        var r = Math.max(0.8, n.r + pulse);
        if (n.cyan) {
          ctx.shadowColor = "rgba(42,212,255,0.8)";
          ctx.shadowBlur = 10;
          ctx.fillStyle = CYAN;
        } else {
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.fillStyle = "rgba(255,255,255,0.65)";
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    function tick() {
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy; n.t += 0.02;
        if (n.y < -6) { n.y = H + 6; n.x = Math.random() * W; }
        if (n.x < -6) n.x = W + 6;
        if (n.x > W + 6) n.x = -6;
      }
      draw();
      raf = requestAnimationFrame(tick);
    }

    var ro = ("ResizeObserver" in window) ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(canvas); else window.addEventListener("resize", resize);
    resize();

    if (!prefersReduced) {
      // Görünürken çalış, sekme/dışarı çıkınca dur (sürdürülebilir)
      var running = false;
      // heroCovered: perde altındayken (fixed hero) rAF başlatma — IO hep "görünür" der
      function start() { if (!running && !heroCovered) { running = true; raf = requestAnimationFrame(tick); } }
      function stop() { running = false; if (raf) cancelAnimationFrame(raf); }
      canvasStart = start; canvasStop = stop;   // curtain senkronunun erişebilmesi için dışa aç
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) stop(); else start();
      });
      var heroObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.isIntersecting ? start() : stop(); });
      }, { threshold: 0 });
      heroObserver.observe(canvas);
    }
  }

  /* --- Arka plan videoları (hero + bölüm bantları) ----------------------
     Sürdürülebilir web: görünürken oynat, görünmezken/sekme gizliyken durdur;
     reduced-motion'da hiç oynatma (poster kalır). Tümü preload="none"/metadata. */
  var bgVideos = Array.prototype.slice.call(document.querySelectorAll("video[data-bg]"));
  if (bgVideos.length) {
    function playVid(v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    if (prefersReduced) {
      bgVideos.forEach(function (v) { v.removeAttribute("autoplay"); v.pause(); });
    } else if ("IntersectionObserver" in window) {
      var vio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (document.hidden) return;
          e.isIntersecting ? playVid(e.target) : e.target.pause();
        });
      }, { threshold: 0.1 });
      bgVideos.forEach(function (v) { vio.observe(v); });
      document.addEventListener("visibilitychange", function () {
        bgVideos.forEach(function (v) {
          if (document.hidden) { v.pause(); return; }
          if (heroCovered && v === heroVideo) return;   // perde altında hero video'yu replay etme
          var r = v.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) playVid(v);
        });
      });
    }
  }

  /* --- Carousel (scroll-snap tabanlı, kütüphanesiz) ----------------------
     [data-carousel] kökü: .carousel-track + .carousel-prev/next. Dokunmatik
     kaydırma native scroll; oklar kart genişliği kadar kaydırır. */
  document.querySelectorAll("[data-carousel]").forEach(function (root) {
    var track = root.querySelector(".carousel-track");
    var prev = root.querySelector(".carousel-prev");
    var next = root.querySelector(".carousel-next");
    if (!track) return;
    function step() {
      var item = track.firstElementChild;
      if (!item) return track.clientWidth;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return item.getBoundingClientRect().width + gap;
    }
    function update() {
      var max = track.scrollWidth - track.clientWidth - 1;
      if (prev) prev.disabled = track.scrollLeft <= 0;
      if (next) next.disabled = track.scrollLeft >= max;
    }
    function go(dir) {
      track.scrollBy({ left: dir * step(), behavior: prefersReduced ? "auto" : "smooth" });
    }
    if (prev) prev.addEventListener("click", function () { go(-1); });
    if (next) next.addEventListener("click", function () { go(1); });
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });

  /* --- Footer perdesi (reveal) -------------------------------------------
     DadaMutfak'ta kanıtlı teknik: desktop'ta footer fixed bottom'da bekler,
     içerik sonuna footer yüksekliği kadar boşluk açılır — scroll sonunda
     içerik kalkar, footer açığa çıkar. Mobil (≤640) statik. Emniyet: footer
     viewport'a sığmıyorsa reveal devre dışı (statik akışa döner). */
  var pageMain = document.querySelector(".page-main");
  var siteFooter = document.querySelector(".site-footer");
  function fitFooter() {
    if (!pageMain || !siteFooter) return;
    document.body.classList.remove("has-reveal");
    pageMain.style.marginBottom = "";
    if (!window.matchMedia("(min-width: 641px)").matches) return;
    var h = siteFooter.offsetHeight; // statik durumda ölçülür
    if (h > 0 && h <= window.innerHeight * 0.92) {
      document.body.classList.add("has-reveal");
      pageMain.style.marginBottom = h + "px";
    }
  }
  fitFooter();
  window.addEventListener("resize", fitFooter);
  window.addEventListener("load", fitFooter);           // font/logo yüklenince yükseklik oturur
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitFooter);

  /* --- İçerik sekmeleri (data-tabs) — jenerik, R3 ----------------------- */
  var tabRoots = document.querySelectorAll("[data-tabs]");
  Array.prototype.forEach.call(tabRoots, function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return;
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(tab); });
      tab.addEventListener("keydown", function (e) {
        var dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        select(tabs[(i + dir + tabs.length) % tabs.length], true);
      });
    });
    var initial = tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0];
    select(initial || tabs[0]);
  });

  /* --- KVKK bilgilendirme ve onay bandı (R4 m.14) ------------------------ */
  (function () {
    var KEY = "desil-consent";
    var stored = null;
    try { stored = localStorage.getItem(KEY); } catch (e) { return; } /* private mode: her sayfada tekrar belirmesin */
    if (stored) return;
    var ayd = document.querySelector('.site-footer a[href$="aydinlatma-metni.html"]');
    var cer = document.querySelector('.site-footer a[href$="cerezler.html"]');
    var aydHref = ayd ? ayd.getAttribute("href") : "aydinlatma-metni.html";
    var cerHref = cer ? cer.getAttribute("href") : "cerezler.html";
    var banner = document.createElement("div");
    banner.className = "consent-banner";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Kişisel veri bilgilendirmesi");
    banner.innerHTML =
      '<div class="container consent-inner">' +
        '<p class="consent-text">Kişisel verileriniz, deneyiminizi iyileştirmek ve hizmetlerimizi geliştirmek amacıyla KVKK’ya uygun şekilde işlenmektedir. Detaylı bilgi için <a href="' + aydHref + '">Aydınlatma Metni</a> ve <a href="' + cerHref + '">Çerez Politikası</a> sayfalarını inceleyebilirsiniz.</p>' +
        '<div class="consent-actions">' +
          '<button type="button" class="btn btn--primary btn--sm" data-consent="accepted">Kabul Et</button>' +
          '<button type="button" class="btn btn--ghost btn--sm" data-consent="essential">Yalnızca Zorunlu</button>' +
        '</div>' +
      '</div>';
    banner.addEventListener("click", function (e) {
      var btn = e.target && e.target.closest ? e.target.closest("[data-consent]") : null;
      if (!btn) return;
      try { localStorage.setItem(KEY, btn.getAttribute("data-consent")); } catch (e2) {}
      if (banner.parentNode) banner.parentNode.removeChild(banner);
    });
    document.body.appendChild(banner);
  })();

  /* --- Footer yılı ------------------------------------------------------ */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

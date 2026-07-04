/* ==========================================================================
   DESİL — main.js
   Hafif etkileşimler: sticky header · mobil menü · scroll-reveal ·
   hero veri-noktası dokusu (hafif canvas). Ağır animasyon yok.
   ========================================================================== */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Sticky header: kaydırınca sade zemin ----------------------------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-stuck", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

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
      function start() { if (!running) { running = true; raf = requestAnimationFrame(tick); } }
      function stop() { running = false; if (raf) cancelAnimationFrame(raf); }
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
          if (document.hidden) v.pause();
          else if (v.getBoundingClientRect().top < window.innerHeight && v.getBoundingClientRect().bottom > 0) playVid(v);
        });
      });
    }
  }

  /* --- Footer yılı ------------------------------------------------------ */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

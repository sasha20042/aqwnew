/* AQW v3 — JavaScript */
(function () {
  'use strict';

  /* ────────────────────────────────────────────────
     1. HERO CANVAS — workers (dots) flowing left→right
        toward the factory buildings on the right side
  ──────────────────────────────────────────────── */
  (function initHeroCanvas() {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W, H, workers, rafId;
    var paused = false;
    var COUNT  = 48;

    document.addEventListener('visibilitychange', function () {
      paused = document.hidden;
      if (!paused && !rafId) raf();
    });

    function Worker() { this.reset(true); }
    Worker.prototype.reset = function (init) {
      /* Spawn on the left portion of the screen */
      this.x     = init ? Math.random() * W * .62 : -8;
      this.y     = Math.random() * H * .88 + H * .05;
      this.vx    = Math.random() * .35 + .18;        /* always moving right */
      this.vy    = (Math.random() - .5) * .14;       /* slight drift */
      this.r     = Math.random() * 1.4 + 1.0;        /* 1–2.4 px */
      this.alpha = Math.random() * .3 + .35;         /* base opacity */
      this.life  = 0;
      this.maxLife = W / this.vx * (Math.random() * .4 + .7);
    };
    Worker.prototype.update = function () {
      this.x    += this.vx;
      this.y    += this.vy;
      this.life++;
      /* Fade in/out */
      var prog  = this.life / this.maxLife;
      var fade  = prog < .1 ? prog / .1 : prog > .85 ? (1 - prog) / .15 : 1;
      this.draw_alpha = this.alpha * fade;
      /* Respawn when off-screen */
      if (this.x > W + 10 || this.life >= this.maxLife) this.reset(false);
    };

    function resize() {
      var pr = window.devicePixelRatio || 1;
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width  = W * pr;
      canvas.height = H * pr;
      ctx.scale(pr, pr);
    }

    function init() {
      resize();
      workers = [];
      for (var i = 0; i < COUNT; i++) workers.push(new Worker());
    }

    var CONNECT = 90;  /* connect nearby workers — showing they travel in groups */

    function draw() {
      ctx.clearRect(0, 0, W, H);

      /* ── Connection lines between nearby workers ── */
      for (var i = 0; i < workers.length; i++) {
        var p = workers[i];
        for (var j = i + 1; j < workers.length; j++) {
          var q  = workers[j];
          var dx = p.x - q.x, dy = p.y - q.y;
          var d  = Math.sqrt(dx*dx + dy*dy);
          if (d < CONNECT) {
            var a = Math.min(p.draw_alpha, q.draw_alpha) * (1 - d / CONNECT) * .45;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = 'rgba(0,113,227,' + a + ')';
            ctx.lineWidth   = .7;
            ctx.stroke();
          }
        }
      }

      /* ── Worker dots ── */
      for (var i = 0; i < workers.length; i++) {
        var w = workers[i];
        w.update();
        ctx.save();
        ctx.shadowBlur  = 5;
        ctx.shadowColor = 'rgba(0,113,227,.35)';
        ctx.beginPath();
        ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,113,227,' + w.draw_alpha + ')';
        ctx.fill();
        ctx.restore();
      }
    }

    function raf() {
      if (paused) { rafId = null; return; }
      draw();
      rafId = requestAnimationFrame(raf);
    }

    init();
    raf();

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(init, 200);
    }, { passive: true });
  }());

  /* ────────────────────────────────────────────────
     2. CUSTOM CURSOR (desktop only)
  ──────────────────────────────────────────────── */
  var cursor = document.getElementById('cursor');
  if (cursor && window.matchMedia('(pointer: fine)').matches) {
    var mx = -200, my = -200, cx = -200, cy = -200;
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      document.body.classList.add('cursor-ready');
    });
    (function loop() {
      cx += (mx - cx) * 0.16;
      cy += (my - cy) * 0.16;
      cursor.style.left = cx + 'px';
      cursor.style.top  = cy + 'px';
      requestAnimationFrame(loop);
    }());
    document.querySelectorAll('a, button').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('hovered'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('hovered'); });
    });
  }

  /* ────────────────────────────────────────────────
     3. HEADER — scroll state + mobile menu
  ──────────────────────────────────────────────── */
  var header   = document.getElementById('header');
  var burger   = document.getElementById('burger');
  var nav      = document.getElementById('nav');
  var floatCta = document.getElementById('float-cta');

  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    header.classList.toggle('scrolled', y > 20);
    if (floatCta) floatCta.classList.toggle('visible', y > 500);
  }, { passive: true });

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      header.classList.toggle('nav-open', open);
      burger.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        header.classList.remove('nav-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ────────────────────────────────────────────────
     4. HERO PARALLAX (subtle)
  ──────────────────────────────────────────────── */
  var heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y < 700) {
        heroTitle.style.transform = 'translateY(' + (y * 0.12) + 'px)';
        heroTitle.style.opacity   = String(1 - y / 480);
      }
    }, { passive: true });
  }

  /* ────────────────────────────────────────────────
     5. SCROLL REVEAL (Intersection Observer)
  ──────────────────────────────────────────────── */
  function initReveal() {
    var els = document.querySelectorAll('.reveal:not(.in)');
    if (!els.length) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -56px 0px' });
    els.forEach(function (el) { obs.observe(el); });
  }
  initReveal();

  /* ────────────────────────────────────────────────
     6. ANIMATED COUNTERS
  ──────────────────────────────────────────────── */
  function animateCounter(el, target, duration) {
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var prog = Math.min((ts - start) / duration, 1);
      var ease = 1 - Math.pow(1 - prog, 3);
      el.textContent = Math.round(ease * target).toLocaleString('uk-UA');
      if (prog < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var countEls = document.querySelectorAll('.count');
  if (countEls.length) {
    var cntObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          animateCounter(e.target, parseInt(e.target.getAttribute('data-target'), 10), 1800);
          cntObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    countEls.forEach(function (el) { cntObs.observe(el); });
  }

  /* ────────────────────────────────────────────────
     7. MARQUEE — duplicate for seamless loop
  ──────────────────────────────────────────────── */
  var marqueeTrack = document.getElementById('marquee-track');
  if (marqueeTrack) marqueeTrack.innerHTML += marqueeTrack.innerHTML;

  /* ────────────────────────────────────────────────
     8. DYNAMIC JOBS from AQW store
  ──────────────────────────────────────────────── */
  function jobCardHTML(job) {
    return '<article class="job-card reveal">' +
      '<div class="job-img"><img src="' + esc(job.image) + '" alt="' + esc(job.title) + '" loading="lazy">' +
      '<span class="job-tag">' + esc(job.country) + '</span></div>' +
      '<div class="job-body">' +
      '<p class="job-loc">' + esc(job.city) + '</p>' +
      '<h3 class="job-title">' + esc(job.title) + '</h3>' +
      '<p class="job-req">' + esc(job.requirements) + '</p>' +
      '<div class="job-foot">' +
      '<strong class="job-sal">' + esc(job.salary) + '</strong>' +
      '<a href="aqw-vacancy.html?id=' + job.id + '" class="job-link">Детальніше ' +
      '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6h8M7 2.5l3.5 3.5L7 9.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</a></div></div></article>';
  }

  var featuredGrid = document.getElementById('featured-jobs');
  if (featuredGrid && window.AQW) {
    var featured = window.AQW.getJobs().filter(function (j) { return j.active && j.featured; }).slice(0, 3);
    featuredGrid.innerHTML = featured.map(jobCardHTML).join('');
    initReveal();
  }

  /* ────────────────────────────────────────────────
     9. DYNAMIC NEWS from AQW store
  ──────────────────────────────────────────────── */
  function newsCardHTML(n, big) {
    var cls = big ? 'news-card news-big reveal' : 'news-card reveal';
    return '<article class="' + cls + '">' +
      '<div class="news-img"><img src="' + esc(n.image) + '" alt="" loading="lazy"></div>' +
      '<div class="news-body">' +
      '<time class="news-date">' + esc(window.AQW ? window.AQW.formatDate(n.publishedAt) : n.publishedAt) + '</time>' +
      '<h3>' + esc(n.title) + '</h3>' +
      (big ? '<p>' + esc(n.excerpt) + '</p>' : '') +
      '</div></article>';
  }

  var latestNews = document.getElementById('latest-news');
  if (latestNews && window.AQW) {
    var news = window.AQW.getNews().filter(function (n) { return n.active; }).slice(0, 3);
    if (news.length) {
      var col = '';
      if (news[1]) col += newsCardHTML(news[1], false);
      if (news[2]) col += newsCardHTML(news[2], false);
      latestNews.innerHTML =
        newsCardHTML(news[0], true) +
        (col ? '<div class="news-col">' + col + '</div>' : '');
      initReveal();
    }
  }

  /* ────────────────────────────────────────────────
     10. MODAL
  ──────────────────────────────────────────────── */
  var modal        = document.getElementById('modal');
  var backdrop     = document.getElementById('modal-backdrop');
  var closeBtn     = document.getElementById('modal-close');
  var cbForm       = document.getElementById('cb-form');
  var cbSubmit     = document.getElementById('cb-submit');
  var modalContent = document.getElementById('modal-content');
  var modalSuccess = document.getElementById('modal-success');
  var modalOk      = document.getElementById('modal-ok');
  var cbName       = document.getElementById('cb-name');
  var cbPhone      = document.getElementById('cb-phone');
  var errName      = document.getElementById('err-name');
  var errPhone     = document.getElementById('err-phone');

  function openModal() {
    if (!modal) return;
    modal.classList.add('is-open');
    document.body.classList.add('no-scroll');
    setTimeout(function () { if (cbName) cbName.focus(); }, 120);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
  }

  function resetModal() {
    if (cbForm)       { cbForm.reset(); }
    if (modalSuccess) modalSuccess.hidden = true;
    if (modalContent) modalContent.hidden = false;
    clearFieldError(cbName, errName);
    clearFieldError(cbPhone, errPhone);
    if (cbSubmit) { cbSubmit.disabled = false; cbSubmit.textContent = 'Надіслати заявку'; }
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('.request-open')) openModal();
  });

  if (closeBtn)  closeBtn.addEventListener('click', closeModal);
  if (backdrop)  backdrop.addEventListener('click', closeModal);
  if (modalOk)   modalOk.addEventListener('click', closeModal);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) closeModal();
  });

  if (modal) {
    modal.addEventListener('transitionend', function () {
      if (!modal.classList.contains('is-open')) resetModal();
    });
  }

  if (cbPhone) {
    cbPhone.addEventListener('input', function () {
      cbPhone.value = cbPhone.value.replace(/\D/g, '').slice(0, 10);
    });
  }

  function setFieldError(input, errEl, msg) {
    if (!input || !errEl) return;
    errEl.textContent = msg;
    input.classList.add('has-error');
    input.focus();
  }
  function clearFieldError(input, errEl) {
    if (input) input.classList.remove('has-error');
    if (errEl) errEl.textContent = '';
  }

  if (cbForm) {
    cbForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name  = cbName  ? cbName.value.trim()  : '';
      var phone = cbPhone ? cbPhone.value.trim() : '';
      var valid = true;

      clearFieldError(cbName,  errName);
      clearFieldError(cbPhone, errPhone);

      if (!name) {
        setFieldError(cbName, errName, "Будь ласка, введіть ім'я"); valid = false;
      }
      if (phone.length !== 10) {
        if (valid) setFieldError(cbPhone, errPhone, 'Формат: 0501234567 (10 цифр)');
        else if (errPhone) errPhone.textContent = 'Формат: 0501234567 (10 цифр)';
        if (cbPhone) cbPhone.classList.add('has-error');
        valid = false;
      }
      if (!valid) return;

      cbSubmit.disabled    = true;
      cbSubmit.textContent = 'Відправляємо…';

      /* Save to localStorage store */
      if (window.AQW) {
        window.AQW.addSubmission({ name: name, phone: phone, url: location.href });
      }

      /* Also try the server endpoint (may not exist in dev) */
      fetch('/zz-request', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: name, phone: phone, url: location.href, title: document.title })
      })
        .catch(function () { return {}; })
        .then(function () {
          if (modalContent) modalContent.hidden = true;
          if (modalSuccess) modalSuccess.hidden = false;
        });
    });
  }

  /* ── util ── */
  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

}());

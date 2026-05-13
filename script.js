/* ============================================
   Danila Igoshin — v5 / Studio Ochre
   ============================================ */

// ---------- Scroll progress + body state + hero hint ----------
(() => {
  const bar = document.getElementById('progressBar');
  const hint = document.getElementById('scrollHint');

  const update = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop || document.body.scrollTop;
    const max = (h.scrollHeight || document.body.scrollHeight) - h.clientHeight;
    const pct = max > 0 ? (scrolled / max) * 100 : 0;
    if (bar) bar.style.width = pct + '%';

    // body class toggles nav compaction
    document.body.classList.toggle('is-scrolled', scrolled > 80);

    // hide hero hint once scrolled
    if (hint) hint.classList.toggle('is-hidden', scrolled > 120);
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

// ---------- Side-nav: active section indicator ----------
(() => {
  const sideNav = document.querySelector('.side-nav');
  if (!sideNav) return;
  const links = sideNav.querySelectorAll('a');
  const sections = [];
  links.forEach((a) => {
    const id = a.getAttribute('data-target');
    if (!id) return;
    const el = id === 'top' ? document.getElementById('top') : document.getElementById(id);
    if (el) sections.push({ id, el, link: a });
  });
  if (!sections.length) return;

  // show side-nav once hero is scrolled past
  const showThreshold = 200;
  window.addEventListener('scroll', () => {
    sideNav.classList.toggle('is-visible', window.scrollY > showThreshold);
  }, { passive: true });

  // active section via IntersectionObserver
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach((link) => {
            link.classList.toggle('is-active', link.getAttribute('data-target') === id);
          });
          // dark variant when contact is active (dark bg)
          sideNav.classList.toggle('is-dark', id === 'contact');
        }
      });
    },
    { threshold: 0.35, rootMargin: '-30% 0px -40% 0px' }
  );
  sections.forEach((s) => io.observe(s.el));
})();

// ---------- Copy email ----------
(() => {
  const btn = document.getElementById('copyEmail');
  const label = document.getElementById('copyLabel');
  if (!btn || !label) return;
  const original = label.textContent;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('danigoshin@gmail.com');
      label.textContent = 'Copied ✓';
      btn.classList.add('is-copied');
      setTimeout(() => {
        label.textContent = original;
        btn.classList.remove('is-copied');
      }, 1800);
    } catch (e) {
      window.location.href = 'mailto:danigoshin@gmail.com';
    }
  });
})();

// ---------- Reveal on scroll ----------
(() => {
  const els = document.querySelectorAll('.card, .stat, .section-head, .about-text p, .about-side, .ship-item');
  if (!('IntersectionObserver' in window)) return;

  els.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity .9s cubic-bezier(.2,.7,.2,1), transform .9s cubic-bezier(.2,.7,.2,1)';
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const delay = entry.target.classList.contains('card') ||
                        entry.target.classList.contains('stat') ||
                        entry.target.classList.contains('ship-item')
            ? Math.min(i, 4) * 60
            : 0;
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, delay);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  els.forEach((el) => io.observe(el));
})();

// ---------- Card cover parallax (real screenshots) ----------
(() => {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const cards = document.querySelectorAll('.card');
  cards.forEach((card) => {
    const target = card.querySelector('.cover-img') || card.querySelector('.cover-mesh');
    if (!target) return;
    let raf;
    card.addEventListener('mousemove', (e) => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        target.style.transform = `scale(1.05) translate(${x * -8}px, ${y * -5}px)`;
      });
    });
    card.addEventListener('mouseleave', () => {
      target.style.transform = '';
    });
  });
})();

// ---------- Cover & section animations: activate on viewport entry ----------
(() => {
  const cards = document.querySelectorAll('.card');
  const stats = document.querySelectorAll('.stat');
  const about = document.querySelector('.about');

  function activateCounters(root, extraDelay = 0) {
    root.querySelectorAll('[data-count]').forEach((el) => {
      if (el.dataset.counted) return;
      el.dataset.counted = '1';
      const target = parseInt(el.dataset.count, 10);
      if (Number.isNaN(target)) return;
      const baseDelay = parseInt(el.dataset.countDelay || '300', 10);
      const duration = parseInt(el.dataset.countDuration || '1600', 10);
      const prefix = el.dataset.countPrefix || '';
      setTimeout(() => countUp(el, target, duration, prefix), baseDelay + extraDelay);
    });
  }

  function countUp(el, target, durationMs, prefix = '') {
    const start = performance.now();
    function format(n) {
      return prefix + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
    function step(now) {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = format(target * eased);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (!('IntersectionObserver' in window)) {
    cards.forEach((c) => c.classList.add('is-active'));
    stats.forEach((s) => activateCounters(s));
    if (about) about.classList.add('is-active');
    return;
  }

  // cards (covers) — shop card has data-count=7210 inside
  const cardIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-active');
          activateCounters(entry.target);
          cardIo.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.35, rootMargin: '0px 0px -10% 0px' }
  );
  cards.forEach((c) => cardIo.observe(c));

  // stats — count up + sparkline draw with per-stat stagger
  const statIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const i = Array.prototype.indexOf.call(stats, entry.target);
          entry.target.classList.add('is-active');
          activateCounters(entry.target, i * 140);
          statIo.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.45, rootMargin: '0px 0px -10% 0px' }
  );
  stats.forEach((s) => statIo.observe(s));

  // about section — triggers signature draw
  if (about) {
    const aboutIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-active');
            aboutIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    aboutIo.observe(about);
  }
})();


// ---------- Live Penza clock + time-of-day greeting ----------
(() => {
  function penzaNow() {
    // UTC+3 — fixed offset, no DST in Russia
    const now = new Date();
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utcMs + 3 * 3600000);
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function fmt(d) { return `${pad(d.getHours())}:${pad(d.getMinutes())}`; }
  function greet(hour) {
    if (hour < 5)  return 'Good night';
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    if (hour < 22) return 'Good evening';
    return 'Good night';
  }

  function tick() {
    const t = penzaNow();
    const time = fmt(t);
    document.querySelectorAll('[data-clock="penza"]').forEach((el) => {
      el.textContent = time;
    });
    const greeting = document.getElementById('greeting');
    if (greeting) greeting.textContent = greet(t.getHours());
  }
  tick();
  // align next tick to top of minute
  const t0 = penzaNow();
  const msToNextMinute = (60 - t0.getSeconds()) * 1000;
  setTimeout(() => {
    tick();
    setInterval(tick, 60000);
  }, msToNextMinute);
})();

// ---------- Back-to-top ----------
(() => {
  const btn = document.getElementById('backToTop');
  const contact = document.getElementById('contact');
  if (!btn) return;

  const update = () => {
    const threshold = contact ? contact.offsetTop - window.innerHeight * 0.6 : 1200;
    if (window.scrollY > threshold) btn.classList.add('is-visible');
    else btn.classList.remove('is-visible');
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ---------- Magnetic CTAs ----------
(() => {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const magnets = document.querySelectorAll('.btn, .nav-cta, .copy-pill');
  magnets.forEach((btn) => {
    let raf;
    btn.addEventListener('mousemove', (e) => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / r.width;
        const y = (e.clientY - r.top - r.height / 2) / r.height;
        btn.style.transform = `translate(${x * 6}px, ${y * 4}px)`;
      });
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

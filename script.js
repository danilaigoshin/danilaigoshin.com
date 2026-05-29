/* ============================================================
   Danila Igoshin — v6 / "FOLIO"
   Plain, dependency-free. Progressive-enhancement only:
   everything is visible without JS; JS just adds motion + live bits.
   ============================================================ */

'use strict';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- condensed-nav on scroll (rAF-throttled) ---------- */
(() => {
  let ticking = false;
  const apply = () => {
    document.body.classList.toggle('is-scrolled', window.scrollY > 60);
    ticking = false;
  };
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(apply);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  apply();
})();

/* ---------- reveal-on-scroll ---------- */
(() => {
  const els = document.querySelectorAll('.r');
  if (!els.length) return;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: '0px 0px -8% 0px' }
  );
  els.forEach((el) => io.observe(el));
})();

/* ---------- count-up for the Numbers figures ---------- */
(() => {
  const nums = document.querySelectorAll('.cnt');
  if (!nums.length) return;

  const run = (el) => {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const target = parseInt(el.dataset.count, 10);
    if (Number.isNaN(target)) return;
    const fmt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    if (reduceMotion) { el.textContent = fmt(target); return; }
    const dur = parseInt(el.dataset.dur || '1500', 10);
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = fmt(target * eased);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // small per-column stagger
          const sibs = Array.prototype.slice.call(nums);
          const i = Math.max(0, sibs.indexOf(entry.target));
          setTimeout(() => run(entry.target), reduceMotion ? 0 : (i % 4) * 120);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  nums.forEach((el) => io.observe(el));
})();

/* ---------- live Penza clock + time-of-day greeting ---------- */
(() => {
  const clocks = document.querySelectorAll('[data-clock="penza"]');
  const greeting = document.getElementById('greeting');
  if (!clocks.length && !greeting) return;

  const penzaNow = () => {
    // UTC+3, fixed (no DST in Russia)
    const now = new Date();
    return new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 3 * 3600000);
  };
  const pad = (n) => String(n).padStart(2, '0');
  const greet = (h) => (h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : h < 22 ? 'Good evening' : 'Good night');

  const tick = () => {
    const t = penzaNow();
    const time = `${pad(t.getHours())}:${pad(t.getMinutes())}`;
    clocks.forEach((el) => { el.textContent = time; });
    if (greeting) greeting.textContent = greet(t.getHours());
  };
  tick();
  const t0 = penzaNow();
  setTimeout(() => { tick(); setInterval(tick, 60000); }, (60 - t0.getSeconds()) * 1000);
})();

/* ---------- copy email ---------- */
(() => {
  const btn = document.getElementById('copyEmail');
  const label = document.getElementById('copyLabel');
  if (!btn || !label) return;
  const original = label.textContent;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('danigoshin@gmail.com');
      label.textContent = 'Copied ✓';
      setTimeout(() => { label.textContent = original; }, 1800);
    } catch (e) {
      window.location.href = 'mailto:danigoshin@gmail.com';
    }
  });
})();

/* ---------- back to top ---------- */
(() => {
  const btn = document.getElementById('toTop');
  if (!btn) return;
  let ticking = false;
  const apply = () => {
    btn.classList.toggle('show', window.scrollY > window.innerHeight * 1.1);
    ticking = false;
  };
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(apply);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  apply();
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
})();

/* ---------- mobile menu ---------- */
(() => {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('is-open', open);
  };

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (toggle.getAttribute('aria-expanded') !== 'true') return;
    if (!menu.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 820) setOpen(false); }, { passive: true });
})();

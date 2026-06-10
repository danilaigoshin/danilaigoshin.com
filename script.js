/* ============================================================
   Danila Igoshin — v8 / "PROSPECTUS"
   Plain, dependency-free. Progressive-enhancement only:
   everything works without JS; JS adds the bar, clock, clipboard.
   ============================================================ */

'use strict';

/* ---------- availability — single source of truth ----------
   Edit here; the dateline chip, the stamp and the "last verified"
   line all render from this. Keep `verified` honest. */
const AVAILABILITY = {
  chip: 'Available now',
  stampBig: 'Available',
  stampSmall: 'contract · full-time',
  verified: 'June 2026',
};

(() => {
  const set = (sel, text) => document.querySelectorAll(sel).forEach((el) => { el.textContent = text; });
  set('[data-avail-chip]', AVAILABILITY.chip);
  set('[data-avail-big]', AVAILABILITY.stampBig);
  set('[data-avail-small]', AVAILABILITY.stampSmall);
  set('[data-avail-verified]', AVAILABILITY.verified);
})();

/* ---------- sticky bar after the masthead (rAF-throttled) ---------- */
(() => {
  const bar = document.getElementById('bar');
  const mast = document.querySelector('.mast');
  if (!bar || !mast) return;
  let ticking = false;
  const apply = () => {
    const past = window.scrollY > mast.offsetTop + mast.offsetHeight - 60;
    bar.classList.toggle('show', past);
    bar.setAttribute('aria-hidden', String(!past));
    ticking = false;
  };
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(apply);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  apply();
})();

/* ---------- live Penza clock ---------- */
(() => {
  const clocks = document.querySelectorAll('[data-clock="penza"]');
  if (!clocks.length) return;

  const penzaNow = () => {
    // UTC+3, fixed (no DST in Russia)
    const now = new Date();
    return new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 3 * 3600000);
  };
  const pad = (n) => String(n).padStart(2, '0');
  const tick = () => {
    const t = penzaNow();
    const time = `${pad(t.getHours())}:${pad(t.getMinutes())}`;
    clocks.forEach((el) => { el.textContent = time; });
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

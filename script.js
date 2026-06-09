/* ============================================================
   Danila Igoshin — v7 / "PRESSWORK"
   Plain, dependency-free. Progressive-enhancement only:
   everything works without JS; JS adds the bar, clock, clipboard.
   ============================================================ */

'use strict';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

/* ---------- deep-link: open a job row when its hash is targeted ---------- */
(() => {
  const openFromHash = () => {
    const id = location.hash.slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    if (el && el.tagName === 'DETAILS') el.open = true;
  };
  openFromHash();
  window.addEventListener('hashchange', openFromHash);
})();

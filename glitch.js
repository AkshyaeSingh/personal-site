(() => {
  const DELAY = 12000;     // ms before the collapse begins
  const DURATION = 60000;  // ms for the collapse to fully resolve into one color

  const root = document.documentElement;
  const page = document.getElementById('page');
  const veil = document.getElementById('veil');
  const cursor = document.getElementById('cursor');
  const items = [...document.querySelectorAll('.collapse')];

  // ── Inverted cursor: the visible pointer is the real one mirrored through the screen's center.
  let fx = -100, fy = -100, hovered = null;
  const finePointer = matchMedia('(pointer: fine)').matches;

  const linkAt = () => {
    const el = document.elementFromPoint(fx, fy);
    return el ? el.closest('a') : null;
  };

  const updateHover = () => {
    if (!finePointer) return;
    const a = linkAt();
    if (a === hovered) return;
    if (hovered) hovered.classList.remove('is-hover');
    if (a) a.classList.add('is-hover');
    hovered = a;
  };

  if (finePointer) {
    root.classList.add('inverted');

    addEventListener('mousemove', e => {
      fx = innerWidth - e.clientX;
      fy = innerHeight - e.clientY;
      cursor.style.transform = `translate(${fx}px, ${fy}px) rotate(180deg) translate(-1px, -1px)`;
      cursor.style.opacity = 1;
      updateHover();
    }, { passive: true });

    addEventListener('scroll', updateHover, { passive: true });
    document.addEventListener('mouseleave', () => { cursor.style.opacity = 0; });

    // Clicks land where the mirrored cursor is, not where the real one is.
    // Keyboard activation (detail === 0) passes through untouched.
    addEventListener('click', e => {
      if (e.detail === 0) return;
      e.preventDefault();
      e.stopPropagation();
      const a = linkAt();
      if (!a) return;
      if (a.target === '_blank') window.open(a.href, '_blank', 'noopener');
      else location.href = a.href;
    }, true);
  }

  // ── Collapse: everything drifts to the center, shrinks, glitches, and fades into a single color.
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const BG = [245, 245, 240];
  const END = [143, 145, 135];
  const smooth = t => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };

  let base = [];
  const measure = () => {
    items.forEach(el => { el.style.transform = ''; });
    base = items.map(el => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 + scrollX, y: r.top + r.height / 2 + scrollY, jitter: 0, until: 0 };
    });
  };
  measure();
  addEventListener('resize', measure);
  if (document.fonts) document.fonts.ready.then(measure);

  const start = performance.now();

  const frame = now => {
    const p = Math.min(1, Math.max(0, (now - start - DELAY) / DURATION));
    const e = smooth(p);

    if (p > 0) {
      const cx = scrollX + innerWidth / 2;
      const cy = scrollY + innerHeight / 2;
      let bursting = false;

      items.forEach((el, i) => {
        const b = base[i];
        if (now > b.until && Math.random() < 0.004 + 0.05 * e) {
          b.until = now + 60 + Math.random() * 180;
          b.jitter = (Math.random() * 2 - 1) * (6 + 40 * e);
        }
        const j = now < b.until ? b.jitter : 0;
        if (j) bursting = true;
        el.style.transform = `translate(${(cx - b.x) * e + j}px, ${(cy - b.y) * e}px) scale(${1 - 0.9 * e})`;
      });

      const ab = 3 * e + (bursting ? 5 * e + 2 : 0);
      page.style.textShadow = `${ab}px 0 rgba(230,40,90,.45), ${-ab}px 0 rgba(30,170,220,.45)`;
      page.style.filter = `blur(${6 * e}px) saturate(${1 - e}) contrast(${1 - 0.6 * e})`;

      const c = BG.map((v, k) => Math.round(v + (END[k] - v) * e));
      document.body.style.background = root.style.background = `rgb(${c})`;
      veil.style.opacity = smooth((p - 0.6) / 0.4);

      updateHover();
    }

    if (p < 1) requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);
})();

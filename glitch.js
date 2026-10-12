(() => {
  const DELAY = 10000;     // ms before the dissolve begins
  const DURATION = 20000;  // ms for the dissolve to fully resolve into one color

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

  const $ = id => document.getElementById(id);
  const flood = $('px-flood'), cell = $('px-cell'), grow = $('px-grow'), grain = $('grain'), scatter = $('scatter');
  const bursts = items.map(() => ({ jitter: 0, until: 0 }));
  // Pre-rendered noise frames stretched over the filter region (-20%..120% of the page box).
  // Regenerating SVG turbulence every frame is far too slow, and tiling leaves seams.
  const CELL = 3;
  let frames = [], frameIdx = 0, nextShiftAt = 0;

  const fitNoise = () => {
    const w = page.offsetWidth * 1.4, h = page.offsetHeight * 1.4;
    grain.setAttribute('x', -page.offsetWidth * 0.2);
    grain.setAttribute('y', -page.offsetHeight * 0.2);
    grain.setAttribute('width', w);
    grain.setAttribute('height', h);
    return [Math.ceil(w / CELL), Math.ceil(h / CELL)];
  };

  const buildNoise = () => {
    const [cw, ch] = fitNoise();
    const canvas = document.createElement('canvas');
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');
    frames = [0, 1, 2].map(() => {
      const img = ctx.createImageData(cw, ch);
      for (let i = 0; i < img.data.length; i += 4) {
        img.data[i] = Math.random() * 255;
        img.data[i + 1] = Math.random() * 255;
        img.data[i + 2] = 128;
        img.data[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      return canvas.toDataURL();
    });
    grain.setAttribute('href', frames[0]);
  };

  setTimeout(buildNoise, 1500);
  addEventListener('resize', fitNoise);
  if (document.fonts) document.fonts.ready.then(fitNoise);

  const setBlock = size => {
    const b = Math.max(1, Math.round(size));
    const half = Math.floor(b / 2);
    flood.setAttribute('x', half);
    flood.setAttribute('y', half);
    cell.setAttribute('width', b);
    cell.setAttribute('height', b);
    grow.setAttribute('radius', half);
  };

  const start = performance.now();

  const frame = now => {
    const p = Math.min(1, Math.max(0, (now - start - DELAY) / DURATION));
    const e = smooth(p);

    // Apply the (still no-op) filter early so its first-use stall lands while nothing is moving.
    if (p === 0 && !page.style.filter && now - start > DELAY - 1000) {
      setBlock(1);
      page.style.filter = 'url(#dissolve)';
    }

    if (p > 0) {
      let bursting = false;

      items.forEach((el, i) => {
        const b = bursts[i];
        if (now > b.until && Math.random() < 0.01 + 0.08 * e) {
          b.until = now + 50 + Math.random() * 150;
          b.jitter = (Math.random() * 2 - 1) * (6 + 30 * e);
        }
        const j = now < b.until ? b.jitter : 0;
        if (j) bursting = true;
        el.style.transform = j ? `translateX(${j}px)` : '';
      });

      // Pixels grow into blocks, then scatter into their neighbours.
      setBlock(1 + 20 * Math.pow(e, 1.5));
      scatter.setAttribute('scale', (160 * e).toFixed(1));
      if (now > nextShiftAt) {
        frameIdx = (frameIdx + 1) % frames.length;
        grain.setAttribute('href', frames[frameIdx]);
        nextShiftAt = now + 90;
      }

      const ab = 2 * e + (bursting ? 4 * e + 2 : 0);
      page.style.textShadow = `${ab}px 0 rgba(230,40,90,.45), ${-ab}px 0 rgba(30,170,220,.45)`;
      page.style.filter = `url(#dissolve) saturate(${1 - e}) contrast(${1 - 0.6 * e}) blur(${3 * e * e}px)`;

      const c = BG.map((v, k) => Math.round(v + (END[k] - v) * e));
      document.body.style.background = root.style.background = `rgb(${c})`;
      veil.style.opacity = smooth((p - 0.55) / 0.45);

      updateHover();
    }

    if (p < 1) requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);
})();

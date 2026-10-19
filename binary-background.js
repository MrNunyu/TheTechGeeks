"use strict";
// Decorative binary background only. Does not read or change assessment content.
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const field = document.createElement('div');
  field.className = 'binary-atmosphere';
  field.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(field, document.body.firstChild);

  // Stable seeded positions avoid random jumps when reopening a page.
  let seed = 0x1A17B17;
  const rand = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const small = window.matchMedia('(max-width: 600px)').matches;
  const medium = window.matchMedia('(max-width: 950px)').matches;
  const home = !document.body.classList.contains('topic-page');
  const count = reduced ? 28 : small ? (home ? 36 : 51) : medium ? 66 : (home ? 78 : 106);
  const colors = ['#42f5e9', '#42f5e9', '#6fb9ff', '#fc7bd9', '#f9e66e'];
  const layerDepths = reduced ? [0] : [0.08, 0.16, 0.26];
  const layers = layerDepths.map((depth, index) => {
    const layer = document.createElement('div');
    layer.className = 'binary-layer';
    layer.style.setProperty('--layer-depth', String(depth));
    layer.dataset.layerIndex = String(index);
    field.appendChild(layer);
    return layer;
  });

  for (let i = 0; i < count; i++) {
    const bit = document.createElement('span');
    bit.className = 'binary-digit';
    bit.textContent = rand() > .5 ? '1' : '0';
    bit.style.setProperty('--bit-left', `${(1.5 + rand() * 97).toFixed(2)}%`);
    bit.style.setProperty('--bit-top', `${(1 + rand() * 98).toFixed(2)}%`);
    bit.style.setProperty('--bit-size', `${Math.round(10 + rand() * 11)}px`);
    bit.style.setProperty('--bit-color', colors[Math.floor(rand() * colors.length)]);
    bit.style.setProperty('--bit-opacity', `${(.18 + rand() * .16).toFixed(2)}`);
    bit.style.setProperty('--bit-duration', `${Math.round(15 + rand() * 20)}s`);
    bit.style.setProperty('--bit-delay', `${(-rand() * 34).toFixed(2)}s`);
    bit.style.setProperty('--bit-sway', `${Math.round((rand() - .5) * 95)}px`);
    bit.style.setProperty('--bit-scroll-jitter', `${Math.round((rand() - .5) * 24)}px`);
    const targetLayer = layers[i % layers.length];
    targetLayer.appendChild(bit);
  }

  if (reduced) return;

  let ticking = false;
  let latestScrollY = window.scrollY || window.pageYOffset || 0;

  const updateScrollMotion = () => {
    ticking = false;
    const viewport = window.innerHeight || 1;
    layers.forEach((layer, index) => {
      const depth = Number(layer.style.getPropertyValue('--layer-depth')) || 0;
      const drift = latestScrollY * depth;
      const wave = Math.sin((latestScrollY / viewport) + index * 1.7) * (10 + index * 4);
      layer.style.transform = `translate3d(0, ${Math.round(drift + wave)}px, 0)`;
    });
  };

  const onScroll = () => {
    latestScrollY = window.scrollY || window.pageYOffset || 0;
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateScrollMotion);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  updateScrollMotion();
})();

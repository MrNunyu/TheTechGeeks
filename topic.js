"use strict";
// Navigation UI only. Assessment text and embedded images are never rewritten.
(() => {
  const progress = document.getElementById('reading-progress-bar');
  const ribbon = document.querySelector('.topic-nav');
  const showAfterScroll = 96;
  const directionThreshold = 8;
  let lastScrollY = window.scrollY;
  let accumulatedScroll = 0;
  let queued = false;

  const update = () => {
    const doc = document.documentElement;
    const currentScrollY = window.scrollY;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);

    if (progress) {
      progress.style.width = `${Math.min(100, Math.max(0, (currentScrollY / max) * 100))}%`;
    }

    if (ribbon) {
      const delta = currentScrollY - lastScrollY;
      if (delta !== 0) {
        accumulatedScroll = Math.sign(delta) === Math.sign(accumulatedScroll)
          ? accumulatedScroll + delta
          : delta;

        if (currentScrollY <= showAfterScroll || accumulatedScroll < -directionThreshold) {
          ribbon.classList.remove('topic-nav--hidden');
          accumulatedScroll = 0;
        } else if (accumulatedScroll > directionThreshold) {
          ribbon.classList.add('topic-nav--hidden');
          accumulatedScroll = 0;
        }
      }
      lastScrollY = currentScrollY;
    }

    queued = false;
  };

  window.addEventListener('scroll', () => {
    if (!queued) {
      queued = true;
      window.requestAnimationFrame(update);
    }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();

  const root = document.getElementById('original-content');
  const outline = document.getElementById('topic-outline');
  if (!root || !outline) return;

  const headings = [...root.querySelectorAll('h1,h2,h3,h4,.original-section > p')].filter(el => {
    if (/^H[1-4]$/.test(el.tagName)) return !!el.textContent.trim();
    const first = el.querySelector(':scope > span, :scope > strong, :scope > b');
    return !!first && (first.tagName === 'STRONG' || first.tagName === 'B' || /font-weight:\s*(700|bold)/i.test(first.getAttribute('style') || ''))
      && first.textContent.trim().length < 72;
  }).slice(0, 18);

  if (!headings.length) {
    outline.innerHTML = '<li><span class="aside-label">Open the file to read</span></li>';
    return;
  }

  outline.replaceChildren();
  for (const [i, el] of headings.entries()) {
    if (!el.id) el.id = `chapter-anchor-${i + 1}`;
    const label = el.tagName === 'P' ? (el.querySelector(':scope > span, :scope > strong, :scope > b')?.textContent || el.textContent) : el.textContent;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${el.id}`;
    a.textContent = label.trim().slice(0, 65);
    li.append(a);
    outline.append(li);
  }
})();

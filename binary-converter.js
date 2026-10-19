"use strict";
// Separate interactive demonstration. It never edits original assessment text.
(() => {
  const input = document.getElementById('binary-lab-input');
  const output = document.getElementById('binary-lab-output');
  const byteCount = document.getElementById('binary-byte-count');
  const bitCount = document.getElementById('binary-bit-count');
  const status = document.getElementById('binary-lab-status');
  const copy = document.getElementById('binary-copy');
  const clear = document.getElementById('binary-clear');
  if (!input || !output || !byteCount || !bitCount || !status || !copy || !clear) return;

  const encoder = new TextEncoder();
  const toBinary = text => Array.from(encoder.encode(text), byte => byte.toString(2).padStart(8, '0')).join(' ');

  function update() {
    const bytes = encoder.encode(input.value);
    output.textContent = toBinary(input.value) || 'Waiting for your message...';
    byteCount.textContent = `${bytes.length} ${bytes.length === 1 ? 'byte' : 'bytes'}`;
    bitCount.textContent = `${bytes.length * 8} bits`;
    status.textContent = '';
  }

  input.addEventListener('input', update);
  clear.addEventListener('click', () => { input.value = ''; update(); input.focus(); });
  copy.addEventListener('click', async () => {
    if (!input.value) { status.textContent = 'Type a message first.'; return; }
    const binary = toBinary(input.value);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(binary);
      status.textContent = 'Binary copied!';
    } catch (error) {
      // File URLs may block clipboard permissions. Show a selectable fallback.
      status.textContent = 'Select the binary above to copy it.';
    }
  });
  update();

  // The source images stay in their original order and retain their URLs/bytes.
  // Only their position is changed, to place the new lab after the written info
  // and before the source pictures, as requested.
  const original = document.getElementById('original-content');
  const gallery = document.getElementById('binary-original-gallery');
  const wrapper = document.getElementById('binary-original-pictures');
  if (original && gallery && wrapper) {
    const pictures = [...original.querySelectorAll('figure.original-picture')];
    for (const picture of pictures) {
      const sourceSection = picture.closest('.original-section');
      gallery.appendChild(picture);
      // No blank DATA PACKET if an original section contained only an image.
      if (sourceSection && !sourceSection.textContent.trim() && !sourceSection.querySelector('img, iframe, video')) {
        sourceSection.remove();
      }
    }
    wrapper.hidden = pictures.length === 0;
  }
})();

"use strict";
/* Progress is local to this browser only. No accounts, uploads or analytics. */
(() => {
  const KEY = 'thetechgeeks_mission_v1';
  const filenames = [
    'networking.html', 'history-of-the-internet.html', 'bits-bytes.html',
    'pixels-pictures.html', 'interland.html', 'artificial-intelligence.html', 'sources.html'
  ];
  const fresh = () => ({ visited: [], quizBest: null, aiTried: false });
  let state = fresh();
  let storageAvailable = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state.visited = Array.isArray(parsed.visited) ? parsed.visited.filter(v => filenames.includes(v)) : [];
      state.quizBest = Number.isInteger(parsed.quizBest) && parsed.quizBest >= 0 && parsed.quizBest <= 7 ? parsed.quizBest : null;
      state.aiTried = parsed.aiTried === true;
    }
  } catch (error) { storageAvailable = false; }
  const save = () => {
    if (!storageAvailable) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (error) { storageAvailable = false; }
  };

  const pathFile = decodeURIComponent(location.pathname.split('/').pop() || 'index.html');
  const file = filenames.includes(pathFile) ? pathFile :
    (document.querySelector('.topic-links a[aria-current="page"]')?.getAttribute('href') || pathFile);
  if (filenames.includes(file) && !state.visited.includes(file)) {
    state.visited.push(file);
    save();
  }

  const dashboard = document.getElementById('mission-control');
  function render() {
    if (!dashboard) return;
    const count = state.visited.length;
    document.getElementById('mission-count').innerHTML = `${count}<span>/7</span>`;
    document.getElementById('mission-meter-fill').style.width = `${(count / filenames.length * 100).toFixed(2)}%`;
    document.getElementById('mission-progress').setAttribute('aria-valuenow', String(count));
    for (const tile of dashboard.querySelectorAll('[data-mission-topic]')) {
      const visited = state.visited.includes(tile.dataset.missionTopic);
      tile.classList.toggle('visited', visited);
      tile.querySelector('.mission-status').textContent = visited ? '✓' : '◇';
      tile.querySelector('small').textContent = visited ? 'VISITED' : 'NOT VISITED';
      tile.setAttribute('aria-label', `${tile.querySelector('span:nth-child(2)').textContent}: ${visited ? 'visited' : 'not visited'}`);
    }
    const best = document.getElementById('mission-quiz-best');
    best.textContent = state.quizBest === null ? 'NOT PLAYED YET' : `${state.quizBest} / 7 POINTS`;
    document.getElementById('mission-ai-state').textContent = state.aiTried ? 'SIMULATION TRIED ✓' : 'NOT TRIED';
    const msg = document.getElementById('mission-message');
    msg.textContent = !storageAvailable
      ? 'Progress storage is unavailable in this browser. Visit tracking may reset when you leave.'
      : count === 7 ? 'ALL TOPICS DISCOVERED! Try to beat your best quiz score.'
      : count === 0 ? 'Choose a topic to unlock your first mission.'
      : `${7 - count} topic${7 - count === 1 ? '' : 's'} left to discover. Keep exploring!`;
    dashboard.classList.toggle('mission-complete', count === 7);
  }

  window.addEventListener('techgeeks:quiz-complete', event => {
    const score = event.detail?.score;
    const total = event.detail?.total;
    if (!Number.isInteger(score) || total !== 7 || score < 0 || score > 7) return;
    state.quizBest = Math.max(state.quizBest ?? 0, score);
    save(); render();
  });
  window.addEventListener('techgeeks:ai-tried', () => {
    if (state.aiTried) return;
    state.aiTried = true; save(); render();
  });

  if (dashboard) {
    document.getElementById('mission-reset').addEventListener('click', () => {
      if (!window.confirm('Clear topic visits, your best quiz score and the AI lab badge on this browser?')) return;
      state = fresh(); save(); render();
    });
    render();
  }
})();

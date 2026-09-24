(() => {
  const story = document.querySelector('.habit-cinema');
  if (!story) return;
  const pin = story.querySelector('.cinema-pin');
  const chapters = [...story.querySelectorAll('[data-chapter]')];
  const panels = ['copy', 'app-screen', 'callout'].map(key => [...story.querySelectorAll(`[data-${key}]`)]);
  const toggle = document.getElementById('motion-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const shortScreen = matchMedia('(max-height: 700px)');
  let phase = 0, queued = false, start = 0, distance = 1;
  const paused = () => document.body.classList.contains('paused');
  const isStatic = () => reduced.matches || shortScreen.matches;
  function show(next) {
    if (next === phase) return;
    phase = next;
    story.dataset.phase = String(phase);
    panels.forEach(group => group.forEach((el, i) => {
      el.hidden = i !== phase;
      el.inert = i !== phase;
      el.classList.toggle('is-current', i === phase);
    }));
    chapters.forEach((button, i) => button.setAttribute('aria-pressed', String(i === phase)));
    document.getElementById('chapter-count').textContent = `0${phase + 1}`;
  }
  function measure() {
    const top = parseFloat(getComputedStyle(pin).top) || 0;
    start = story.getBoundingClientRect().top + scrollY - top;
    distance = Math.max(1, story.offsetHeight - pin.offsetHeight);
  }
  function update() {
    queued = false;
    if (isStatic() || paused()) return;
    const progress = Math.max(0, Math.min(1, (scrollY - start) / distance));
    const next = Math.min(3, Math.floor(progress * 4));
    // Do not hide an outcome control while someone is using it with a keyboard.
    if (document.activeElement?.closest('[data-callout]') && document.activeElement.matches(':focus-visible')) return;
    show(next);
    story.style.setProperty('--story-progress', progress);
    story.style.setProperty('--chapter-progress', Math.min(1, progress * 4 - next));
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  chapters.forEach((button, index) => button.addEventListener('click', () => {
    if (isStatic() || paused()) {
      show(index);
      story.style.setProperty('--chapter-progress', 1);
      story.style.setProperty('--story-progress', (index + 1) / 4);
    } else {
      measure();
      // Position safely inside a chapter so subpixel rounding cannot select its predecessor.
      scrollTo({top: start + distance * (index / 4 + .035), behavior: 'smooth'});
    }
  }));
  function syncMotion() {
    story.classList.toggle('cinema-static', isStatic());
    if (reduced.matches && !paused()) document.body.classList.add('paused');
    toggle.textContent = reduced.matches ? 'Reduced motion' : paused() ? 'Resume motion' : 'Pause motion';
    toggle.setAttribute('aria-pressed', String(paused()));
    toggle.disabled = reduced.matches;
    measure(); schedule();
  }
  toggle.addEventListener('click', () => { document.body.classList.toggle('paused'); syncMotion(); });
  reduced.addEventListener('change', () => {
    document.body.classList.toggle('paused', reduced.matches);
    syncMotion();
  });
  shortScreen.addEventListener('change', syncMotion);
  new MutationObserver(syncMotion).observe(document.body, {attributes:true, attributeFilter:['class']});
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', () => { measure(); schedule(); });
  addEventListener('load', () => { measure(); schedule(); });
  document.fonts?.ready.then(() => { measure(); schedule(); });
  story.querySelectorAll('[data-outcome]').forEach(button => button.addEventListener('click', () => {
    const slip = button.dataset.outcome === 'slip';
    story.querySelectorAll('[data-outcome]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
    const screen = story.querySelector('.app-outcome');
    screen.classList.toggle('is-slip', slip);
    document.getElementById('outcome-title').textContent = slip ? 'noted, and kept.' : 'you rode it out.';
    document.getElementById('outcome-status').textContent = slip ? 'Had a slip' : 'Rode it out';
    document.getElementById('outcome-note').innerHTML = slip ? 'This moment is part of your story.<br>There’s still a next step.' : 'An honest record of this moment.<br>Something to learn from next time.';
    screen.querySelector('.outcome-mark svg').innerHTML = slip ? '<circle cx="30" cy="30" r="18"/><path d="M30 18v13l8 5"/>' : '<path d="m16 31 10 10 20-22"/>';
  }));
  if ('IntersectionObserver' in window) {
    const visibility = new IntersectionObserver(entries => {
      story.classList.toggle('cinema-offscreen', !entries[0].isIntersecting);
    });
    visibility.observe(story);
  }
  syncMotion();
})();

(() => {
  const section = document.querySelector('.product-showcase');
  if (!section) return;
  const rail = section.querySelector('.showcase-viewport');
  const track = section.querySelector('.showcase-track');
  const group = section.querySelector('.showcase-group');
  const button = section.querySelector('[data-showcase-motion]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Three copies leave enough track to wrap even on a wide desktop. Only the
  // original four figures are exposed to assistive technology.
  for (let i = 0; i < 2; i++) {
    const copy = group.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true'); copy.inert = true;
    copy.querySelectorAll('img').forEach(img => { img.alt = ''; });
    track.append(copy);
  }
  let visible = false, userPaused = false, frame = 0, last = 0, position = 0, distance = group.getBoundingClientRect().width;
  const globallyPaused = () => document.body.classList.contains('paused');
  const canMove = () => visible && !document.hidden && !reduced.matches && !globallyPaused() && !userPaused;
  function tick(time) {
    frame = 0;
    if (!canMove()) { last = 0; return; }
    const delta = last ? Math.min(time - last, 50) : 0;
    last = time;
    if (distance > 0) {
      position = (position + delta * .020) % distance;
      rail.scrollLeft = position;
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    button.disabled = reduced.matches || globallyPaused();
    button.textContent = reduced.matches ? 'Reduced motion' : globallyPaused() ? 'Motion paused' : userPaused ? 'Resume gallery' : 'Pause gallery';
    button.setAttribute('aria-pressed', String(userPaused || reduced.matches || globallyPaused()));
    if (canMove() && !frame) { last = 0; position = rail.scrollLeft; frame = requestAnimationFrame(tick); }
    else if (!canMove()) { cancelAnimationFrame(frame); frame = 0; last = 0; }
  }
  const pause = () => { userPaused = true; sync(); };
  button.addEventListener('click', () => { userPaused = !userPaused; sync(); });
  let pointerStart = null;
  rail.addEventListener('pointerdown', event => { pointerStart = {x:event.clientX, y:event.clientY}; }, {passive:true});
  rail.addEventListener('pointermove', event => {
    if (!pointerStart) return;
    const dx = Math.abs(event.clientX - pointerStart.x), dy = Math.abs(event.clientY - pointerStart.y);
    if (dx > 8 && dx > dy) pause();
  }, {passive:true});
  for (const type of ['pointerup', 'pointercancel']) rail.addEventListener(type, () => { pointerStart = null; }, {passive:true});
  rail.addEventListener('wheel', event => { if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) pause(); }, {passive:true});
  rail.addEventListener('keydown', pause);
  for (const [selector, direction] of [['[data-showcase-prev]', -1], ['[data-showcase-next]', 1]]) {
    section.querySelector(selector).addEventListener('click', () => {
      pause();
      // Move onto the identical middle copy before stepping backwards at start.
      if (direction < 0 && rail.scrollLeft < 1) rail.scrollLeft = distance;
      rail.scrollBy({left: direction * distance / 4, behavior: reduced.matches ? 'instant' : 'smooth'});
    });
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(rail);
  else visible = true;
  if ('ResizeObserver' in window) new ResizeObserver(() => { distance = group.getBoundingClientRect().width; }).observe(group);
  reduced.addEventListener('change', sync);
  new MutationObserver(sync).observe(document.body, {attributes:true, attributeFilter:['class']});
  document.addEventListener('visibilitychange', sync);
  sync();
})();

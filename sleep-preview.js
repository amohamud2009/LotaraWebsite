/* Catalog metadata and artwork from Lotara's native Sleep library. No audio or user data. */
(() => {
  'use strict';
  const section = document.querySelector('#wind-down');
  if (!section) return;
  const screen = section.querySelector('#sleep-screen');
  const picker = section.querySelector('.sleep-picker');
  const announcement = section.querySelector('.sleep-announcement');
  const invitation = section.querySelector('#sleep-invitation');
  const storeURL = 'https://apps.apple.com/us/app/lotara/id6749601041';
  const icons = {
    rain: '<path d="M6 14a4 4 0 0 1-.5-8A6 6 0 0 1 17 5a4.5 4.5 0 0 1 1 9M7 17l-1 3m6-3-1 3m6-3-1 3"/>',
    ocean: '<path d="M2 7q3-4 6 0t6 0t8 0M2 12q3-4 6 0t6 0t8 0M2 17q3-4 6 0t6 0t8 0"/>',
    wind: '<path d="M3 8h12a3 3 0 1 0-3-3M2 12h17a3 3 0 1 1-3 3M4 16h5a3 3 0 1 1-3 3"/>',
    noise: '<path d="M3 10v4m4-7v10m5-14v18m5-15v12m4-8v4"/>',
    moon: '<path d="M20 14A9 9 0 0 1 10 3a9 9 0 1 0 10 11Z"/>'
  };
  const svg = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.moon}</svg>`;
  const catalog = {
    aldarune: {title:'The Last Evening of Aldarune', art:'aldarune', meta:'Adam Stone · 7 min · read-along', tag:'A lost world', description:'A slow, wondrous drift through the final golden evening of a city that time forgot — and was gently given back to the grass.'},
    tree: {title:'The Tree at the Edge of the World', art:'tree', meta:'Adam Stone · 5 min · read-along', tag:'Deep time', description:'Ten thousand years of seasons, witnessed from a single patient tree high on a quiet mountain.'},
    caravan: {title:'The Salt Road', art:'caravan', meta:'Adam Stone · 5 min · read-along', tag:'A night crossing', description:'A slow caravan winds between moonlit dunes under a sky poured full of stars — in no hurry, in no danger, carried gently through the dark.'},
    rain: {title:'Rain on a Tin Roof', art:'rain', meta:'Theo · 18 min', tag:'Sleep story'},
    train: {title:'The Night Train', art:'train', meta:'David · 13 min', tag:'Sleep story'},
    cabin: {title:'The Cabin in the Snow', art:'cabin', meta:'Joe · 14 min', tag:'Sleep story'},
    rainfall: {title:'Rain', icon:'rain', meta:'Soundscape', description:'Steady weather, gusting now and then'},
    ocean: {title:'Ocean', icon:'ocean', meta:'Soundscape', description:'Long waves, arriving and drawing back'},
    wind: {title:'Night Wind', icon:'wind', meta:'Soundscape', description:'Air moving through trees, far off'},
    brown: {title:'Brown noise', icon:'noise', meta:'Soundscape', description:'Deep and low, like distant surf'},
    pink: {title:'Pink noise', icon:'noise', meta:'Soundscape', description:'Softer than white, easy to sleep to'},
    white: {title:'White noise', icon:'noise', meta:'Soundscape', description:'Even hiss that masks the room'},
    deep: {title:'Deep Sleep', icon:'moon', meta:'Theo · 6 min', tag:'Drift off'},
    evening: {title:'Evening Winddown', icon:'moon', meta:'Theo · 4 min', tag:'Evening ritual'},
    body: {title:'Body Scan for Sleep', icon:'moon', meta:'Theo · 6 min', tag:'Release the day'}
  };
  const shelves = {
    originals:{title:'Lotara Originals', ids:['aldarune','tree','caravan'], note:'Stories with somewhere to take you. Tap a cover to take a closer look.', sub:'A world to wander into.'},
    stories:{title:'Sleep Stories',ids:['rain','train','cabin'],note:'Rain on the roof. A train through the night. Choose a story for tonight.',sub:'Let a story carry the evening.'},
    sounds:{title:'Soundscapes',ids:['rainfall','ocean','wind','brown','pink','white'],note:'Find your familiar sound. Open one to explore the collection.',sub:'Something soft to fill the quiet.'},
    winddown:{title:'Wind-down',ids:['deep','evening','body'],note:'A few quiet minutes for you. Explore a guided session.',sub:'A little room to let go.'}
  };
  let current = 'originals';
  let opened = null;
  function cover(id, featured = false) {
    const item = catalog[id];
    return `<button type="button" class="sleep-cover ${featured ? 'sleep-cover-featured' : ''}" data-sleep-item="${id}" aria-label="Explore ${item.title}"><img src="assets/sleep/${item.art}.jpg" alt="" loading="lazy" width="563" height="240">${featured ? `<span class="sleep-cover-tag">${item.tag}</span>` : ''}<span class="sleep-cover-title">${item.title}</span><span class="sleep-cover-meta">${item.meta}</span></button>`;
  }
  function showShelf(restoreId) {
    const shelf = shelves[current];
    let content;
    if (current === 'sounds') {
      content = `<div class="sleep-sound-grid">${shelf.ids.map(id => `<button type="button" class="sleep-sound" data-sleep-item="${id}" aria-label="Explore ${catalog[id].title}">${svg(catalog[id].icon)}<strong>${catalog[id].title}</strong></button>`).join('')}</div>`;
    } else if (current === 'winddown') {
      content = shelf.ids.map(id => `<button type="button" class="sleep-session" data-sleep-item="${id}" aria-label="Explore ${catalog[id].title}">${svg('moon')}<span><strong>${catalog[id].title}</strong><small>${catalog[id].meta}</small><span class="sleep-session-tag">${catalog[id].tag}</span></span></button>`).join('');
    } else {
      content = cover(shelf.ids[0], true) + `<div class="sleep-cover-grid">${shelf.ids.slice(1).map(id => cover(id)).join('')}</div>`;
    }
    screen.innerHTML = `<div class="sleep-content-enter"><h4>Sleep</h4><span class="sleep-tonight">TONIGHT</span><p class="sleep-greeting">Rest well.</p><p class="sleep-greeting-note">${shelf.sub}</p><h5 class="sleep-shelf-title">${shelf.title}</h5>${content}<p class="sleep-shelf-note">Tap a title to explore · Audio in the app</p></div>`;
    screen.scrollTop = 0;
    opened = null;
    invitation.textContent = shelf.note;
    if (restoreId) screen.querySelector(`[data-sleep-item="${restoreId}"]`)?.focus({preventScroll:true});
  }
  function showDetail(id) {
    const item = catalog[id];
    if (!item) return;
    opened = id;
    screen.innerHTML = `<div class="sleep-detail sleep-content-enter"><button type="button" class="sleep-back" data-sleep-back><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5-7 7 7 7"/></svg>Back to library</button>${item.art ? `<img class="sleep-detail-art" src="assets/sleep/${item.art}.jpg" alt="" width="563" height="240">` : `<div class="sleep-sound-art" aria-hidden="true">${svg(item.icon)}</div>`}<span class="sleep-tonight">${current === 'originals' ? 'LOTARA ORIGINAL' : (item.tag || 'SOUNDSCAPES')}</span><h4 tabindex="-1">${item.title}</h4><p class="sleep-detail-meta">${item.meta}</p>${item.description ? `<p class="sleep-detail-description">${item.description}</p>` : ''}<a class="sleep-listen-link" href="${storeURL}">Get Lotara to listen</a><p class="sleep-detail-footnote">You’re exploring a preview.<br>Full audio is available in the iPhone app.</p></div>`;
    screen.scrollTop = 0;
    screen.querySelector('.sleep-back').focus({preventScroll:true});
    announcement.textContent = `${item.title}. Preview details opened.`;
  }
  picker.addEventListener('click', event => {
    const button = event.target.closest('[data-sleep-shelf]');
    if (!button) return;
    current = button.dataset.sleepShelf;
    picker.querySelectorAll('button').forEach(candidate => candidate.setAttribute('aria-pressed', String(candidate === button)));
    showShelf();
    announcement.textContent = `${shelves[current].title} shown in the phone preview.`;
  });
  screen.addEventListener('click', event => {
    if (event.target.closest('[data-sleep-back]')) {
      showShelf(opened);
      announcement.textContent = `${shelves[current].title} library.`;
      return;
    }
    const item = event.target.closest('[data-sleep-item]');
    if (item) showDetail(item.dataset.sleepItem);
  });
  screen.addEventListener('keydown', event => {
    if (event.key === 'Escape' && opened) { event.preventDefault(); showShelf(opened); }
  });
  showShelf();
  picker.hidden = false;
  // One entrance, with a static fallback and the shared reduced-motion controls.
  if ('IntersectionObserver' in window) {
    const stage = section.querySelector('.sleep-stage');
    const entrance = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        stage.classList.add('sleep-stage-arriving');
        entrance.disconnect();
      }
    }, {threshold:0.2});
    entrance.observe(stage);
  }
})();

/* ============================================================
   LOTARA PORTAL — Shell renderer
   Injects ambient orbs + particles + sidebar + topbar
   so every page is identical and pixel-perfect.
   ============================================================ */

// ── SVG icon library (lucide-style, matching lotara.app aesthetic)
//    All icons are SELF-CONTAINED with explicit attrs so they always
//    render correctly even before CSS loads. ──
const _SVG_ATTR = 'width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';

function _icon(paths) {
    return `<svg ${_SVG_ATTR}>${paths}</svg>`;
}

const ICONS = {
    home:       _icon('<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2h-4M9 22V12h6v10M9 22h6"/>'),
    target:     _icon('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'),
    book:       _icon('<path d="M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>'),
    heart:      _icon('<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>'),
    trending:   _icon('<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>'),
    settings:   _icon('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>'),
    flame:      _icon('<path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/>'),
    zap:        _icon('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'),
    award:      _icon('<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>'),
    activity:   _icon('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'),
    star:       _icon('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'),
    calendar:   _icon('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'),
    edit:       _icon('<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>'),
    smile:      _icon('<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>'),
    arrowRight: _icon('<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>'),
    arrowUp:    _icon('<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>'),
    arrowDown:  _icon('<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>'),
    minus:      _icon('<line x1="5" y1="12" x2="19" y2="12"/>'),
    sparkles:   _icon('<path d="M12 3v3M12 18v3M21 12h-3M6 12H3M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1M18.4 18.4l-2.1-2.1M7.7 7.7L5.6 5.6"/>'),
    feather:    _icon('<path d="M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/>'),

    // ── Mood SF-Symbol-equivalents (line-art) ──
    moodSparkles:  _icon('<path d="M12 3v3M12 18v3M21 12h-3M6 12H3M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1M18.4 18.4l-2.1-2.1M7.7 7.7L5.6 5.6"/>'),
    moodSun:       _icon('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>'),
    moodSmile:     _icon('<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>'),
    moodHeart:     _icon('<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>'),
    moodMinus:     _icon('<circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/>'),
    moodCircle:    _icon('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2.5"/>'),
    moodCloud:     _icon('<path d="M17.5 19a4.5 4.5 0 100-9 6 6 0 00-11.5 2 4 4 0 000 7z"/>'),
    moodRain:      _icon('<path d="M16 13v8M8 13v8M12 15v8M20 16.58A5 5 0 0018 7h-1.26A8 8 0 104 15.25"/>'),
    moodAlert:     _icon('<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'),
    moodX:         _icon('<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'),
};

// ── Mood scale matching iOS CalmMoodTrackerView exactly ──
//    Score → { iconKey, label, color }
const MOOD_SCALE = {
    10: { iconKey: 'moodSparkles', label: 'Joyful',     color: '#ff8cc8' },
    9:  { iconKey: 'moodSun',      label: 'Great',      color: '#4ade80' },
    8:  { iconKey: 'moodSmile',    label: 'Happy',      color: '#74c0fc' },
    7:  { iconKey: 'moodHeart',    label: 'Good',       color: '#ff8cc8' },
    6:  { iconKey: 'moodMinus',    label: 'Okay',       color: '#a3b8b8' },
    5:  { iconKey: 'moodCircle',   label: 'Meh',        color: '#b39d9d' },
    4:  { iconKey: 'moodCloud',    label: 'Low',        color: '#cc8866' },
    3:  { iconKey: 'moodRain',     label: 'Sad',        color: '#748ffc' },
    2:  { iconKey: 'moodAlert',    label: 'Anxious',    color: '#e69140' },
    1:  { iconKey: 'moodX',        label: 'Struggling', color: '#ff5959' },
};

function moodMeta(score) {
    const s = Math.max(1, Math.min(10, Math.round(score)));
    return MOOD_SCALE[s];
}
function moodIcon(score) { return ICONS[moodMeta(score).iconKey]; }

// ── Inject orbs + particles into body once ──
function injectAmbience() {
    if (document.querySelector('.orb-1')) return;
    const orbs = '<div class="orb orb-1"></div><div class="orb orb-2"></div><div class="orb orb-3"></div>';
    document.body.insertAdjacentHTML('afterbegin', orbs);

    const particles = document.createElement('div');
    particles.className = 'particles';
    for (let i = 0; i < 22; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.cssText = `
            left: ${Math.random()*100}%;
            bottom: -10px;
            width: ${Math.random()*2+1}px;
            height: ${Math.random()*2+1}px;
            opacity: ${Math.random()*0.5+0.15};
            animation-duration: ${Math.random()*22+18}s;
            animation-delay: ${Math.random()*15}s;
        `;
        particles.appendChild(p);
    }
    document.body.appendChild(particles);
}

// ── Render sidebar (consistent on every page) ──
function renderSidebar(activePage) {
    const items = [
        { key: 'dashboard', href: 'dashboard.html', label: 'Dashboard', icon: ICONS.home },
        { key: 'habits',    href: 'habits.html',    label: 'Habits',    icon: ICONS.target },
        { key: 'journal',   href: 'journal.html',   label: 'Journal',   icon: ICONS.book },
        { key: 'mood',      href: 'mood.html',      label: 'Mood',      icon: ICONS.heart },
        { key: 'progress',  href: 'progress.html',  label: 'Progress',  icon: ICONS.trending },
        { key: 'settings',  href: 'settings.html',  label: 'Settings',  icon: ICONS.settings },
    ];

    const html = `
        <aside class="sidebar">
            <div class="sb-logo">
                <a href="/"><img src="assets/images/lotara-logo.png" alt="Lotara"></a>
            </div>
            <div class="sb-user">
                <div class="sb-avatar" id="sb-avatar">?</div>
                <div style="overflow:hidden">
                    <div class="sb-name" id="sb-name">Loading…</div>
                    <div class="sb-plan">Premium</div>
                </div>
            </div>
            <nav class="sb-nav">
                ${items.map(it => `
                    <a href="${it.href}" class="nav-item${it.key === activePage ? ' active' : ''}">
                        ${it.icon}
                        ${it.label}
                    </a>`).join('')}
            </nav>
            <div class="sb-footer">
                <a href="https://apps.apple.com/us/app/lotara/id6749601041" class="btn-app" target="_blank" rel="noopener">Open in App</a>
                <button class="btn-signout">Sign out</button>
            </div>
        </aside>`;
    document.body.insertAdjacentHTML('beforeend', html);
}

// ── Render topbar ──
function renderTopbar(opts = {}) {
    const { showStreak = true, title = '' } = opts;
    const html = `
        <div class="topbar">
            <div>
                <div class="topbar-greeting" id="topbar-greeting">${title || 'Loading…'}</div>
                <div class="topbar-date" id="topbar-date"></div>
            </div>
            ${showStreak ? `
            <div class="streak-pill">
                <div class="streak-dot"></div>
                <span id="streak-val" style="font-weight:500">—</span>&nbsp;<span style="opacity:.7">day streak</span>
            </div>` : ''}
        </div>`;
    return html;
}

// ── Bootstrap a page (call once on load) ──
function bootPortal({ active, title }) {
    injectAmbience();
    renderSidebar(active);
}

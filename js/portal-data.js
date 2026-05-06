/* ============================================================
   LOTARA PORTAL — Shared data helpers
   Uses exact Firestore paths + field names from the iOS app.

   Key facts from iOS FirebaseDataService.swift:
   - habitCompletions (ROOT): { id, date: Timestamp, habitId, userId }
   - users/{uid}/habits: { id, name, ... }
   - users/{uid}/journal: { id, title, content, mood: Int, date: Timestamp, tags }
   - users/{uid}/moods:   { id, timestamp: Timestamp, value: Int, note, tags }
   - users/{uid}/meditation: { id, date: Timestamp, ... }
   ============================================================ */

// ── Date utilities ──────────────────────────────────────────

function toJS(ts) {
    if (!ts) return new Date(0);
    if (ts.toDate) return ts.toDate();
    if (ts.seconds) return new Date(ts.seconds * 1000);
    return new Date(ts);
}

function toDateStr(ts) {
    return toJS(ts).toISOString().slice(0,10);
}

// ── Streak (walk backward from today counting consecutive days) ──
function calcOverallStreak(completions) {
    if (!completions.length) return 0;
    const days = new Set(completions.map(c => toDateStr(c.date)));
    let streak = 0;
    const d = new Date();
    while (days.has(d.toISOString().slice(0,10))) {
        streak++;
        d.setDate(d.getDate() - 1);
    }
    return streak;
}

function calcHabitStreak(habitCompletions) {
    if (!habitCompletions.length) return 0;
    const days = new Set(habitCompletions.map(c => toDateStr(c.date)));
    let streak = 0;
    const d = new Date();
    while (days.has(d.toISOString().slice(0,10))) {
        streak++;
        d.setDate(d.getDate() - 1);
    }
    return streak;
}

// ── 7-day dot history for a habit ──
function sevenDayDots(habitCompletions) {
    const today = new Date();
    const days = new Set(habitCompletions.map(c => toDateStr(c.date)));
    return Array.from({length: 7}, (_, i) => {
        const d = new Date(today); d.setDate(today.getDate() - (6 - i));
        return days.has(d.toISOString().slice(0,10));
    });
}

// ── Completion % this month ──
function monthlyCompletionPct(habitCompletions) {
    const now = new Date();
    const ms = new Date(now.getFullYear(), now.getMonth(), 1);
    const days = new Set(
        habitCompletions
            .filter(c => toJS(c.date) >= ms)
            .map(c => toDateStr(c.date))
    );
    return Math.min(100, Math.round((days.size / now.getDate()) * 100));
}

// ── Habit ring SVG (self-contained: explicit width/height) ──
function habitRingSVG(pct, color, size = 40) {
    const r = 14, circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    return `<svg width="${size}" height="${size}" viewBox="0 0 36 36" style="display:block;flex-shrink:0">
        <circle cx="18" cy="18" r="${r}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="3"/>
        <circle cx="18" cy="18" r="${r}" fill="none" stroke="${color}" stroke-width="3"
            stroke-dasharray="${dash.toFixed(1)} ${circ.toFixed(1)}"
            stroke-linecap="round" transform="rotate(-90 18 18)"/>
    </svg>`;
}

// ── Mood color from score (Int 1-10) ──
function moodColor(score) {
    if (score <= 2) return '#748ffc';
    if (score <= 4) return '#74c0fc';
    if (score <= 6) return '#4ade80';
    if (score <= 8) return '#ffd43b';
    return '#ff8cc8';
}

function moodLabel(score) {
    if (score <= 2) return 'Low';
    if (score <= 4) return 'Okay';
    if (score <= 6) return 'Good';
    if (score <= 8) return 'Great';
    return 'Amazing';
}

// ── Simple SVG mood face (self-contained) ──
function moodFaceSVG(score, size = 36) {
    const color = moodColor(score);
    const smile = score >= 7
        ? `<path d="M9 17s2 3 5 3 5-3 5-3" stroke="${color}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`
        : score <= 4
        ? `<path d="M9 19s2-3 5-3 5 3 5 3" stroke="${color}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`
        : `<line x1="10" y1="18" x2="18" y2="18" stroke="${color}" stroke-width="1.6" stroke-linecap="round"/>`;
    return `<svg width="${size}" height="${size}" viewBox="0 0 28 28" style="display:block;flex-shrink:0">
        <circle cx="14" cy="14" r="12" fill="${color}22" stroke="${color}" stroke-width="1.5"/>
        <circle cx="10" cy="12" r="1.4" fill="${color}"/>
        <circle cx="18" cy="12" r="1.4" fill="${color}"/>
        ${smile}
    </svg>`;
}

// ── SVG line chart for moods ──
function renderMoodSVG(svgId, scores) {
    const svg = document.getElementById(svgId);
    if (!svg) return;
    if (!scores || scores.length < 2) {
        svg.innerHTML = `<text x="100" y="40" text-anchor="middle"
            fill="rgba(255,255,255,0.25)" font-size="11" font-family="system-ui">Not enough data yet</text>`;
        return;
    }
    const W = 200, H = 72, pad = 8;
    const min = Math.min(...scores), max = Math.max(...scores);
    const range = max - min || 1;
    const pts = scores.map((v, i) => [
        pad + (i / (scores.length - 1)) * (W - pad * 2),
        H - pad - ((v - min) / range) * (H - pad * 2)
    ]);
    const linePts = pts.map(p => p.join(',')).join(' ');
    const areaD = `M${pts[0][0]},${H} ${pts.map(p=>`L${p.join(',')}`).join(' ')} L${pts[pts.length-1][0]},${H} Z`;
    svg.innerHTML = `
        <defs>
            <linearGradient id="mg-${svgId}" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.4"/>
                <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/>
            </linearGradient>
        </defs>
        <path d="${areaD}" fill="url(#mg-${svgId})"/>
        <polyline points="${linePts}" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
}

// ── Sidebar user setup ──
function setupSidebar(user) {
    const name = user.displayName || user.email || 'User';
    const initial = name.charAt(0).toUpperCase();
    const elAvatar = document.getElementById('sb-avatar');
    const elName   = document.getElementById('sb-name');
    if (elAvatar) elAvatar.textContent = initial;
    if (elName)   elName.textContent   = name;
    document.querySelectorAll('.btn-signout').forEach(btn => {
        btn.addEventListener('click', async () => {
            await firebase.auth().signOut();
            window.location.href = '/signin.html';
        });
    });
}

// ── Topbar greeting + date ──
function setupTopbar(user) {
    const h = new Date().getHours();
    const t = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
    const firstName = (user.displayName || user.email || 'there').split(' ')[0].split('@')[0];
    const el = document.getElementById('topbar-greeting');
    if (el) el.textContent = `Good ${t}, ${firstName}`;
    const d = new Date();
    const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const dateEl = document.getElementById('topbar-date');
    if (dateEl) dateEl.textContent = `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// ── Colors per habit index ──
const HABIT_COLORS = ['#a78bfa','#74c0fc','#ff8cc8','#4ade80','#ffd43b','#748ffc','#fb923c'];

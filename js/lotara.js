/* ============================================================
   Lotara — shared behaviour: nav state, scroll reveal, ripple.
   Loaded by the landing page and every sub-page.
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Nav goes solid once you leave the top ---- */
  var nav = document.getElementById('nav');
  if (nav) {
    var onScrollNav = function () {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScrollNav, { passive: true });
    onScrollNav();
  }

  /* ---- Scroll reveal ----------------------------------------
     Same idea as the original site's initScrollAnimations: elements
     start offset and settle as they enter. Groups are declared here
     rather than in markup so any page picks it up by using the class.

     Hiding content in CSS and revealing it from JS means a failure
     leaves the page blank, so this never leans on one mechanism:
     IntersectionObserver drives it, a scroll handler backs it up,
     and a timer reveals everything regardless after three seconds.
     Worst case the animation is skipped — never the content.        */
  if (!reduced) {
    var targets = [];

    var groups = [
      ['.f-card', 90, ''],
      ['.lcard', 90, ''],
      ['.showcase:not(.flip) .sc-media', 0, 'reveal-left'],
      ['.showcase:not(.flip) .sc-copy', 0, 'reveal-right'],
      ['.showcase.flip .sc-media', 0, 'reveal-right'],
      ['.showcase.flip .sc-copy', 0, 'reveal-left'],
      // The immersive posts. Everything animated inside them — the chart line
      // drawing, the health dials sweeping, the chips staggering, the sheen —
      // is gated on an ancestor carrying .reveal.in. When the layout moved from
      // .showcase to .feature these stopped matching anything, so all of it was
      // silently dead while still looking correct in a screenshot.
      ['.post', 0, ''],
      ['.feature-copy', 0, ''],
      ['.stat', 80, ''],
      ['.pf', 60, ''],
      ['.cmp-body .cmp-row', 45, ''],
      ['.sec-head', 0, ''],
      ['.premium-wrap', 0, 'reveal-scale'],
      ['.final-inner', 0, 'reveal-scale'],
      ['.award', 90, ''],
      ['.doc h2', 0, ''],
      ['.doc p', 0, ''],
      ['.doc ul', 0, ''],
      ['.pledge', 0, 'reveal-scale'],
      ['.faq', 60, ''],
      ['.toc', 0, '']
    ];

    groups.forEach(function (g) {
      var sel = g[0], step = g[1], variant = g[2];
      document.querySelectorAll(sel).forEach(function (el, i) {
        if (el.classList.contains('reveal')) return;   // never double-register
        el.classList.add('reveal');
        if (variant) el.classList.add(variant);
        if (step) el.style.transitionDelay = (i % 8) * step + 'ms';
        targets.push(el);
      });
    });

    var show = function (el) { el.classList.add('in'); };

    var sweep = function () {
      var h = window.innerHeight;
      for (var i = 0; i < targets.length; i++) {
        var el = targets[i];
        if (el.classList.contains('in')) continue;
        var r = el.getBoundingClientRect();
        if (r.top < h * 0.76 && r.bottom > 0) show(el);
      }
    };

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -24% 0px' });
      targets.forEach(function (el) { io.observe(el); });
    }

    var ticking = false;
    var onScrollReveal = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { sweep(); ticking = false; });
    };
    window.addEventListener('scroll', onScrollReveal, { passive: true });
    window.addEventListener('resize', onScrollReveal, { passive: true });
    sweep();

    setTimeout(function () { targets.forEach(show); }, 3000);
  }

  /* ---- Scroll-linked scrub -----------------------------------
     The card animations are tied to scroll position rather than fired once on
     entry. As you scroll the chart draws, the rings fill and the numbers climb
     in step with the page; scroll back and they run in reverse. This is the
     thing that actually holds attention — the motion belongs to the reader's
     hand rather than to a timer they can miss.

     Progress is measured from where the card sits in the viewport: 0 when its
     top is near the bottom of the screen, 1 by the time it has travelled up to
     the reading zone. Everything on a card shares that one number, so the arc,
     the digit and the bar can never drift apart.

     Pinning the card would buy more runway, the way Apple's product pages do,
     but it pays for it in page length — and on a page whose job is to convert a
     stranger, length is the one budget not worth spending. It also isn't
     necessary. A card is on screen for about 1.9 viewports of scroll and the
     first version of this used 0.58 of that, so more than half the runway was
     already sitting there unused. What follows spends it instead of buying more.
                                                                            */
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  // Measured from the card's own box rather than a fixed slice of the viewport.
  // A tall card and a short one then behave the same, and — the reason it is
  // written this way — the parts low inside a tall card are no longer still
  // animating after the card's top has already left the reading zone.
  function scrubProgress(el) {
    var vh = window.innerHeight, r = el.getBoundingClientRect();
    var from = vh * 0.98;                     // top edge entering from below -> 0
    var to   = vh * 0.50 - r.height * 0.55;   // card settled in the reading zone -> 1
    return clamp((from - r.top) / (from - to));
  }

  // smoothstep, not easeOutCubic. The cubic reached 98.5% of its travel after
  // 76% of the scroll, so the last quarter of every card moved by almost
  // nothing — a short runway made shorter still. This one spends the middle.
  function ease(t) { return t * t * (3 - 2 * t); }

  // A sub-window of the card's progress, so the parts arrive in an order rather
  // than all together. This is the difference between motion that is merely
  // tied to scroll and motion that reads as choreographed.
  function stage(p, a, b) { return ease(clamp((p - a) / (b - a))); }

  var scrubCards = Array.prototype.slice.call(document.querySelectorAll('.post'));

  // Measure each chart path once — the CSS can't know its length, and guessing
  // it means part of the draw happens with nothing visible on screen.
  document.querySelectorAll('.p-chart .ln').forEach(function (ln) {
    var len = Math.ceil(ln.getTotalLength());
    ln.dataset.len = len;
    ln.style.strokeDasharray = len;
  });

  // Progress for one group, measured from that group's OWN box.
  //
  // Anchoring everything to the card was the bug that made the urge chart look
  // static. That chart sits 313px down a 916px card, so with the card's top
  // edge driving it the line was already 58% drawn by the time it cleared the
  // bottom of the screen and finished a third of a screen later. Most of the
  // draw happened where nobody could see it, however slowly you scrolled.
  //
  // Reading from the group's own box means an animation starts as that group
  // appears and finishes while it is being looked at, whatever else is on the
  // card and however tall the card is.
  function groupProgress(el) {
    var vh = window.innerHeight, r = el.getBoundingClientRect();
    var from = vh * 0.94;                     // group's top edge entering -> 0
    var to   = vh * 0.40 - r.height * 0.30;   // group settled in the reading zone -> 1
    return clamp((from - r.top) / (from - to));
  }

  // The box an element reads its progress from: the smallest one holding parts
  // that express the same value. A dial and the digit inside it share `.p-rings`;
  // the sleep bar and the durations beside it share the block that contains
  // them. Parts inside one group take one number and so cannot drift apart —
  // which is the property that has to survive this change.
  function anchorFor(el, card) {
    var g = el.closest('.p-chart, .p-rings, .p-chips, .p-meta');
    if (g) return g;
    var bar = card.querySelector('.sl-bar');
    if (bar && bar.parentNode.contains(el)) return bar.parentNode;
    return card;
  }

  // Built once per card. Each job pairs the box an animation measures against
  // with the write it performs, so every rect can be read before any style is
  // set. Interleaving reads and writes inside a scroll handler forces a layout
  // recalculation per read — with a group box per counter and per chip that is
  // dozens of forced layouts a frame, and the usual way a scrub that measured
  // free turns janky. Static values (--pf, path length) are resolved here too
  // rather than re-read from computed style on every frame.
  function buildJobs(card) {
    var jobs = [];

    var chart = card.querySelector('.p-chart');
    if (chart) {
      var ln = chart.querySelector('.ln'), ar = chart.querySelector('.ar');
      var len = ln ? +ln.dataset.len : 0;
      jobs.push({ box: chart, run: function (v) {
        if (ln) ln.style.strokeDashoffset = len * (1 - v);
        if (ar) ar.style.opacity = v;
      }});
    }

    var rings = card.querySelector('.p-rings');
    if (rings) {
      var arcs = Array.prototype.slice.call(rings.querySelectorAll('.arc'));
      var pfs  = arcs.map(function (a) {
        return parseFloat(getComputedStyle(a.parentNode.parentNode).getPropertyValue('--pf')) || 0;
      });
      jobs.push({ box: rings, run: function (v) {
        for (var i = 0; i < arcs.length; i++) arcs[i].style.strokeDashoffset = 276.5 * (1 - pfs[i] * v);
      }});
    }

    var bar = card.querySelector('.sl-bar i');
    if (bar) {
      jobs.push({ box: bar.parentNode.parentNode, run: function (v) {
        bar.style.width = (28 * v) + '%';
      }});
    }

    // Counters collected per anchor, so a box shared by several of them is
    // measured once and they all move on the same number.
    var slots = [];
    card.querySelectorAll('[data-count]').forEach(function (el) {
      if (isNaN(parseFloat(el.dataset.count))) return;
      var box = anchorFor(el, card), slot = null;
      for (var i = 0; i < slots.length; i++) if (slots[i].box === box) slot = slots[i];
      if (!slot) { slot = { box: box, els: [] }; slots.push(slot); }
      slot.els.push(el);
    });
    slots.forEach(function (slot) {
      jobs.push({ box: slot.box, run: function (v) {
        slot.els.forEach(function (el) {
          el.textContent = Math.round(parseFloat(el.dataset.count) * v) + (el.dataset.countSuffix || '');
        });
      }});
    });

    // Chips still stagger among themselves — sequencing belongs between parts
    // that say different things, and each chip does.
    var wrap = card.querySelector('.p-chips');
    if (wrap) {
      var chips = Array.prototype.slice.call(wrap.querySelectorAll('.chip'));
      jobs.push({ box: wrap, raw: true, run: function (p) {
        for (var i = 0; i < chips.length; i++) {
          var cp = stage(p, 0.10 + i * 0.14, 0.55 + i * 0.14);
          chips[i].style.opacity = cp;
          chips[i].style.transform = 'translateY(' + (10 * (1 - cp)) + 'px)';
        }
      }});
    }

    return jobs;
  }

  // Vertical order now sequences a card on its own: the chart sits above the
  // chips, so it draws first without anyone staging it to.
  function applyScrub(card, p) {
    var jobs = card._jobs || (card._jobs = buildJobs(card));
    var i;
    for (i = 0; i < jobs.length; i++) jobs[i].p = groupProgress(jobs[i].box);   // read
    for (i = 0; i < jobs.length; i++) jobs[i].run(jobs[i].raw ? jobs[i].p : ease(jobs[i].p));  // write

    // The sheen stays on the card's own progress: it is a property of the
    // surface rather than of anything printed on it. As a 1.5s keyframe on a
    // .35s delay it had usually finished before a slow reader got the card into
    // view — motion arriving ahead of the hand driving it.
    card.style.setProperty('--sheen', (p * 340).toFixed(1) + '%');
    card.style.setProperty('--sheen-o', Math.sin(p * Math.PI).toFixed(3));
  }

  if (!reduced && scrubCards.length) {
    // Hand these to the scrub — the CSS transitions would fight it, lagging a
    // frame behind every scroll event.
    document.documentElement.classList.add('scrub');

    var scrubTicking = false, settling = false;
    var lastY = window.pageYOffset, vel = 0;

    function paint() {
      var vh = window.innerHeight;
      for (var i = 0; i < scrubCards.length; i++) {
        var c = scrubCards[i], r = c.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;  // off screen
        applyScrub(c, scrubProgress(c));

        // Depth and lag run off the card's whole time on screen rather than the
        // window the data animates in. That leftover dwell — roughly a viewport
        // of it per card — is what a pinned layout would have charged page
        // length for; here it costs nothing and the card still feels alive
        // before its numbers start and after they finish.
        c.style.setProperty('--depth', (((vh * 0.5) - (r.top + r.height * 0.5)) / vh).toFixed(3));
        c.style.setProperty('--vel', vel.toFixed(3));
      }
    }

    // Scroll speed feeds a few pixels of lag into the card's inner layer, which
    // is most of what makes a surface read as having mass. It has to decay under
    // its own power: scroll events stop the instant the finger does, so without
    // this the last velocity would stay frozen into the layout.
    function settle() {
      vel *= 0.86;
      if (Math.abs(vel) < 0.004) { vel = 0; settling = false; paint(); return; }
      paint();
      requestAnimationFrame(settle);
    }

    var runScrub = function () {
      var y = window.pageYOffset;
      vel = Math.max(-1, Math.min(1, (y - lastY) / 34));
      lastY = y;
      if (scrubTicking) return;
      scrubTicking = true;
      requestAnimationFrame(function () {
        paint();
        scrubTicking = false;
        if (!settling && vel !== 0) { settling = true; requestAnimationFrame(settle); }
      });
    };
    window.addEventListener('scroll', runScrub, { passive: true });
    window.addEventListener('resize', runScrub, { passive: true });

    // A tab that loads in the background never runs an animation frame, so the
    // ticking flag — set before requestAnimationFrame and cleared inside it —
    // stays set, and every later scroll returns early. The scrub would then be
    // dead for the rest of that page's life, long after the tab is looked at.
    // Opening the site in a new background tab, or restoring a session, is
    // enough to land on a page whose cards never move.
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) return;
      scrubTicking = false;
      lastY = window.pageYOffset;   // don't count the hidden interval as velocity
      runScrub();
    });

    runScrub();
  }

  /* ---- Button ripple, as the original site had ---- */
  document.querySelectorAll('.btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      if (reduced) return;
      var r = btn.getBoundingClientRect();
      var size = Math.max(r.width, r.height);
      var d = document.createElement('span');
      d.className = 'ripple';
      d.style.width = d.style.height = size + 'px';
      d.style.left = (e.clientX - r.left - size / 2) + 'px';
      d.style.top = (e.clientY - r.top - size / 2) + 'px';
      btn.appendChild(d);
      setTimeout(function () { d.remove(); }, 600);
    });
  });
})();

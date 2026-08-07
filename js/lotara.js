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

  function applyScrub(card, p) {
    // The chart draws first — it is the thing the card is about.
    var draw = stage(p, 0.00, 0.62);
    var ln = card.querySelector('.p-chart .ln');
    if (ln) ln.style.strokeDashoffset = (+ln.dataset.len) * (1 - draw);

    var area = card.querySelector('.p-chart .ar');
    if (area) area.style.opacity = draw;

    // Rings, bar and counters deliberately share one window, so a dial and the
    // number inside it — or the sleep bar and the duration next to it — cannot
    // drift apart. Staging is for parts that mean different things, not for
    // two readings of the same value.
    var val = stage(p, 0.05, 0.68);

    card.querySelectorAll('.p-rings .arc').forEach(function (arc) {
      var pf = parseFloat(getComputedStyle(arc.parentNode.parentNode).getPropertyValue('--pf')) || 0;
      arc.style.strokeDashoffset = 276.5 * (1 - pf * val);
    });

    var bar = card.querySelector('.sl-bar i');
    if (bar) bar.style.width = (28 * val) + '%';

    card.querySelectorAll('[data-count]').forEach(function (el) {
      var target = parseFloat(el.dataset.count);
      if (isNaN(target)) return;
      el.textContent = Math.round(target * val) + (el.dataset.countSuffix || '');
    });

    // Chips land last and one after another, once the data has resolved.
    card.querySelectorAll('.p-chips .chip').forEach(function (chip, i) {
      var cp = stage(p, 0.55 + i * 0.07, 0.85 + i * 0.07);
      chip.style.opacity = cp;
      chip.style.transform = 'translateY(' + (10 * (1 - cp)) + 'px)';
    });

    // The light sweep across the card used to be a 1.5s keyframe on a 0.35s
    // delay, fired on reveal. That is exactly the motion that arrives ahead of
    // the reader — it had already finished by the time a slow scroll brought
    // the card up. Tied to progress, the surface catches the light at the pace
    // the reader sets, and holds if they stop.
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

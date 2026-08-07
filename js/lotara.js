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
     the digit and the bar can never drift apart.                     */
  var SCRUB_START = 0.92;   // card top at 92% of viewport height -> progress 0
  var SCRUB_END   = 0.34;   // ...and at 34% -> progress 1

  function scrubProgress(el) {
    var vh = window.innerHeight;
    var top = el.getBoundingClientRect().top;
    var from = vh * SCRUB_START, to = vh * SCRUB_END;
    return Math.max(0, Math.min(1, (from - top) / (from - to)));
  }

  // easeOutCubic: keeps the tail of the scroll from feeling like it stalls.
  function ease(t) { return 1 - Math.pow(1 - t, 3); }

  var scrubCards = Array.prototype.slice.call(document.querySelectorAll('.post'));

  // Measure each chart path once — the CSS can't know its length, and guessing
  // it means part of the draw happens with nothing visible on screen.
  document.querySelectorAll('.p-chart .ln').forEach(function (ln) {
    var len = Math.ceil(ln.getTotalLength());
    ln.dataset.len = len;
    ln.style.strokeDasharray = len;
  });

  function applyScrub(card, p) {
    var e = ease(p);

    var ln = card.querySelector('.p-chart .ln');
    if (ln) ln.style.strokeDashoffset = (+ln.dataset.len) * (1 - e);

    var area = card.querySelector('.p-chart .ar');
    if (area) area.style.opacity = e;

    card.querySelectorAll('.p-rings .arc').forEach(function (arc) {
      var pf = parseFloat(getComputedStyle(arc.parentNode.parentNode).getPropertyValue('--pf')) || 0;
      arc.style.strokeDashoffset = 276.5 * (1 - pf * e);
    });

    var bar = card.querySelector('.sl-bar i');
    if (bar) bar.style.width = (28 * e) + '%';

    card.querySelectorAll('[data-count]').forEach(function (el) {
      var target = parseFloat(el.dataset.count);
      if (isNaN(target)) return;
      el.textContent = Math.round(target * e) + (el.dataset.countSuffix || '');
    });

    // Chips arrive across the middle of the scrub rather than all at once.
    card.querySelectorAll('.p-chips .chip').forEach(function (chip, i) {
      var start = 0.25 + i * 0.12;
      var cp = Math.max(0, Math.min(1, (p - start) / 0.28));
      chip.style.opacity = cp;
      chip.style.transform = 'translateY(' + (10 * (1 - cp)) + 'px)';
    });
  }

  if (!reduced && scrubCards.length) {
    // Hand these to the scrub — the CSS transitions would fight it, lagging a
    // frame behind every scroll event.
    document.documentElement.classList.add('scrub');

    var scrubTicking = false;
    var runScrub = function () {
      if (scrubTicking) return;
      scrubTicking = true;
      requestAnimationFrame(function () {
        for (var i = 0; i < scrubCards.length; i++) {
          var c = scrubCards[i], r = c.getBoundingClientRect();
          if (r.bottom < -200 || r.top > window.innerHeight + 200) continue;  // off screen
          applyScrub(c, scrubProgress(c));
        }
        scrubTicking = false;
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

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

  /* ---- Chart line: dash the path to its real length ----------
     The stroke-dash trick only draws while the offset is between the path
     length and 0. The CSS guessed 1400; the actual path is ~527, so the first
     62% of the animation moved the offset from 1400 down to 527 with nothing
     visible on screen at all — a blank chart for over a second, then a rushed
     draw. It read as broken rather than as an animation.

     Measuring the path makes the whole duration visible drawing. Done here
     because only the browser knows the length, and it changes if the data does. */
  document.querySelectorAll('.p-chart .ln').forEach(function (ln) {
    var len = Math.ceil(ln.getTotalLength());
    ln.style.strokeDasharray = len;
    if (!ln.closest('.reveal.in')) ln.style.strokeDashoffset = len;
    // Once the card reveals, CSS drives it to 0; make sure our inline value
    // doesn't pin it there.
    var post = ln.closest('.post');
    if (post) {
      new MutationObserver(function (m, obs) {
        if (post.classList.contains('in')) { ln.style.strokeDashoffset = '0'; obs.disconnect(); }
      }).observe(post, { attributes: true, attributeFilter: ['class'] });
    }
  });

  /* ---- Count-up numbers -------------------------------------
     The two posts people actually stop on lead with a number, and a number
     that lands already-final reads as a picture. Counting it up is the
     Fitness-rings trick: the eye follows a value in motion.

     Driven by the same reveal pass, so a card counts when it arrives rather
     than while it's still off screen. Uses easeOutExpo — fast out of the gate,
     long settle — which is what makes Apple's counters feel weighted instead
     of linear.

     The element's existing text IS the final value, so with JS off or reduced
     motion on, the correct number is simply already there.            */
  var countables = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));

  function runCount(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';

    var target = parseFloat(el.dataset.count);
    if (isNaN(target)) return;
    var suffix = el.dataset.countSuffix || '';
    var duration = parseInt(el.dataset.countMs || '1400', 10);
    var delay = parseInt(el.dataset.countDelay || '0', 10);
    var started = null;

    function frame(now) {
      if (started === null) started = now;
      var t = Math.min(1, (now - started) / duration);
      var eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);   // easeOutExpo
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = target + suffix;
    }
    if (delay) setTimeout(function () { requestAnimationFrame(frame); }, delay);
    else requestAnimationFrame(frame);
  }

  /* Set the true value with no animation. The last-resort path: a number the
     visitor never scrolled to should still be correct if they jump there via
     find-in-page or a deep link. */
  function settleCount(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    el.textContent = el.dataset.count + (el.dataset.countSuffix || '');
  }

  if (!reduced && countables.length) {
    // Only blank once we know we can animate — otherwise the real value stays.
    countables.forEach(function (el) { el.textContent = '0' + (el.dataset.countSuffix || ''); });

    var inView = function (el) {
      var r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.78 && r.bottom > 0;
    };

    if ('IntersectionObserver' in window) {
      var countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { runCount(e.target); countObserver.unobserve(e.target); }
        });
      }, { threshold: 0.25, rootMargin: '0px 0px -22% 0px' });
      countables.forEach(function (el) { countObserver.observe(el); });
    }

    // Backup for a dead observer — counts on scroll, but still only what is
    // actually on screen. The previous version used a blind 3s timer, which
    // ran every counter while the visitor was still at the top of the page:
    // by the time they scrolled down the numbers had already finished, so the
    // animation was real but nobody ever saw it.
    var countTicking = false;
    var countSweep = function () {
      if (countTicking) return;
      countTicking = true;
      requestAnimationFrame(function () {
        countables.forEach(function (el) { if (inView(el)) runCount(el); });
        countTicking = false;
      });
    };
    window.addEventListener('scroll', countSweep, { passive: true });
    window.addEventListener('resize', countSweep, { passive: true });
    countSweep();

    // Genuine last resort, long after any real visitor has scrolled: fill in
    // the value without animating, so nothing can be stranded showing 0.
    setTimeout(function () { countables.forEach(settleCount); }, 30000);
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

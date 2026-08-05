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
        if (r.top < h - 60 && r.bottom > 0) show(el);
      }
    };

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
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

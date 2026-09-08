// Theme toggle, scroll spy, reveal-on-scroll. No dependencies.

(function () {
  'use strict';

  var root = document.documentElement;

  // ---- theme ----
  function systemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark';
  }

  function currentTheme() {
    return root.getAttribute('data-theme') || systemTheme();
  }

  var toggle = document.getElementById('theme');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try {
        localStorage.setItem('theme', next);
      } catch (e) {
        /* private mode, blocked storage: the toggle still works for this visit */
      }
    });
  }

  // ---- scroll spy ----
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  var sections = links
    .map(function (a) {
      return document.querySelector(a.getAttribute('href'));
    })
    .filter(Boolean);

  function markCurrent() {
    var line = window.scrollY + 140;
    var active = -1;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= line) active = i;
    }
    links.forEach(function (a, i) {
      a.classList.toggle('current', i === active);
    });
  }

  var ticking = false;
  window.addEventListener(
    'scroll',
    function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        markCurrent();
        ticking = false;
      });
    },
    { passive: true }
  );
  markCurrent();

  // ---- reveal on scroll ----
  var targets = document.querySelectorAll('.project, .timeline > li, .skill-group, .stats');

  if (!('IntersectionObserver' in window)) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('shown');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
  );

  Array.prototype.forEach.call(targets, function (el) {
    el.classList.add('reveal');
    observer.observe(el);
  });
})();

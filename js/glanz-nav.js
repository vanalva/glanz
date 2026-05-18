/* ── glanz-nav.js — shared sticky nav + search behaviour ── */
(function() {
  var SCROLL_THRESHOLD = 24;
  var COLLAPSE_THRESHOLD = Math.round(window.innerHeight * 0.25);

  var search = document.querySelector('[data-sticky-trigger]');
  var collapsables = [];

  if (search) {
    var placeholder = document.createElement('div');
    placeholder.className = 'glanz_landing_search_placeholder';
    placeholder.setAttribute('aria-hidden', 'true');
    search.parentNode.insertBefore(placeholder, search);
    placeholder.style.height = search.offsetHeight + 'px';

    collapsables = search.querySelectorAll('.is-collapsable');

    var expandBtn = search.querySelector('[data-expand-trigger]');
    var expandIcon = expandBtn && expandBtn.querySelector('.glanz_landing_search_expand_icon');
    if (expandBtn) {
      expandBtn.addEventListener('click', function() {
        var expanded = search.classList.toggle('is-expanded');
        if (expandIcon) expandIcon.textContent = expanded ? '⊗' : '⊕';
        collapsables.forEach(function(el) {
          el.classList.toggle('is-hidden', !expanded);
        });
      });
    }
  }

  var nav = document.querySelector('[data-nav-trigger]');

  function update() {
    var stuck = window.pageYOffset > SCROLL_THRESHOLD;
    if (search) {
      search.classList.toggle('is-stuck', stuck);
      if (!stuck) {
        search.classList.remove('is-expanded');
        if (expandIcon) expandIcon.textContent = '⊕';
      }
      var expanded = search.classList.contains('is-expanded');
      collapsables.forEach(function(el) {
        el.classList.toggle('is-hidden', stuck && !expanded);
      });
    }
    if (nav) {
      nav.classList.toggle('is-stuck', stuck);
      nav.classList.toggle('is-collapsed', stuck && window.pageYOffset > COLLAPSE_THRESHOLD);
    }
  }

  var ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() { update(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', function() {
    COLLAPSE_THRESHOLD = Math.round(window.innerHeight * 0.25);
  }, { passive: true });

  update();
})();

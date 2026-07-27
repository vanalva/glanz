/* ── glanz-nav.js — shared sticky nav + search behaviour ── */
(function() {
  var SCROLL_THRESHOLD = 24;
  var COLLAPSE_THRESHOLD = Math.round(window.innerHeight * 0.25);
  var mobileMQ = window.matchMedia('(max-width: 991px)');

  function isMobile() { return mobileMQ.matches; }

  /* ── Sticky search dock ─────────────────────────────── */
  var search = document.querySelector('[data-sticky-trigger]');
  var placeholder = null;
  var collapsables = [];
  var expandBtn = null;
  var expandIcon = null;
  var staticHeight = 0;

  if (search) {
    placeholder = document.createElement('div');
    placeholder.className = 'glanz_landing_search_placeholder';
    placeholder.setAttribute('aria-hidden', 'true');
    search.parentNode.insertBefore(placeholder, search);

    collapsables = search.querySelectorAll('.is-collapsable');

    expandBtn = search.querySelector('[data-expand-trigger]');
    expandIcon = expandBtn && expandBtn.querySelector('.glanz_landing_search_expand_icon');
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

  /* Cache the dock's natural (in-flow / unstuck) height. Used to reserve the
     placeholder while the dock is detached and to know when the in-flow dock
     has scrolled fully off the top on mobile. */
  function measureStatic() {
    if (search && !search.classList.contains('is-stuck')) {
      staticHeight = search.offsetHeight;
    }
  }

  /* ── Header / nav ───────────────────────────────────── */
  var header = document.querySelector('[data-nav-trigger]');
  var burger = header && header.querySelector('.glanz_landing_nav_burger');
  var navLinks = header && header.querySelector('.glanz_landing_nav_links');
  var themedSections = document.querySelectorAll('.u-theme-dark, .u-theme-brand');
  var themedBounds = [];

  function measureThemeBounds() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    var i;
    themedBounds = [];
    for (i = 0; i < themedSections.length; i += 1) {
      var rect = themedSections[i].getBoundingClientRect();
      themedBounds.push({
        top: rect.top + scrollY,
        bottom: rect.bottom + scrollY
      });
    }
  }

  function updateNavTone(scrollY) {
    if (!header) return;
    var isDark = header.classList.contains('is-menu-open');
    var i;
    if (!isDark) {
      var headerRect = header.getBoundingClientRect();
      var probeY = scrollY + headerRect.top + (header.offsetHeight / 2);
      for (i = 0; i < themedBounds.length; i += 1) {
        if (probeY >= themedBounds[i].top && probeY < themedBounds[i].bottom) {
          isDark = true;
          break;
        }
      }
    }
    if (isDark) header.setAttribute('data-nav-tone', 'dark');
    else header.removeAttribute('data-nav-tone');
  }

  /* ── Fullscreen menu overlay (built once from cloned nav links) ── */
  var menu = null;

  function openMenu() {
    if (!menu) return;
    menu.classList.add('is-open');
    menu.removeAttribute('inert');
    menu.setAttribute('aria-hidden', 'false');
    if (burger) burger.setAttribute('aria-expanded', 'true');
    if (header) header.classList.add('is-menu-open');
    updateNavTone(window.pageYOffset || document.documentElement.scrollTop || 0);
    document.documentElement.classList.add('glanz_menu_open');
  }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('is-open');
    menu.setAttribute('inert', '');
    menu.setAttribute('aria-hidden', 'true');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    if (header) header.classList.remove('is-menu-open');
    updateNavTone(window.pageYOffset || document.documentElement.scrollTop || 0);
    document.documentElement.classList.remove('glanz_menu_open');
  }
  function toggleMenu() {
    if (!menu) return;
    if (menu.classList.contains('is-open')) closeMenu(); else openMenu();
  }
  function buildMenu() {
    if (!header || !burger || !navLinks) return;
    menu = document.createElement('div');
    menu.className = 'glanz_menu u-theme-dark';
    menu.setAttribute('aria-hidden', 'true');
    menu.setAttribute('inert', '');

    var inner = document.createElement('nav');
    inner.className = 'glanz_menu_inner';
    inner.setAttribute('aria-label', 'Menú principal');

    var eyebrow = document.createElement('span');
    eyebrow.className = 'glanz_menu_eyebrow';
    eyebrow.textContent = 'Menú';
    inner.appendChild(eyebrow);

    var links = navLinks.querySelectorAll('a');
    Array.prototype.forEach.call(links, function(link) {
      var a = document.createElement('a');
      a.className = 'glanz_menu_link';
      a.setAttribute('href', link.getAttribute('href'));
      a.textContent = link.textContent;
      a.addEventListener('click', closeMenu);
      inner.appendChild(a);
    });

    menu.appendChild(inner);
    document.body.appendChild(menu);
  }

  if (burger) {
    burger.setAttribute('aria-expanded', 'false');
    buildMenu();
    burger.addEventListener('click', function(e) {
      e.preventDefault();
      toggleMenu();
    });
    document.addEventListener('keydown', function(e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && menu && menu.classList.contains('is-open')) {
        closeMenu();
      }
    });
  }

  /* ── Hero image thumbs ──────────────────────────────── */
  (function() {
    var thumbs = document.querySelectorAll('.glanz_landing_thumb');
    var mainImg = document.querySelector('.glanz_landing_image');
    if (!thumbs.length || !mainImg) return;

    var tickerLeft = document.querySelector('.glanz_landing_ticker_left');
    var thumbsCount = document.querySelector('.glanz_landing_thumbs_count');
    var total = thumbs.length;

    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function setCount(i) {
      var txt = pad(i + 1) + ' / ' + pad(total);
      if (tickerLeft) tickerLeft.textContent = txt;
      if (thumbsCount) thumbsCount.textContent = txt;
    }

    Array.prototype.forEach.call(thumbs, function(thumb, i) {
      thumb.addEventListener('click', function() {
        var img = thumb.querySelector('.glanz_landing_thumb_img');
        if (img) mainImg.setAttribute('src', img.getAttribute('src'));
        Array.prototype.forEach.call(thumbs, function(t) { t.classList.remove('is-active'); });
        thumb.classList.add('is-active');
        setCount(i);
      });
    });

    /* Sync the counters to the real thumb count on load. */
    var activeIndex = 0;
    Array.prototype.forEach.call(thumbs, function(t, i) {
      if (t.classList.contains('is-active')) activeIndex = i;
    });
    setCount(activeIndex);
  })();

  /* ── Scroll state machine ───────────────────────────── */
  function update() {
    var y = window.pageYOffset;
    var navStuck = y > SCROLL_THRESHOLD;
    var mobile = isMobile();

    if (search) {
      var dockStuck;
      if (mobile) {
        /* Detach to the compact bottom bar only once the in-flow dock has
           scrolled fully above the top edge (no double search bars). */
        var natBottom = placeholder.getBoundingClientRect().top + staticHeight;
        dockStuck = natBottom < 0;
      } else {
        dockStuck = navStuck;
      }

      search.classList.toggle('is-stuck', dockStuck);
      if (!dockStuck) {
        search.classList.remove('is-expanded');
        if (expandIcon) expandIcon.textContent = '⊕';
      }
      var expanded = search.classList.contains('is-expanded');
      collapsables.forEach(function(el) {
        el.classList.toggle('is-hidden', dockStuck && !expanded);
      });

      /* Placeholder: desktop reserves the dock height always (dock is always
         fixed); mobile reserves it only while stuck, 0 while in flow. */
      if (placeholder) {
        placeholder.style.height = mobile
          ? (dockStuck ? staticHeight + 'px' : '0px')
          : staticHeight + 'px';
      }
    }

    if (header) {
      header.classList.toggle('is-stuck', navStuck);
      /* The collapse/hover-expand affordance is desktop-only. */
      header.classList.toggle('is-collapsed', !mobile && navStuck && y > COLLAPSE_THRESHOLD);
      updateNavTone(y);
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
    measureStatic();
    measureThemeBounds();
    update();
  }, { passive: true });

  measureStatic();
  measureThemeBounds();
  update();
})();

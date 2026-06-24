/* OurSight — marketing site interactions.
   Vanilla, dependency-free, accessible, reduced-motion aware.
   Decoupled from styling via data-* hooks so markup can evolve freely. */
(() => {
  'use strict';
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Footer year ---------- */
  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  /* ---------- Sticky header state ---------- */
  const header = $('[data-header]');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile nav ---------- */
  const navToggle = $('[data-nav-toggle]');
  const nav = $('[data-nav]');
  const setNav = (open) => {
    if (!nav || !navToggle) return;
    document.documentElement.classList.toggle('nav-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    nav.setAttribute('aria-hidden', String(!open));
  };
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      setNav(navToggle.getAttribute('aria-expanded') !== 'true');
    });
    $$('a', nav).forEach((a) => a.addEventListener('click', () => setNav(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });
    // reset on resize up to desktop
    window.matchMedia('(min-width: 880px)').addEventListener('change', (m) => { if (m.matches) setNav(false); });
    // initialize closed state on mobile so the off-canvas links start aria-hidden
    if (window.matchMedia('(max-width: 880px)').matches) setNav(false);
  }

  /* ---------- Smooth in-page anchor scroll (header-offset aware) ---------- */
  const headerH = () => (header ? header.offsetHeight : 0) + 12;
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.getElementById(id.slice(1));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - headerH();
      window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = $$('[data-reveal]');
  if (revealEls.length) {
    if (prefersReduced || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('is-in'));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            const d = en.target.getAttribute('data-reveal-delay');
            if (d) en.target.style.transitionDelay = d + 'ms';
            en.target.classList.add('is-in');
            io.unobserve(en.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
      revealEls.forEach((el) => io.observe(el));
    }
  }

  /* ---------- Count-up stats ---------- */
  const countEls = $$('[data-countup]');
  if (countEls.length && !prefersReduced && 'IntersectionObserver' in window) {
    const fmt = (n, dec) => n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const end = parseFloat(el.getAttribute('data-countup'));
        const dec = (String(end).split('.')[1] || '').length;
        const pre = el.getAttribute('data-prefix') || '';
        const suf = el.getAttribute('data-suffix') || '';
        const dur = 1100; let start = null;
        const step = (t) => {
          if (start === null) start = t;
          const p = Math.min((t - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = pre + fmt(end * eased, dec) + suf;
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = pre + fmt(end, dec) + suf;
        };
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: 0.6 });
    countEls.forEach((el) => io.observe(el));
  }

  /* ---------- Tabs ([data-tabs] > [role=tablist] > [role=tab][aria-controls]) ---------- */
  $$('[data-tabs]').forEach((group) => {
    const tabs = $$('[role="tab"]', group);
    const select = (tab) => {
      tabs.forEach((t) => {
        const sel = t === tab;
        t.setAttribute('aria-selected', String(sel));
        t.tabIndex = sel ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !sel;
      });
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (e) => {
        let n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (n) { e.preventDefault(); n.focus(); select(n); }
      });
    });
    if (tabs.length && !tabs.some((t) => t.getAttribute('aria-selected') === 'true')) select(tabs[0]);
  });

  /* ---------- Accordion (FAQ) ---------- */
  $$('[data-accordion-trigger]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('[data-accordion-item]');
      const panel = item && $('[data-accordion-panel]', item);
      const open = btn.getAttribute('aria-expanded') === 'true';
      const group = btn.closest('[data-accordion]');
      if (group && group.hasAttribute('data-accordion-single') && !open) {
        $$('[data-accordion-trigger]', group).forEach((other) => {
          if (other !== btn) {
            other.setAttribute('aria-expanded', 'false');
            const p = other.closest('[data-accordion-item]') && $('[data-accordion-panel]', other.closest('[data-accordion-item]'));
            if (p) p.hidden = true; // remove from layout AND the a11y tree
          }
        });
      }
      btn.setAttribute('aria-expanded', String(!open));
      if (panel) panel.hidden = open; // open===true means we're now collapsing
    });
  });

  /* ---------- Scrollspy (active nav link) ---------- */
  const spyLinks = $$('[data-spy] a[href^="#"]');
  if (spyLinks.length && 'IntersectionObserver' in window) {
    const map = new Map();
    spyLinks.forEach((a) => {
      const t = document.getElementById(a.getAttribute('href').slice(1));
      if (t) map.set(t, a);
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const a = map.get(en.target);
        if (a && en.isIntersecting) {
          spyLinks.forEach((l) => l.classList.remove('is-active'));
          a.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, t) => io.observe(t));
  }

  /* ---------- Waitlist / early-access form ---------- */
  $$('[data-waitlist-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      const endpoint = form.getAttribute('action');
      // If no real endpoint is wired yet, handle gracefully client-side.
      if (!endpoint || endpoint === '#') {
        e.preventDefault();
        const email = $('input[type="email"]', form);
        const msg = $('[data-form-msg]', form);
        if (email && !email.checkValidity()) {
          email.setAttribute('aria-invalid', 'true');
          if (msg) { if (msg.id) email.setAttribute('aria-describedby', msg.id); msg.textContent = 'Enter a valid email, like you@yourprogram.org'; }
          email.reportValidity();
          email.addEventListener('input', () => { email.removeAttribute('aria-invalid'); if (msg) msg.textContent = ''; }, { once: true });
          return;
        }
        form.classList.add('is-sent');
        if (msg) msg.textContent = "You're on the list — we'll be in touch as founding programs come online.";
        form.querySelectorAll('input, button').forEach((el) => { el.disabled = true; });
      }
      // else: let it submit to the configured endpoint (e.g. Formspree / Worker).
    });
  });

  /* ---------- Background video loops ---------- */
  const bgVideos = $$('video[data-bg-video]');
  if (bgVideos.length) {
    bgVideos.forEach((v) => {
      if (prefersReduced) {
        // honor reduced-motion: never autoplay; the poster image stays shown
        v.removeAttribute('autoplay');
        v.pause();
        return;
      }
      const tryPlay = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((en) => { if (en.isIntersecting) tryPlay(); else v.pause(); });
        }, { threshold: 0.1 });
        io.observe(v);
      } else {
        tryPlay();
      }
    });
  }
})();

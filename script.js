/* ==========================================================================
   Varsha Shrivastav — Portfolio Script
   Loaded after resume-data.js (which defines RESUME_BASE64).
   Sections: Resume link > Loader > Theme toggle > Scroll progress & nav >
             Mobile menu > Reveal-on-scroll (+ staggered grids) > Skill bars >
             Typing effect > Cursor glow > Tilt on project cards > Ripple >
             Copy email > Back-to-top (with progress ring)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Resume download links ---------- */
  const resumeHref = "data:application/pdf;base64," + RESUME_BASE64;
  ['downloadBtn', 'downloadBtn2', 'downloadBtn3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.href = resumeHref;
  });

  /* ---------- Page loader ---------- */
  const loader = document.getElementById('pageLoader');
  const hideLoader = () => {
    if (!loader) return;
    loader.classList.add('hide');
    setTimeout(() => loader.remove(), 600);
  };
  window.addEventListener('load', () => setTimeout(hideLoader, 300));
  // Safety net in case 'load' fires before listener attaches
  setTimeout(hideLoader, 2500);

  /* ---------- Theme toggle (light / dark, persisted) ---------- */
  const root = document.documentElement;
  const THEME_KEY = 'varsha-portfolio-theme';
  const applyTheme = (theme) => {
    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    document.querySelectorAll('.theme-toggle .knob').forEach(k => {
      k.textContent = theme === 'dark' ? '🌙' : '☀️';
    });
  };
  let savedTheme = null;
  try { savedTheme = localStorage.getItem(THEME_KEY); } catch (e) { /* storage unavailable */ }
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme('light'); // Forced light theme as requested

  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
    });
  });

  /* ---------- Scroll progress bar + header shadow + back-to-top visibility ---------- */
  const progressBar = document.getElementById('progress');
  const headerEl = document.querySelector('header');
  const backTop = document.getElementById('backTop');
  const ringFg = document.querySelector('.back-top .ring .fg');
  const RING_CIRC = ringFg ? 2 * Math.PI * ringFg.r.baseVal.value : 0;
  if (ringFg) ringFg.style.strokeDasharray = `${RING_CIRC} ${RING_CIRC}`;

  const onScroll = () => {
    const h = document.documentElement;
    const scrollable = h.scrollHeight - h.clientHeight;
    const scrolled = scrollable > 0 ? (h.scrollTop / scrollable) * 100 : 0;
    if (progressBar) progressBar.style.width = scrolled + '%';
    if (headerEl) headerEl.classList.toggle('scrolled', h.scrollTop > 8);
    if (backTop) backTop.classList.toggle('show', h.scrollTop > 600);
    if (ringFg && RING_CIRC) {
      ringFg.style.strokeDashoffset = RING_CIRC - (scrolled / 100) * RING_CIRC;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  const scrim = document.getElementById('scrim');
  const openMenu = () => { mobileMenu.classList.add('open'); scrim.classList.add('show'); burger.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const closeMenu = () => { mobileMenu.classList.remove('open'); scrim.classList.remove('show'); burger.classList.remove('open'); document.body.style.overflow = ''; };
  if (burger) burger.addEventListener('click', openMenu);
  const mobileClose = document.getElementById('mobileClose');
  if (mobileClose) mobileClose.addEventListener('click', closeMenu);
  if (scrim) scrim.addEventListener('click', closeMenu);
  document.querySelectorAll('#mobileNav a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Active nav link on scroll ---------- */
  const sections = document.querySelectorAll('main section');
  const navLinksDesktop = document.querySelectorAll('#desktopNav a');
  const setActive = (id) => {
    navLinksDesktop.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
  };
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
  sections.forEach(s => navObserver.observe(s));

  /* ---------- Reveal-on-scroll (sections + staggered grids) ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));
  // Grids get their own 'in' class so nth-child stagger delays kick in
  document.querySelectorAll('.skills-grid, .project-grid, .ach-list, .contact-grid').forEach(el => revealObserver.observe(el));

  /* ---------- Animated skill bars ---------- */
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.dataset.w + '%';
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.skill-bar-fill').forEach(el => skillObserver.observe(el));

  /* ---------- Typing effect on hero role ---------- */
  const heroRole = document.querySelector('.hero-role');
  if (heroRole && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const phrases = [
      'PHP, MySQL & React',
      'clean, maintainable code',
      'full-stack web apps',
      'real production systems'
    ];
    const prefix = "Full Stack Developer building with ";
    heroRole.innerHTML = `${prefix}<b id="typedWord"></b><span class="cursor-blink">&nbsp;</span>`;
    const typedEl = document.getElementById('typedWord');
    let phraseIdx = 0, charIdx = 0, deleting = false;
    const TYPE_SPEED = 55, DELETE_SPEED = 30, HOLD = 1500, GAP = 400;
    const tick = () => {
      const current = phrases[phraseIdx];
      if (!deleting) {
        charIdx++;
        typedEl.textContent = current.slice(0, charIdx);
        if (charIdx === current.length) {
          deleting = true;
          setTimeout(tick, HOLD);
          return;
        }
        setTimeout(tick, TYPE_SPEED);
      } else {
        charIdx--;
        typedEl.textContent = current.slice(0, charIdx);
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          setTimeout(tick, GAP);
          return;
        }
        setTimeout(tick, DELETE_SPEED);
      }
    };
    setTimeout(tick, 900);
  }

  /* ---------- Cursor glow (desktop, hover-capable only) ---------- */
  if (window.matchMedia('(hover: hover)').matches) {
    const glow = document.getElementById('cursorGlow');
    if (glow) {
      let raf = null, mx = 0, my = 0;
      window.addEventListener('mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        glow.classList.add('active');
        if (!raf) {
          raf = requestAnimationFrame(() => {
            glow.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
            raf = null;
          });
        }
      });
      document.addEventListener('mouseleave', () => glow.classList.remove('active'));
    }

    /* ---------- 3D tilt effect on project cards ---------- */
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ---------- Button ripple effect ---------- */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  /* ---------- Copy email to clipboard ---------- */
  const copyCard = document.getElementById('copyEmail');
  const copyToast = document.getElementById('copyToast');
  if (copyCard) {
    copyCard.addEventListener('click', () => {
      const email = 'varshaweb081@gmail.com';
      const showToast = () => {
        if (!copyToast) return;
        copyToast.classList.add('show');
        setTimeout(() => copyToast.classList.remove('show'), 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(showToast).catch(showToast);
      } else {
        // Fallback for browsers without Clipboard API
        const ta = document.createElement('textarea');
        ta.value = email;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) { /* ignore */ }
        document.body.removeChild(ta);
        showToast();
      }
    });
  }

  /* ---------- Back to top ---------- */
  if (backTop) {
    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

});

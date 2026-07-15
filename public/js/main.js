(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const navbar = $('#navbar');
  const mobileCta = $('#mobileCta');
  const backTop = $('#backTop');

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    if (!navbar) return;
    if (y > 60) {
      navbar.classList.add('bg-ink-950/90', 'nav-blur', 'border-b', 'border-white/5');
    } else {
      navbar.classList.remove('bg-ink-950/90', 'nav-blur', 'border-b', 'border-white/5');
    }
    if (mobileCta) {
      if (y > 500) mobileCta.classList.add('show');
      else mobileCta.classList.remove('show');
    }
    if (backTop) {
      if (y > 800) backTop.classList.add('visible');
      else backTop.classList.remove('visible');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backTop) {
    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Mobile menu
  const menuBtn = $('#mobileMenuBtn');
  const mobileMenu = $('#mobileMenu');

  function setMenuOpen(open) {
    if (!menuBtn || !mobileMenu) return;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileMenu.classList.toggle('hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const open = menuBtn.getAttribute('aria-expanded') !== 'true';
      setMenuOpen(open);
    });
    $$('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', () => setMenuOpen(false));
    });
  }

  // Scroll reveal
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    $$('.reveal, .reveal-left, .reveal-right').forEach((el) => {
      const parent = el.closest('.grid, .space-y-3, ol, .masonry');
      if (parent) {
        const siblings = parent.querySelectorAll('.reveal, .reveal-left, .reveal-right');
        const idx = Array.from(siblings).indexOf(el);
        el.style.transitionDelay = `${Math.min(idx, 8) * 70}ms`;
      }
      observer.observe(el);
    });
  } else {
    $$('.reveal, .reveal-left, .reveal-right').forEach((el) => el.classList.add('active'));
  }

  // Portfolio filter
  const filterBtns = $$('.portfolio-filter');
  const portfolioItems = $$('.portfolio-item');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => {
        b.classList.remove('bg-gold-400/10', 'text-gold-400', 'border-gold-400/25', 'active');
        b.classList.add('text-ink-400', 'border-white/10');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('bg-gold-400/10', 'text-gold-400', 'border-gold-400/25', 'active');
      btn.classList.remove('text-ink-400', 'border-white/10');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;
      portfolioItems.forEach((item) => {
        const show = filter === 'all' || item.dataset.category === filter;
        if (show) {
          item.style.display = '';
          requestAnimationFrame(() => {
            item.style.opacity = '1';
            item.style.transform = 'none';
          });
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.97)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 250);
        }
      });
    });
  });

  // Lightbox
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightboxImg');
  const lightboxClose = $('#lightboxClose');
  let lastFocus = null;

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lastFocus = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.hidden = false;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox || !lightboxImg) return;
    lightbox.classList.remove('open');
    lightbox.hidden = true;
    lightboxImg.src = '';
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  $$('.lightbox-trigger').forEach((el) => {
    el.addEventListener('click', () => {
      openLightbox(
        el.dataset.src || el.querySelector('img')?.src,
        el.dataset.alt || el.querySelector('img')?.alt
      );
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  // FAQ
  $$('.faq-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const content = document.getElementById(btn.getAttribute('aria-controls'));
      const icon = btn.querySelector('.faq-icon');
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      $$('.faq-toggle').forEach((b) => {
        b.setAttribute('aria-expanded', 'false');
        const c = document.getElementById(b.getAttribute('aria-controls'));
        if (c) c.classList.remove('open');
        const i = b.querySelector('.faq-icon');
        if (i) i.style.transform = '';
      });

      if (!isOpen && content) {
        btn.setAttribute('aria-expanded', 'true');
        content.classList.add('open');
        if (icon) icon.style.transform = 'rotate(45deg)';
      }
    });
  });

  // Cookies
  const cookieBanner = $('#cookieBanner');
  function hideCookies(value) {
    if (!cookieBanner) return;
    cookieBanner.classList.remove('show');
    try {
      localStorage.setItem('bmi_cookie_consent', value);
    } catch (_) {}
  }
  if ($('#cookieAccept')) $('#cookieAccept').addEventListener('click', () => hideCookies('accepted'));
  if ($('#cookieDecline')) $('#cookieDecline').addEventListener('click', () => hideCookies('declined'));

  window.addEventListener('load', () => {
    try {
      if (!localStorage.getItem('bmi_cookie_consent') && cookieBanner) {
        setTimeout(() => cookieBanner.classList.add('show'), 1800);
      }
    } catch (_) {
      if (cookieBanner) setTimeout(() => cookieBanner.classList.add('show'), 1800);
    }
  });

  // Legal modals
  const legalModal = $('#legalModal');
  const legalTitle = $('#legalTitle');
  const legalBody = $('#legalBody');

  const legalCopy = {
    privacy: {
      title: 'Privacy Policy',
      body: `
        <p>Black Maple Ink ("we") respects your privacy. Information you submit through our booking and contact forms — name, email, phone, and project details — is used to schedule appointments, process deposits, and respond to inquiries.</p>
        <p>Payment card data is processed by Paystack; we do not store full card numbers. We do not sell personal data. Essential cookies may be stored to remember consent preferences.</p>
        <p>To request access, correction, or deletion of your data, email <a href="mailto:hello@blackmapleink.ca" class="text-gold-400">hello@blackmapleink.ca</a>. Governed by applicable privacy law including PIPEDA.</p>
      `,
    },
    terms: {
      title: 'Terms of Service',
      body: `
        <p>By booking with Black Maple Ink, you agree to our deposit, cancellation, and studio policies. A non-refundable deposit is required to secure appointments and is applied to the final balance. Payment is completed online via Paystack before your visit.</p>
        <p>Clients must be 18+ for tattoos (government ID required). Minors for piercing require parental consent as required by local law. We reserve the right to refuse service for safety or hygiene reasons.</p>
        <p>Reschedule with at least 48 hours notice to transfer your deposit. Artwork remains artist IP for portfolio use unless otherwise agreed. © Black Maple Ink.</p>
      `,
    },
  };

  function openLegal(key) {
    if (!legalModal) return;
    const data = legalCopy[key];
    if (!data) return;
    legalTitle.textContent = data.title;
    legalBody.innerHTML = data.body;
    legalModal.hidden = false;
    legalModal.classList.remove('hidden');
    legalModal.classList.add('flex');
    document.body.style.overflow = 'hidden';
    $('#legalClose')?.focus();
  }

  function closeLegal() {
    if (!legalModal) return;
    legalModal.hidden = true;
    legalModal.classList.add('hidden');
    legalModal.classList.remove('flex');
    document.body.style.overflow = '';
  }

  if ($('#privacyBtn')) $('#privacyBtn').addEventListener('click', () => openLegal('privacy'));
  if ($('#termsBtn')) $('#termsBtn').addEventListener('click', () => openLegal('terms'));
  if ($('#cookiePrivacy')) $('#cookiePrivacy').addEventListener('click', () => openLegal('privacy'));
  if ($('#legalClose')) $('#legalClose').addEventListener('click', closeLegal);
  if ($('#legalBackdrop')) $('#legalBackdrop').addEventListener('click', closeLegal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lightbox && lightbox.classList.contains('open')) closeLightbox();
      if (legalModal && !legalModal.hidden) closeLegal();
      if (menuBtn && menuBtn.getAttribute('aria-expanded') === 'true') setMenuOpen(false);
    }
  });

  // Contact form (if present)
  const contactForm = $('#contactForm');
  if (contactForm && window.BMI_API) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errEl = $('#contactError');
      const okEl = $('#contactSuccess');
      const btn = $('#contactSubmit');
      if (errEl) {
        errEl.classList.add('hidden');
        errEl.textContent = '';
      }
      const payload = {
        fullName: $('#contactName')?.value.trim(),
        email: $('#contactEmail')?.value.trim(),
        phone: $('#contactPhone')?.value.trim(),
        subject: $('#contactSubject')?.value.trim(),
        message: $('#contactMessage')?.value.trim(),
        siteSlug: $('#contactSite')?.value || undefined,
      };
      if (!payload.fullName || !payload.email || !payload.message) {
        if (errEl) {
          errEl.textContent = 'Please complete all required fields.';
          errEl.classList.remove('hidden');
        }
        return;
      }
      try {
        if (btn) {
          btn.disabled = true;
          btn.textContent = 'Sending…';
        }
        await window.BMI_API.submitContact(payload);
        contactForm.classList.add('hidden');
        if (okEl) okEl.classList.remove('hidden');
      } catch (err) {
        if (errEl) {
          errEl.textContent = err.message || 'Could not send message.';
          errEl.classList.remove('hidden');
        }
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Send Message';
        }
      }
    });
  }
})();

/**
 * Shared nav, footer, cookie banner, legal modal injection.
 * Set data-page on <body> for aria-current highlighting.
 */
(function () {
  'use strict';

  const PAGE = document.body.dataset.page || '';
  const rootPrefix = document.body.dataset.root || '';

  function p(path) {
    return rootPrefix + path;
  }

  function isCurrent(page) {
    return PAGE === page ? ' aria-current="page"' : '';
  }

  function mapleIcon(size = 18) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" class="text-gold-400" aria-hidden="true">
      <path fill="currentColor" d="M12 2c.7 2.1 2.2 3.7 4.3 4.7-1.5.6-2.6 1.9-3.1 3.4 2.2.2 4.1 1.3 5.2 3-2 .2-3.7 1.3-4.7 3 1.2 1.7 1.7 3.7 1.3 5.8-1.6-1.3-3.4-2-5.2-2s-3.6.7-5.2 2c-.4-2.1.1-4.1 1.3-5.8-1-1.7-2.7-2.8-4.7-3 1.1-1.7 3-2.8 5.2-3-.5-1.5-1.6-2.8-3.1-3.4C9.8 5.7 11.3 4.1 12 2z"/>
    </svg>`;
  }

  function renderNav() {
    const mount = document.getElementById('site-nav');
    if (!mount) return;

    mount.innerHTML = `
    <a href="#main" class="skip-link">Skip to content</a>
    <header>
      <nav id="navbar" class="fixed top-0 left-0 right-0 z-50 transition-all duration-500" aria-label="Primary">
        <div class="max-w-7xl mx-auto px-5 sm:px-6">
          <div class="flex items-center justify-between h-16 md:h-[4.5rem]">
            <a href="${p('index.html')}" class="flex items-center gap-3 group focus-visible:outline-offset-4" aria-label="Black Maple Ink — Home">
              <div class="w-10 h-10 rounded-full border border-gold-400/40 flex items-center justify-center group-hover:border-gold-400 transition-colors" aria-hidden="true">
                ${mapleIcon(18)}
              </div>
              <div class="leading-none">
                <span class="text-lg font-serif font-semibold tracking-wide text-white">Black Maple</span>
                <span class="text-lg font-serif font-semibold tracking-wide text-gold-400"> Ink</span>
              </div>
            </a>
            <div class="hidden lg:flex items-center gap-8">
              <a href="${p('about.html')}" class="nav-link text-[13px] text-ink-300 hover:text-gold-400 tracking-wide2"${isCurrent('about')}>About</a>
              <a href="${p('services.html')}" class="nav-link text-[13px] text-ink-300 hover:text-gold-400 tracking-wide2"${isCurrent('services')}>Services</a>
              <a href="${p('artists.html')}" class="nav-link text-[13px] text-ink-300 hover:text-gold-400 tracking-wide2"${isCurrent('artists')}>Artists</a>
              <a href="${p('portfolio.html')}" class="nav-link text-[13px] text-ink-300 hover:text-gold-400 tracking-wide2"${isCurrent('portfolio')}>Portfolio</a>
              <a href="${p('locations.html')}" class="nav-link text-[13px] text-ink-300 hover:text-gold-400 tracking-wide2"${isCurrent('locations')}>Locations</a>
              <a href="${p('faq.html')}" class="nav-link text-[13px] text-ink-300 hover:text-gold-400 tracking-wide2"${isCurrent('faq')}>FAQ</a>
              <a href="${p('contact.html')}" class="nav-link text-[13px] text-ink-300 hover:text-gold-400 tracking-wide2"${isCurrent('contact')}>Contact</a>
            </div>
            <div class="flex items-center gap-3">
              <a href="${p('booking.html')}" class="btn-gold px-6 py-2.5 rounded-full text-[13px] tracking-wide2 hidden sm:inline-flex">Book Now</a>
              <button type="button" id="mobileMenuBtn" class="lg:hidden w-11 h-11 flex flex-col items-center justify-center gap-[6px]" aria-expanded="false" aria-controls="mobileMenu" aria-label="Open menu">
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
              </button>
            </div>
          </div>
        </div>
        <div id="mobileMenu" class="hidden lg:hidden border-t border-white/5 bg-ink-950/98 nav-blur" hidden>
          <div class="max-w-7xl mx-auto px-5 py-6 flex flex-col gap-1">
            <a href="${p('about.html')}" class="mobile-nav-link py-3 text-lg text-ink-200 hover:text-gold-400 transition-colors">About</a>
            <a href="${p('services.html')}" class="mobile-nav-link py-3 text-lg text-ink-200 hover:text-gold-400 transition-colors">Services</a>
            <a href="${p('artists.html')}" class="mobile-nav-link py-3 text-lg text-ink-200 hover:text-gold-400 transition-colors">Artists</a>
            <a href="${p('portfolio.html')}" class="mobile-nav-link py-3 text-lg text-ink-200 hover:text-gold-400 transition-colors">Portfolio</a>
            <a href="${p('locations.html')}" class="mobile-nav-link py-3 text-lg text-ink-200 hover:text-gold-400 transition-colors">Locations</a>
            <a href="${p('faq.html')}" class="mobile-nav-link py-3 text-lg text-ink-200 hover:text-gold-400 transition-colors">FAQ</a>
            <a href="${p('contact.html')}" class="mobile-nav-link py-3 text-lg text-ink-200 hover:text-gold-400 transition-colors">Contact</a>
            <a href="${p('booking.html')}" class="btn-gold px-6 py-3.5 rounded-full text-sm tracking-wide2 text-center mt-4 mobile-nav-link">Book Consultation</a>
          </div>
        </div>
      </nav>
    </header>`;

    // Fix hidden attribute conflict
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
      mobileMenu.hidden = false;
      mobileMenu.classList.add('hidden');
    }
  }

  function renderFooter() {
    const mount = document.getElementById('site-footer');
    if (!mount) return;

    mount.innerHTML = `
    <footer class="py-16 border-t border-white/5 bg-ink-950" role="contentinfo">
      <div class="max-w-7xl mx-auto px-5 sm:px-6">
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <a href="${p('index.html')}" class="flex items-center gap-3 mb-6" aria-label="Black Maple Ink home">
              <div class="w-10 h-10 rounded-full border border-gold-400/40 flex items-center justify-center" aria-hidden="true">${mapleIcon(18)}</div>
              <div>
                <span class="text-lg font-serif font-semibold text-white">Black Maple</span>
                <span class="text-lg font-serif font-semibold text-gold-400"> Ink</span>
              </div>
            </a>
            <p class="text-sm text-ink-500 font-light leading-relaxed">Where Art Becomes Legacy.<br>Multi-city luxury tattoo &amp; piercing studios.</p>
            <div class="flex gap-3 mt-6">
              <a href="https://instagram.com/blackmapleink" class="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-ink-500 hover:text-gold-400 hover:border-gold-400/30 transition-all" aria-label="Instagram" rel="noopener noreferrer" target="_blank"><span class="iconify text-sm" data-icon="lucide:instagram" aria-hidden="true"></span></a>
              <a href="https://facebook.com/blackmapleink" class="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-ink-500 hover:text-gold-400 hover:border-gold-400/30 transition-all" aria-label="Facebook" rel="noopener noreferrer" target="_blank"><span class="iconify text-sm" data-icon="lucide:facebook" aria-hidden="true"></span></a>
              <a href="https://tiktok.com/@blackmapleink" class="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-ink-500 hover:text-gold-400 hover:border-gold-400/30 transition-all" aria-label="TikTok" rel="noopener noreferrer" target="_blank"><span class="iconify text-sm" data-icon="lucide:music-2" aria-hidden="true"></span></a>
            </div>
          </div>
          <div>
            <h3 class="font-serif font-semibold mb-4 text-sm tracking-wide">Navigate</h3>
            <nav class="space-y-3" aria-label="Footer">
              <a href="${p('about.html')}" class="block text-sm text-ink-500 hover:text-gold-400 transition-colors font-light">About</a>
              <a href="${p('services.html')}" class="block text-sm text-ink-500 hover:text-gold-400 transition-colors font-light">Services</a>
              <a href="${p('artists.html')}" class="block text-sm text-ink-500 hover:text-gold-400 transition-colors font-light">Artists</a>
              <a href="${p('portfolio.html')}" class="block text-sm text-ink-500 hover:text-gold-400 transition-colors font-light">Portfolio</a>
              <a href="${p('locations.html')}" class="block text-sm text-ink-500 hover:text-gold-400 transition-colors font-light">Locations</a>
              <a href="${p('faq.html')}" class="block text-sm text-ink-500 hover:text-gold-400 transition-colors font-light">FAQ</a>
            </nav>
          </div>
          <div>
            <h3 class="font-serif font-semibold mb-4 text-sm tracking-wide">Book</h3>
            <div class="space-y-3">
              <a href="${p('booking.html')}" class="block text-sm text-ink-500 hover:text-gold-400 transition-colors font-light">Consultation &amp; Deposit</a>
              <a href="${p('locations/toronto.html')}" class="block text-sm text-ink-500 hover:text-gold-400 transition-colors font-light">Toronto Studio</a>
              <a href="${p('locations/vancouver.html')}" class="block text-sm text-ink-500 hover:text-gold-400 transition-colors font-light">Vancouver Studio</a>
              <a href="${p('locations/calgary.html')}" class="block text-sm text-ink-500 hover:text-gold-400 transition-colors font-light">Calgary Studio</a>
              <a href="${p('contact.html')}" class="block text-sm text-ink-500 hover:text-gold-400 transition-colors font-light">Contact</a>
            </div>
          </div>
          <div>
            <h3 class="font-serif font-semibold mb-4 text-sm tracking-wide">Contact</h3>
            <div class="space-y-3">
              <p class="text-sm text-ink-500 font-light">Studios in Toronto, Vancouver &amp; Calgary</p>
              <a href="tel:+14165550199" class="block text-sm text-ink-500 hover:text-gold-400 transition-colors font-light">+1 (416) 555-0199</a>
              <a href="mailto:hello@blackmapleink.ca" class="block text-sm text-ink-500 hover:text-gold-400 transition-colors font-light">hello@blackmapleink.ca</a>
              <p class="text-sm text-ink-500 font-light">Book online before your visit.<br>Deposits secured with Paystack.</p>
            </div>
          </div>
        </div>
        <div class="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-xs text-ink-600 font-light">&copy; <span id="year">2026</span> Black Maple Ink. All rights reserved.</p>
          <div class="flex gap-6">
            <button type="button" id="privacyBtn" class="text-xs text-ink-600 hover:text-gold-400 transition-colors font-light">Privacy Policy</button>
            <button type="button" id="termsBtn" class="text-xs text-ink-600 hover:text-gold-400 transition-colors font-light">Terms of Service</button>
          </div>
        </div>
      </div>
    </footer>

    <div id="legalModal" class="fixed inset-0 z-[210] hidden items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="legalTitle" hidden>
      <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" id="legalBackdrop"></div>
      <div class="relative glass-card rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-8 border-gold-400/10">
        <button type="button" id="legalClose" class="absolute top-4 right-4 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-ink-400 hover:text-gold-400 transition-colors" aria-label="Close">
          <span class="iconify text-lg" data-icon="lucide:x" aria-hidden="true"></span>
        </button>
        <h2 id="legalTitle" class="font-serif text-2xl font-semibold mb-4 pr-10"></h2>
        <div id="legalBody" class="text-sm text-ink-400 font-light leading-relaxed space-y-3"></div>
      </div>
    </div>

    <div id="cookieBanner" class="cookie-banner fixed bottom-0 left-0 right-0 z-50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]" role="dialog" aria-label="Cookie consent" aria-live="polite">
      <div class="max-w-7xl mx-auto">
        <div class="glass-card rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-gold-400/10 shadow-2xl">
          <p class="text-sm text-ink-300 font-light text-center sm:text-left">We use essential cookies to enhance your experience. By continuing, you agree to our use of cookies. <button type="button" id="cookiePrivacy" class="text-gold-400 underline underline-offset-2 hover:text-gold-300">Privacy Policy</button></p>
          <div class="flex gap-3 flex-shrink-0">
            <button type="button" id="cookieAccept" class="btn-gold px-6 py-2.5 rounded-full text-xs tracking-wide">Accept</button>
            <button type="button" id="cookieDecline" class="btn-outline-gold px-6 py-2.5 rounded-full text-xs tracking-wide">Decline</button>
          </div>
        </div>
      </div>
    </div>

    <div id="mobileCta" class="mobile-cta fixed bottom-0 left-0 right-0 z-40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden pointer-events-none">
      <a href="${p('booking.html')}" class="btn-gold pointer-events-auto flex items-center justify-center w-full py-3.5 rounded-full text-xs tracking-luxury uppercase shadow-2xl">Book Consultation</a>
    </div>

    <button type="button" id="backTop" class="back-top fixed bottom-24 lg:bottom-8 right-5 z-40 w-11 h-11 rounded-full border border-gold-400/30 bg-ink-950/90 nav-blur text-gold-400 flex items-center justify-center hover:border-gold-400 hover:bg-gold-400/10 transition-colors" aria-label="Back to top">
      <span class="iconify text-lg" data-icon="lucide:arrow-up" aria-hidden="true"></span>
    </button>`;
  }

  renderNav();
  renderFooter();
})();

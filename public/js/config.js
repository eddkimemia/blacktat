/**
 * Frontend runtime config.
 *
 * apiBase:
 *   ''  → same origin (use when Express serves public/ + /api together)
 *   'https://api.yourdomain.com' → hybrid: static site on GitHub Pages,
 *        API on Railway/Render/etc. (no trailing slash)
 *
 * See docs/HOSTING.md
 */
window.BMI_CONFIG = {
  apiBase: '', // e.g. '' or 'https://api.blackmapleink.ca'
  brand: 'Black Maple Ink',
  siteUrl: 'https://blackmapleink.ca',
  defaultLocale: 'en-CA',
};

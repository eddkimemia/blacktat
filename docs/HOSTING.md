# Hosting Black Maple Ink

This project has **two layers**:

| Layer | What it is | Where it can run |
|--------|------------|------------------|
| **Static site** | HTML, CSS, JS, images in `public/` | GitHub Pages, Netlify, Cloudflare Pages, any static host |
| **API + booking** | Express + SQLite + Paystack in `server/` | Railway, Render, Fly.io, VPS, DigitalOcean, etc. **Not** GitHub Pages |

GitHub Pages only serves static files. It **cannot** run Node.js, SQLite, or Paystack webhooks. That is why a “whole repo” deploy often looked blank or broken.

---

## Why the site looked blank on GitHub Pages

Three common causes (now fixed in this repo):

### 1. Wrong publish folder

The live website files live in **`public/`**, not the repository root.

| Wrong | Right |
|-------|--------|
| Pages → Deploy from branch → `/` (root) | Deploy **`public/`** as the site root |
| Opening `https://user.github.io/blacktat/` with only a README at root | GitHub Action uploads `public/` so `index.html` is at the site root |

### 2. Absolute asset paths (`/js/...`, `/css/...`)

Paths that start with `/` always go to the **domain root**:

- Custom domain `https://blackmapleink.ca/js/main.js` → OK  
- Project URL `https://eddkimemia.github.io/blacktat/js/main.js` → **404** (file is under `/blacktat/js/`)

**Fix applied:** all pages now use **relative** paths (`js/…`, `css/…`, `../js/…` on location pages) and `data-root=""` / `data-root="../"` for nav links.

### 3. Pages that only worked with the API

Artists and locations used to show “Loading…” or an error when `/api` was missing.

**Fix applied:** `public/js/static-data.js` provides full fallback content so the marketing site works on pure static hosting. Booking still needs a live API.

---

## Option A — GitHub Pages (marketing site)

Best for: portfolio, about, services, SEO pages, location pages.

### One-time setup

1. Push this repo to GitHub (already: `eddkimemia/blacktat`).
2. Open **Settings → Pages**.
3. Under **Build and deployment**:
   - **Source:** GitHub Actions  
   - (Do **not** choose “Deploy from a branch” pointing at root unless you also change the folder.)
4. Ensure the workflow file exists:  
   `.github/workflows/deploy-pages.yml`  
   It publishes the **`public/`** folder on every push to `master` or `main`.
5. Push to `master`/`main`, then wait for the **Actions** tab → **Deploy GitHub Pages** to finish (green check).
6. Site URL will be similar to:  
   `https://eddkimemia.github.io/blacktat/`

### Custom domain (e.g. blackmapleink.ca)

1. In **Settings → Pages → Custom domain**, enter `blackmapleink.ca` (and/or `www`).
2. At your DNS provider, add records GitHub shows (usually `A` records for apex + `CNAME` for `www`).
3. Wait for DNS + TLS certificate (“Enforce HTTPS” when available).
4. Optional: add `public/CNAME` containing only:

   ```text
   blackmapleink.ca
   ```

Relative paths work with **both** project URLs and custom domains.

### What works on GitHub Pages

- Home, About, Services, Artists, Portfolio, Locations, FAQ, Contact (UI)
- SEO meta tags, images, sitemaps, robots

### What does **not** work on GitHub Pages alone

- Live booking wizard (needs `POST /api/bookings`)
- Availability slots
- Paystack deposit + webhook
- Contact form submission (unless you point `apiBase` at a live API)
- Admin dashboard

On static hosting, the booking page shows a notice if the API is unreachable. Users can still browse and email `hello@blackmapleink.ca`.

---

## Option B — Full app (site + booking + Paystack)

Best for production with real deposits.

### Requirements

- Node.js 18+
- Environment variables from `.env.example`
- Paystack keys
- Public HTTPS URL for callbacks/webhooks

### Local

```bash
npm install
copy .env.example .env   # Windows
# edit .env — Paystack keys, SITE_URL, ADMIN_API_KEY
npm start
# → http://localhost:3000
```

Express serves `public/` **and** `/api/*` from one origin. No path issues.

### Production hosts (examples)

| Host | Notes |
|------|--------|
| **Railway / Render / Fly.io** | Deploy Node app; set env vars; attach volume or accept ephemeral SQLite |
| **VPS (nginx + pm2)** | Reverse-proxy to `node server/index.js`, HTTPS with Let’s Encrypt |
| **DigitalOcean App Platform** | Similar to Railway |

Checklist:

1. `NODE_ENV=production`
2. Strong `ADMIN_API_KEY`
3. Live Paystack `sk_live_…` / `pk_live_…`
4. `SITE_URL=https://yourdomain.com`
5. `CORS_ORIGIN=https://yourdomain.com` (if needed)
6. Paystack webhook: `https://yourdomain.com/api/payments/webhook`
7. Process manager (`pm2`) or platform restart policy
8. Persist `data/` if you care about booking history across restarts

---

## Option C — Hybrid (recommended for GitHub + real booking)

1. **Static front** on GitHub Pages (or Cloudflare Pages) from `public/`.
2. **API** on Railway/Render at e.g. `https://api.blackmapleink.ca`.
3. In `public/js/config.js` set:

```js
window.BMI_CONFIG = {
  apiBase: 'https://api.blackmapleink.ca', // no trailing slash
  brand: 'Black Maple Ink',
  siteUrl: 'https://blackmapleink.ca',
  defaultLocale: 'en-CA',
};
```

4. On the API server, set `CORS_ORIGIN` to your static site origin(s).
5. Paystack callback URLs should still point at pages that can call the API (either same domain via reverse proxy, or static site + `apiBase`).

---

## Do **not** do this

| Mistake | Result |
|---------|--------|
| Point Pages at repo root | No `index.html` → blank / 404 |
| Deploy with absolute `/js/` on project Pages | CSS/JS 404 → unstyled or empty-looking page |
| Expect Paystack on GitHub Pages | Booking will fail |
| Commit `.env` | Secret leak |

---

## Quick verification checklist

After deploy:

1. Open the site URL.
2. View source / Network tab: `css/styles.css` and `js/main.js` return **200**.
3. Nav links open About, Services, etc.
4. Artists and Locations show cards (static data if no API).
5. Booking: only succeeds if API + Paystack are configured.

Local static preview (no API):

```bash
# from repo root, after installing a static server if needed
npx --yes serve public -p 5500
# open http://localhost:5500
```

Full stack:

```bash
npm start
# open http://localhost:3000
```

---

## Files that matter for hosting

```
public/                         ← what GitHub Pages must publish
  index.html
  css/styles.css
  js/config.js                  ← set apiBase for hybrid
  js/static-data.js             ← offline/static fallbacks
.github/workflows/deploy-pages.yml
server/                         ← Node API (not for GitHub Pages)
docs/HOSTING.md                 ← this file
```

---

## Support summary for the owner

1. **Blank page on GitHub** → use GitHub Actions deploy of `public/`, not the repo root; paths are relative now.  
2. **Pretty marketing site only** → GitHub Pages is enough.  
3. **Real online deposits** → host Node (`npm start`) on a Node-capable platform and configure Paystack.  
4. **Both** → hybrid: Pages + API URL in `config.js`.

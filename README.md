# Black Maple Ink — Production Multisite

Luxury multi-location tattoo studio website with **HTML / JS / Tailwind**, complete **Express + SQLite backend**, **consultation & booking before visit**, and **Paystack deposit payments**.

## Features

- **Multisite**: Toronto, Vancouver, Calgary location pages + shared booking API
- **SEO-rich**: per-page meta, Open Graph, JSON-LD, `sitemap.xml`, `robots.txt`
- **Booking before visit**: multi-step wizard (details → studio/service → date/time slots → vision → Paystack deposit)
- **Paystack**: initialize transaction, redirect checkout, verify callback, webhook HMAC
- **Backend**: bookings, availability, consultations, contact, admin API
- **Separate files**: CSS, JS modules, multi-page HTML under `public/`

## Quick start

```bash
# 1. Install dependencies (requires Node 18+)
npm install

# 2. Configure environment
copy .env.example .env   # Windows
# add Paystack keys from https://dashboard.paystack.com

# 3. Run
npm start
# → http://localhost:3000
```

Dev with auto-restart:

```bash
npm run dev
```

## Paystack setup

1. Create a [Paystack](https://paystack.com) account and get **test** `sk_test_…` / `pk_test_…` keys.
2. Put them in `.env`:
   - `PAYSTACK_SECRET_KEY`
   - `PAYSTACK_PUBLIC_KEY`
3. Set deposit amount (in **smallest unit**):
   - `DEPOSIT_AMOUNT=5000` + `DEPOSIT_CURRENCY=NGN` → ₦50.00
   - For USD: `DEPOSIT_AMOUNT=5000` + `DEPOSIT_CURRENCY=USD` → $50.00
4. Set `SITE_URL` to your public URL (used for Paystack callback).
5. Webhook (production): `POST https://yourdomain.com/api/payments/webhook`  
   Signature verified with `x-paystack-signature`.

**Flow**

1. Client completes booking wizard on `/booking.html`
2. `POST /api/bookings` creates booking (`pending_payment`) and initializes Paystack
3. Client is redirected to Paystack checkout
4. Paystack returns to `/booking-success.html?reference=…`
5. Frontend calls `GET /api/payments/verify` → status becomes `confirmed`
6. Webhook can also confirm payment if the user closes the browser early

## Project structure

```
public/                 # Frontend (static HTML, CSS, JS)
  index.html
  booking.html          # Full booking + Paystack deposit
  locations/            # Multisite location pages
  css/styles.css
  js/                   # config, api, components, main, booking
server/
  index.js              # Express app
  db.js                 # SQLite schema + seed
  routes/               # API routes
  services/paystack.js
data/                   # SQLite DB (gitignored)
```

## API overview

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/config` | Public config (sites, artists, services, deposit) |
| GET | `/api/sites` | List studio locations |
| GET | `/api/sites/:slug` | Location detail + artists |
| GET | `/api/availability?site=&date=` | Open slots for date |
| POST | `/api/bookings` | Create booking + Paystack init |
| GET | `/api/bookings/:reference` | Booking status |
| GET | `/api/payments/verify?reference=` | Verify Paystack payment |
| POST | `/api/payments/webhook` | Paystack webhook |
| POST | `/api/consultations` | Soft lead form |
| POST | `/api/contact` | Contact form |
| GET | `/api/admin/*` | Admin (header `x-admin-key`) |

## Admin

Open `/admin/` and enter `ADMIN_API_KEY` from `.env` (default in dev: `dev-admin-key-change-me`).

## Production checklist

- [ ] Set strong `ADMIN_API_KEY`
- [ ] Use live Paystack keys (`sk_live_…`)
- [ ] Set `SITE_URL` and `CORS_ORIGIN` to your domain
- [ ] Configure Paystack webhook URL
- [ ] Put process behind HTTPS (nginx, Caddy, or host platform)
- [ ] Run with `NODE_ENV=production` and a process manager (`pm2`, systemd, Docker)
- [ ] Replace placeholder phone/address if needed
- [ ] Update `sitemap.xml` domain if different from `blackmapleink.ca`

## License

Private / unlicensed — Black Maple Ink.

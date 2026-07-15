'use strict';

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config');
require('./db'); // migrate + seed

const sitesRouter = require('./routes/sites');
const availabilityRouter = require('./routes/availability');
const bookingsRouter = require('./routes/bookings');
const paymentsRouter = require('./routes/payments');
const consultationsRouter = require('./routes/consultations');
const contactRouter = require('./routes/contact');
const adminRouter = require('./routes/admin');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(',').map((s) => s.trim()),
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  })
);

app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));

// Paystack webhook needs raw body for HMAC signature verification
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    req.url = '/webhook';
    paymentsRouter(req, res, next);
  }
);

app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: true }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many submissions, please try again later.' },
});

app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      service: 'black-maple-ink',
      env: config.env,
      time: new Date().toISOString(),
      paystackConfigured: Boolean(config.paystack.secretKey),
    },
  });
});

app.get('/api/config', require('./routes/sites').publicConfigHandler);

app.use('/api/sites', sitesRouter);
app.use('/api/availability', availabilityRouter);
app.use('/api/bookings', writeLimiter, bookingsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/consultations', writeLimiter, consultationsRouter);
app.use('/api/contact', writeLimiter, contactRouter);
app.use('/api/admin', adminRouter);

// Static frontend
app.use(
  express.static(config.publicDir, {
    extensions: ['html'],
    maxAge: config.env === 'production' ? '1h' : 0,
    setHeaders(res, filePath) {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  })
);

// SPA-ish fallback for clean URLs without .html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const tryFile = path.join(config.publicDir, `${req.path.replace(/\/$/, '')}.html`);
  res.sendFile(tryFile, (err) => {
    if (err) next();
  });
});

app.use('/api/*', notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Black Maple Ink server listening on http://localhost:${config.port}`);
  console.log(`Environment: ${config.env}`);
  console.log(`Paystack: ${config.paystack.secretKey ? 'configured' : 'NOT configured (set PAYSTACK_SECRET_KEY)'}`);
  console.log(`Deposit: ${config.deposit.amount} ${config.deposit.currency} (${config.deposit.label})`);
});

module.exports = app;

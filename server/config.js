'use strict';

require('dotenv').config();

const path = require('path');

const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  siteUrl: (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  dbPath: process.env.DB_PATH || path.join(__dirname, '..', 'data', 'blackmaple.db'),
  publicDir: path.join(__dirname, '..', 'public'),

  deposit: {
    amount: Number(process.env.DEPOSIT_AMOUNT) || 5000,
    currency: (process.env.DEPOSIT_CURRENCY || 'NGN').toUpperCase(),
    label: process.env.DEPOSIT_LABEL || '₦50.00',
  },

  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY || '',
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
    webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY || '',
    baseUrl: 'https://api.paystack.co',
  },

  adminApiKey: process.env.ADMIN_API_KEY || 'dev-admin-key-change-me',

  studio: {
    email: process.env.STUDIO_EMAIL || 'hello@blackmapleink.ca',
    phone: process.env.STUDIO_PHONE || '+1-416-555-0199',
    name: 'Black Maple Ink',
  },

  /** Business hours used for slot generation (local studio time, 24h) */
  defaultHours: {
    0: null, // Sunday handled per-site
    1: null,
    2: { open: 11, close: 20 },
    3: { open: 11, close: 20 },
    4: { open: 11, close: 20 },
    5: { open: 11, close: 20 },
    6: { open: 10, close: 20 },
  },

  slotDurationMinutes: 60,
  bookingLeadDays: 1,
  bookingHorizonDays: 60,
};

module.exports = config;

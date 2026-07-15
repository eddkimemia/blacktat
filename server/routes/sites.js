'use strict';

const express = require('express');
const { db } = require('../db');
const config = require('../config');

const router = express.Router();

function mapSite(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    city: row.city,
    region: row.region,
    country: row.country,
    postalCode: row.postal_code,
    street: row.street,
    phone: row.phone,
    email: row.email,
    timezone: row.timezone,
    hours: JSON.parse(row.hours_json || '{}'),
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    addressLine: `${row.street}, ${row.city}, ${row.region} ${row.postal_code || ''}`.trim(),
  };
}

function publicConfigHandler(req, res) {
  const sites = db
    .prepare('SELECT id, slug, name, city, region FROM sites WHERE is_active = 1 ORDER BY city')
    .all();
  const artists = db
    .prepare(
      'SELECT id, slug, name, specialty, site_id AS siteId, image_url AS imageUrl FROM artists WHERE is_active = 1 ORDER BY sort_order'
    )
    .all();
  const services = db
    .prepare(
      'SELECT id, slug, name, category, description, min_price_label AS minPriceLabel FROM services WHERE is_active = 1 ORDER BY sort_order'
    )
    .all();

  res.json({
    success: true,
    data: {
      studio: config.studio,
      deposit: config.deposit,
      paystackPublicKey: config.paystack.publicKey,
      sites,
      artists,
      services,
      bookingLeadDays: config.bookingLeadDays,
      bookingHorizonDays: config.bookingHorizonDays,
    },
  });
}

router.get('/', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM sites WHERE is_active = 1 ORDER BY city ASC')
    .all();
  res.json({ success: true, data: rows.map(mapSite) });
});

router.get('/meta/public-config', publicConfigHandler);

router.get('/:slug', (req, res) => {
  const row = db
    .prepare('SELECT * FROM sites WHERE slug = ? AND is_active = 1')
    .get(req.params.slug);
  if (!row) {
    return res.status(404).json({ success: false, error: 'Location not found' });
  }

  const artists = db
    .prepare(
      'SELECT id, slug, name, specialty, bio, image_url AS imageUrl FROM artists WHERE is_active = 1 AND (site_id = ? OR site_id IS NULL) ORDER BY sort_order'
    )
    .all(row.id);

  res.json({ success: true, data: { ...mapSite(row), artists } });
});

module.exports = router;
module.exports.publicConfigHandler = publicConfigHandler;

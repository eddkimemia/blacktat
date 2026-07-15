'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const {
  requireFields,
  isValidEmail,
  sanitizeString,
  badRequest,
} = require('../middleware/validate');

const router = express.Router();

/** Soft-lead consultation without immediate payment (optional path). */
router.post('/', (req, res, next) => {
  try {
    const body = req.body || {};
    requireFields(body, ['fullName', 'email', 'vision']);

    const fullName = sanitizeString(body.fullName, 120);
    const email = sanitizeString(body.email, 200).toLowerCase();
    const phone = sanitizeString(body.phone || '', 40);
    const vision = sanitizeString(body.vision, 4000);
    const serviceSlug = body.serviceSlug ? sanitizeString(body.serviceSlug, 60) : null;
    const artistSlug = body.artistSlug ? sanitizeString(body.artistSlug, 60) : null;
    const siteSlug = body.siteSlug ? sanitizeString(body.siteSlug, 60) : null;

    if (!isValidEmail(email)) throw badRequest('Invalid email address');
    if (vision.length < 10) throw badRequest('Please describe your vision (min 10 characters)');

    let siteId = null;
    if (siteSlug) {
      const site = db.prepare('SELECT id FROM sites WHERE slug = ? AND is_active = 1').get(siteSlug);
      if (site) siteId = site.id;
    }

    const id = uuidv4();
    db.prepare(
      `INSERT INTO consultations (id, site_id, full_name, email, phone, service_slug, artist_slug, vision)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, siteId, fullName, email, phone || null, serviceSlug, artistSlug, vision);

    res.status(201).json({
      success: true,
      data: {
        id,
        message: 'Consultation received. We will contact you within 24 hours.',
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

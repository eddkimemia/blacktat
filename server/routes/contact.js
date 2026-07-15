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

router.post('/', (req, res, next) => {
  try {
    const body = req.body || {};
    requireFields(body, ['fullName', 'email', 'message']);

    const fullName = sanitizeString(body.fullName, 120);
    const email = sanitizeString(body.email, 200).toLowerCase();
    const phone = sanitizeString(body.phone || '', 40);
    const subject = sanitizeString(body.subject || 'Website inquiry', 200);
    const message = sanitizeString(body.message, 5000);
    const siteSlug = body.siteSlug ? sanitizeString(body.siteSlug, 60) : null;

    if (!isValidEmail(email)) throw badRequest('Invalid email address');
    if (message.length < 5) throw badRequest('Message is too short');

    let siteId = null;
    if (siteSlug) {
      const site = db.prepare('SELECT id FROM sites WHERE slug = ?').get(siteSlug);
      if (site) siteId = site.id;
    }

    const id = uuidv4();
    db.prepare(
      `INSERT INTO contact_messages (id, site_id, full_name, email, phone, subject, message)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(id, siteId, fullName, email, phone || null, subject, message);

    res.status(201).json({
      success: true,
      data: { id, message: 'Message sent. We will reply shortly.' },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

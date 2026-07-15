'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const config = require('../config');
const {
  requireFields,
  isValidEmail,
  isValidDate,
  isValidTime,
  sanitizeString,
  badRequest,
} = require('../middleware/validate');
const { initializeTransaction, PaystackError } = require('../services/paystack');

const router = express.Router();

function bookingRef() {
  const part = uuidv4().replace(/-/g, '').slice(0, 8).toUpperCase();
  return `BMI-${part}`;
}

function mapBooking(row) {
  if (!row) return null;
  return {
    id: row.id,
    reference: row.reference,
    status: row.status,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    vision: row.vision,
    preferredDate: row.preferred_date,
    preferredTime: row.preferred_time,
    depositAmount: row.deposit_amount,
    depositCurrency: row.deposit_currency,
    paidAt: row.paid_at,
    createdAt: row.created_at,
    site: row.site_slug
      ? { id: row.site_id, slug: row.site_slug, name: row.site_name, city: row.site_city }
      : undefined,
    service: row.service_slug
      ? { id: row.service_id, slug: row.service_slug, name: row.service_name }
      : undefined,
    artist: row.artist_slug
      ? { id: row.artist_id, slug: row.artist_slug, name: row.artist_name }
      : null,
  };
}

const SELECT_JOIN = `
  SELECT b.*,
    s.slug AS site_slug, s.name AS site_name, s.city AS site_city,
    sv.slug AS service_slug, sv.name AS service_name,
    a.slug AS artist_slug, a.name AS artist_name
  FROM bookings b
  JOIN sites s ON s.id = b.site_id
  JOIN services sv ON sv.id = b.service_id
  LEFT JOIN artists a ON a.id = b.artist_id
`;

/**
 * Create booking + initialize Paystack deposit payment.
 * Client pays BEFORE the visit; appointment is confirmed after successful payment.
 */
router.post('/', async (req, res, next) => {
  try {
    const body = req.body || {};
    requireFields(body, [
      'fullName',
      'email',
      'serviceSlug',
      'siteSlug',
      'vision',
      'preferredDate',
      'preferredTime',
    ]);

    const fullName = sanitizeString(body.fullName, 120);
    const email = sanitizeString(body.email, 200).toLowerCase();
    const phone = sanitizeString(body.phone || '', 40);
    const vision = sanitizeString(body.vision, 4000);
    const preferredDate = sanitizeString(body.preferredDate, 10);
    const preferredTime = sanitizeString(body.preferredTime, 5);
    const serviceSlug = sanitizeString(body.serviceSlug, 60);
    const siteSlug = sanitizeString(body.siteSlug, 60);
    const artistSlug = body.artistSlug ? sanitizeString(body.artistSlug, 60) : null;

    if (!isValidEmail(email)) throw badRequest('Invalid email address');
    if (!isValidDate(preferredDate)) throw badRequest('Invalid preferred date');
    if (!isValidTime(preferredTime)) throw badRequest('Invalid preferred time (use HH:MM)');
    if (vision.length < 10) throw badRequest('Please describe your vision in more detail (min 10 characters)');

    const site = db.prepare('SELECT * FROM sites WHERE slug = ? AND is_active = 1').get(siteSlug);
    if (!site) throw badRequest('Invalid studio location');

    const service = db
      .prepare('SELECT * FROM services WHERE slug = ? AND is_active = 1')
      .get(serviceSlug);
    if (!service) throw badRequest('Invalid service');

    let artist = null;
    if (artistSlug) {
      artist = db
        .prepare('SELECT * FROM artists WHERE slug = ? AND is_active = 1')
        .get(artistSlug);
      if (!artist) throw badRequest('Invalid artist');
    }

    // Prevent double-booking same slot (site + time, and artist if specified)
    const conflictSql = artist
      ? `SELECT id FROM bookings WHERE site_id = ? AND preferred_date = ? AND preferred_time = ?
           AND status IN ('pending_payment','paid','confirmed')
           AND (artist_id = ? OR artist_id IS NULL) LIMIT 1`
      : `SELECT id FROM bookings WHERE site_id = ? AND preferred_date = ? AND preferred_time = ?
           AND status IN ('pending_payment','paid','confirmed') LIMIT 1`;
    const conflict = artist
      ? db.prepare(conflictSql).get(site.id, preferredDate, preferredTime, artist.id)
      : db.prepare(conflictSql).get(site.id, preferredDate, preferredTime);
    if (conflict) {
      throw badRequest('That time slot is no longer available. Please choose another.');
    }

    const id = uuidv4();
    const reference = bookingRef();
    const paystackReference = `ps_${reference.toLowerCase().replace(/-/g, '_')}_${Date.now()}`;
    const amount = config.deposit.amount;
    const currency = config.deposit.currency;

    db.prepare(
      `INSERT INTO bookings (
        id, reference, site_id, service_id, artist_id,
        full_name, email, phone, vision,
        preferred_date, preferred_time, status,
        deposit_amount, deposit_currency, paystack_reference
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_payment', ?, ?, ?)`
    ).run(
      id,
      reference,
      site.id,
      service.id,
      artist ? artist.id : null,
      fullName,
      email,
      phone || null,
      vision,
      preferredDate,
      preferredTime,
      amount,
      currency,
      paystackReference
    );

    const callbackUrl = `${config.siteUrl}/booking-success.html?reference=${encodeURIComponent(paystackReference)}`;

    let paymentPayload = null;
    let authorizationUrl = null;

    try {
      const init = await initializeTransaction({
        email,
        amount,
        currency,
        reference: paystackReference,
        callbackUrl,
        metadata: {
          booking_id: id,
          booking_reference: reference,
          site: site.slug,
          service: service.slug,
          preferred_date: preferredDate,
          preferred_time: preferredTime,
          custom_fields: [
            { display_name: 'Booking Ref', variable_name: 'booking_ref', value: reference },
            { display_name: 'Studio', variable_name: 'studio', value: site.city },
          ],
        },
      });

      paymentPayload = init.data;
      authorizationUrl = init.data.authorization_url;

      db.prepare(
        `UPDATE bookings SET paystack_access_code = ?, updated_at = datetime('now') WHERE id = ?`
      ).run(init.data.access_code, id);

      db.prepare(
        `INSERT INTO payments (id, booking_id, paystack_reference, amount, currency, status)
         VALUES (?, ?, ?, ?, ?, 'initialized')`
      ).run(uuidv4(), id, paystackReference, amount, currency);
    } catch (err) {
      // Keep booking so staff can follow up; surface Paystack config errors clearly
      if (err instanceof PaystackError && err.status === 503) {
        return res.status(201).json({
          success: true,
          data: {
            booking: mapBooking(
              db.prepare(`${SELECT_JOIN} WHERE b.id = ?`).get(id)
            ),
            payment: {
              required: true,
              configured: false,
              message:
                'Booking saved. Paystack keys are not configured — set PAYSTACK_SECRET_KEY to enable online deposits.',
              amount,
              currency,
              reference: paystackReference,
            },
          },
        });
      }
      // Roll soft-fail: mark booking but return error for payment init
      console.error('[paystack init]', err.message);
      return res.status(201).json({
        success: true,
        data: {
          booking: mapBooking(db.prepare(`${SELECT_JOIN} WHERE b.id = ?`).get(id)),
          payment: {
            required: true,
            configured: true,
            error: err.message,
            amount,
            currency,
            reference: paystackReference,
          },
        },
      });
    }

    res.status(201).json({
      success: true,
      data: {
        booking: mapBooking(db.prepare(`${SELECT_JOIN} WHERE b.id = ?`).get(id)),
        payment: {
          required: true,
          configured: true,
          amount,
          currency,
          reference: paystackReference,
          authorizationUrl,
          accessCode: paymentPayload.access_code,
          publicKey: config.paystack.publicKey,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:reference', (req, res) => {
  const ref = req.params.reference;
  const row = db
    .prepare(
      `${SELECT_JOIN} WHERE b.reference = ? OR b.paystack_reference = ? OR b.id = ?`
    )
    .get(ref, ref, ref);

  if (!row) {
    return res.status(404).json({ success: false, error: 'Booking not found' });
  }

  res.json({
    success: true,
    data: mapBooking(row),
  });
});

module.exports = router;

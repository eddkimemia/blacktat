'use strict';

const express = require('express');
const { db } = require('../db');
const {
  verifyTransaction,
  verifyWebhookSignature,
  PaystackError,
} = require('../services/paystack');

const router = express.Router();

function markBookingPaid(booking, verificationData) {
  const paidAt =
    verificationData.paid_at ||
    verificationData.paidAt ||
    new Date().toISOString();

  const tx = db.transaction(() => {
    db.prepare(
      `UPDATE bookings
       SET status = 'confirmed', paid_at = ?, updated_at = datetime('now')
       WHERE id = ? AND status IN ('pending_payment', 'paid')`
    ).run(paidAt, booking.id);

    db.prepare(
      `UPDATE payments
       SET status = 'success', channel = ?, paid_at = ?, raw_json = ?
       WHERE paystack_reference = ?`
    ).run(
      verificationData.channel || null,
      paidAt,
      JSON.stringify(verificationData),
      booking.paystack_reference
    );
  });
  tx();
}

/**
 * Verify Paystack payment after redirect callback.
 * GET /api/payments/verify?reference=ps_...
 */
router.get('/verify', async (req, res, next) => {
  try {
    const reference = String(req.query.reference || '').trim();
    if (!reference) {
      return res.status(400).json({ success: false, error: 'reference is required' });
    }

    const booking = db
      .prepare('SELECT * FROM bookings WHERE paystack_reference = ? OR reference = ?')
      .get(reference, reference);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found for this payment' });
    }

    if (booking.status === 'confirmed' || booking.status === 'paid') {
      return res.json({
        success: true,
        data: {
          status: 'confirmed',
          alreadyVerified: true,
          bookingReference: booking.reference,
          preferredDate: booking.preferred_date,
          preferredTime: booking.preferred_time,
        },
      });
    }

    const result = await verifyTransaction(booking.paystack_reference || reference);
    const data = result.data || {};

    if (data.status !== 'success') {
      return res.status(402).json({
        success: false,
        error: 'Payment not successful',
        data: { status: data.status, gatewayResponse: data.gateway_response },
      });
    }

    // Amount safety check
    if (Number(data.amount) !== Number(booking.deposit_amount)) {
      console.warn('[paystack] amount mismatch', data.amount, booking.deposit_amount);
    }

    markBookingPaid(booking, data);

    res.json({
      success: true,
      data: {
        status: 'confirmed',
        alreadyVerified: false,
        bookingReference: booking.reference,
        preferredDate: booking.preferred_date,
        preferredTime: booking.preferred_time,
        amount: data.amount,
        currency: data.currency,
        channel: data.channel,
        paidAt: data.paid_at,
      },
    });
  } catch (err) {
    if (err instanceof PaystackError) {
      err.status = err.status || 502;
    }
    next(err);
  }
});

/**
 * Paystack webhook — configure URL: https://yourdomain.com/api/payments/webhook
 * Uses raw body for HMAC verification (mounted with express.raw in index).
 */
router.post('/webhook', (req, res) => {
  try {
    const signature = req.get('x-paystack-signature');
    const rawBody = Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}));

    if (!verifyWebhookSignature(rawBody, signature)) {
      return res.status(401).json({ success: false, error: 'Invalid signature' });
    }

    const event = JSON.parse(rawBody.toString('utf8'));
    const eventName = event.event;
    const data = event.data || {};

    if (eventName === 'charge.success') {
      const reference = data.reference;
      const booking = db
        .prepare('SELECT * FROM bookings WHERE paystack_reference = ?')
        .get(reference);
      if (booking && booking.status === 'pending_payment') {
        markBookingPaid(booking, data);
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('[webhook]', err);
    res.sendStatus(500);
  }
});

module.exports = router;

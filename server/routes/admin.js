'use strict';

const express = require('express');
const { db } = require('../db');
const { requireAdmin } = require('../middleware/errorHandler');
const { sanitizeString, badRequest } = require('../middleware/validate');

const router = express.Router();
router.use(requireAdmin);

router.get('/stats', (req, res) => {
  const stats = {
    bookingsTotal: db.prepare('SELECT COUNT(*) AS c FROM bookings').get().c,
    bookingsConfirmed: db
      .prepare("SELECT COUNT(*) AS c FROM bookings WHERE status = 'confirmed'")
      .get().c,
    bookingsPending: db
      .prepare("SELECT COUNT(*) AS c FROM bookings WHERE status = 'pending_payment'")
      .get().c,
    consultations: db.prepare('SELECT COUNT(*) AS c FROM consultations').get().c,
    messages: db.prepare('SELECT COUNT(*) AS c FROM contact_messages').get().c,
    revenueDeposit: db
      .prepare(
        "SELECT COALESCE(SUM(deposit_amount),0) AS s FROM bookings WHERE status IN ('confirmed','paid')"
      )
      .get().s,
  };
  res.json({ success: true, data: stats });
});

router.get('/bookings', (req, res) => {
  const status = req.query.status ? String(req.query.status) : null;
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const offset = Number(req.query.offset) || 0;

  let sql = `
    SELECT b.*, s.slug AS site_slug, s.city AS site_city,
           sv.name AS service_name, a.name AS artist_name
    FROM bookings b
    JOIN sites s ON s.id = b.site_id
    JOIN services sv ON sv.id = b.service_id
    LEFT JOIN artists a ON a.id = b.artist_id
  `;
  const params = [];
  if (status) {
    sql += ' WHERE b.status = ?';
    params.push(status);
  }
  sql += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const rows = db.prepare(sql).all(...params);
  res.json({ success: true, data: rows });
});

router.patch('/bookings/:id', (req, res, next) => {
  try {
    const id = req.params.id;
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ? OR reference = ?').get(id, id);
    if (!booking) return res.status(404).json({ success: false, error: 'Not found' });

    const allowed = ['pending_payment', 'paid', 'confirmed', 'cancelled', 'completed', 'no_show'];
    const status = req.body.status ? sanitizeString(req.body.status, 40) : null;
    const notes = req.body.notes !== undefined ? sanitizeString(req.body.notes, 2000) : null;

    if (status && !allowed.includes(status)) throw badRequest('Invalid status');

    if (status) {
      db.prepare(
        `UPDATE bookings SET status = ?, updated_at = datetime('now') WHERE id = ?`
      ).run(status, booking.id);
    }
    if (notes !== null) {
      db.prepare(
        `UPDATE bookings SET notes = ?, updated_at = datetime('now') WHERE id = ?`
      ).run(notes, booking.id);
    }

    const updated = db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking.id);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

router.get('/consultations', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM consultations ORDER BY created_at DESC LIMIT 100')
    .all();
  res.json({ success: true, data: rows });
});

router.get('/messages', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 100')
    .all();
  res.json({ success: true, data: rows });
});

module.exports = router;

'use strict';

const express = require('express');
const { db } = require('../db');
const config = require('../config');
const { isValidDate, badRequest } = require('../middleware/validate');

const router = express.Router();

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function parseHours(hoursJson) {
  try {
    return JSON.parse(hoursJson || '{}');
  } catch {
    return {};
  }
}

function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function generateSlots(open, close, duration) {
  const slots = [];
  let cursor = timeToMinutes(open);
  const end = timeToMinutes(close);
  while (cursor + duration <= end) {
    slots.push(minutesToTime(cursor));
    cursor += duration;
  }
  return slots;
}

function getBookedTimes(siteId, date, artistId) {
  let sql = `
    SELECT preferred_time AS t FROM bookings
    WHERE site_id = ? AND preferred_date = ?
      AND status IN ('pending_payment', 'paid', 'confirmed')
  `;
  const params = [siteId, date];
  if (artistId) {
    sql += ' AND (artist_id = ? OR artist_id IS NULL)';
    params.push(artistId);
  }
  return new Set(db.prepare(sql).all(...params).map((r) => r.t));
}

/**
 * GET /api/availability?site=toronto&date=2026-07-20&artistId=art-marcus
 */
router.get('/', (req, res, next) => {
  try {
    const siteSlug = String(req.query.site || '').trim();
    const date = String(req.query.date || '').trim();
    const artistId = req.query.artistId ? String(req.query.artistId).trim() : null;

    if (!siteSlug) throw badRequest('Query param "site" (location slug) is required');
    if (!date || !isValidDate(date)) throw badRequest('Valid "date" (YYYY-MM-DD) is required');

    const site = db
      .prepare('SELECT * FROM sites WHERE slug = ? AND is_active = 1')
      .get(siteSlug);
    if (!site) {
      return res.status(404).json({ success: false, error: 'Location not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const requested = new Date(`${date}T12:00:00`);
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + config.bookingLeadDays);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + config.bookingHorizonDays);

    if (requested < minDate || requested > maxDate) {
      return res.json({
        success: true,
        data: {
          date,
          site: site.slug,
          open: false,
          slots: [],
          reason: 'Date outside bookable range',
        },
      });
    }

    const hours = parseHours(site.hours_json);
    const dayKey = DAY_KEYS[requested.getDay()];
    const dayHours = hours[dayKey];

    if (!dayHours || !dayHours.open || !dayHours.close) {
      return res.json({
        success: true,
        data: {
          date,
          site: site.slug,
          open: false,
          slots: [],
          reason: 'Studio closed',
        },
      });
    }

    const allSlots = generateSlots(dayHours.open, dayHours.close, config.slotDurationMinutes);
    const booked = getBookedTimes(site.id, date, artistId);
    const slots = allSlots.map((time) => ({
      time,
      available: !booked.has(time),
    }));

    res.json({
      success: true,
      data: {
        date,
        site: site.slug,
        open: true,
        hours: dayHours,
        slots,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

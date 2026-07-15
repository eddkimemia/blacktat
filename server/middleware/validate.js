'use strict';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function badRequest(message, fields) {
  const err = new Error(message);
  err.status = 400;
  if (fields) err.details = fields;
  return err;
}

function requireFields(body, fields) {
  const missing = [];
  for (const f of fields) {
    const v = body[f];
    if (v === undefined || v === null || String(v).trim() === '') missing.push(f);
  }
  if (missing.length) {
    throw badRequest(`Missing required fields: ${missing.join(', ')}`, { missing });
  }
}

function isValidEmail(email) {
  return EMAIL_RE.test(String(email || '').trim());
}

function isValidDate(isoDate) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return false;
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return (
    dt.getFullYear() === y &&
    dt.getMonth() === m - 1 &&
    dt.getDate() === d
  );
}

function isValidTime(hhmm) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(hhmm);
}

function sanitizeString(value, max = 2000) {
  return String(value || '')
    .trim()
    .slice(0, max)
    .replace(/[<>]/g, '');
}

module.exports = {
  badRequest,
  requireFields,
  isValidEmail,
  isValidDate,
  isValidTime,
  sanitizeString,
};

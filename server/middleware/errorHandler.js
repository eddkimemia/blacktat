'use strict';

function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: 'Not found',
    path: req.originalUrl,
  });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const status = err.status || err.statusCode || 500;
  const payload = {
    success: false,
    error: err.message || 'Internal server error',
  };

  if (process.env.NODE_ENV !== 'production' && err.details) {
    payload.details = err.details;
  }

  if (status >= 500) {
    console.error('[error]', err);
  }

  res.status(status).json(payload);
}

function requireAdmin(req, res, next) {
  const config = require('../config');
  const key =
    req.get('x-admin-key') ||
    (req.get('authorization') || '').replace(/^Bearer\s+/i, '') ||
    req.query.admin_key;

  if (!key || key !== config.adminApiKey) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  next();
}

module.exports = { notFound, errorHandler, requireAdmin };

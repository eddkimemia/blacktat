'use strict';

const config = require('../config');

class PaystackError extends Error {
  constructor(message, status = 502, details = null) {
    super(message);
    this.name = 'PaystackError';
    this.status = status;
    this.details = details;
  }
}

function assertConfigured() {
  if (!config.paystack.secretKey) {
    throw new PaystackError(
      'Paystack is not configured. Set PAYSTACK_SECRET_KEY in your environment.',
      503
    );
  }
}

async function paystackRequest(method, path, body) {
  assertConfigured();
  const res = await fetch(`${config.paystack.baseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${config.paystack.secretKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.status === false) {
    throw new PaystackError(
      data.message || `Paystack request failed (${res.status})`,
      res.status >= 400 && res.status < 600 ? res.status : 502,
      data
    );
  }
  return data;
}

/**
 * Initialize a Paystack transaction for a booking deposit.
 * @see https://paystack.com/docs/api/transaction/#initialize
 */
async function initializeTransaction({ email, amount, currency, reference, callbackUrl, metadata }) {
  return paystackRequest('POST', '/transaction/initialize', {
    email,
    amount,
    currency: currency || config.deposit.currency,
    reference,
    callback_url: callbackUrl,
    metadata,
  });
}

/**
 * Verify a Paystack transaction by reference.
 * @see https://paystack.com/docs/api/transaction/#verify
 */
async function verifyTransaction(reference) {
  return paystackRequest('GET', `/transaction/verify/${encodeURIComponent(reference)}`);
}

/**
 * Validate Paystack webhook signature (HMAC SHA512 of raw body).
 */
function verifyWebhookSignature(rawBody, signature) {
  const crypto = require('crypto');
  const secret = config.paystack.webhookSecret || config.paystack.secretKey;
  if (!secret || !signature) return false;
  const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(String(signature)));
  } catch {
    return false;
  }
}

module.exports = {
  PaystackError,
  initializeTransaction,
  verifyTransaction,
  verifyWebhookSignature,
};

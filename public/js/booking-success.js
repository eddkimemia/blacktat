(function () {
  'use strict';

  const statusEl = document.getElementById('verifyStatus');
  const detailEl = document.getElementById('verifyDetail');
  const refEl = document.getElementById('bookingRef');

  const params = new URLSearchParams(window.location.search);
  const reference = params.get('reference') || params.get('trxref') || '';

  if (!reference) {
    if (statusEl) statusEl.textContent = 'No payment reference found.';
    if (detailEl) {
      detailEl.textContent =
        'If you completed payment, check your email or contact the studio with your Paystack receipt.';
    }
    return;
  }

  if (refEl) refEl.textContent = reference;

  async function verify() {
    if (!window.BMI_API) {
      if (statusEl) statusEl.textContent = 'API unavailable.';
      return;
    }
    try {
      if (statusEl) statusEl.textContent = 'Verifying your deposit with Paystack…';
      const res = await window.BMI_API.verifyPayment(reference);
      const data = res.data;
      if (statusEl) {
        statusEl.textContent = data.alreadyVerified
          ? 'Appointment already confirmed'
          : 'Payment successful — appointment confirmed';
      }
      if (detailEl) {
        detailEl.innerHTML = `
          <p class="mb-2">Booking reference: <strong class="text-gold-400">${escapeHtml(data.bookingReference)}</strong></p>
          <p class="mb-2">Scheduled: <strong>${escapeHtml(data.preferredDate || '')}</strong> at <strong>${escapeHtml(data.preferredTime || '')}</strong></p>
          <p class="text-ink-400 text-sm font-light">Please arrive 10 minutes early. We will email prep instructions shortly. Bring government ID for tattoos.</p>
        `;
      }
      const icon = document.getElementById('successIcon');
      if (icon) icon.classList.remove('hidden');
    } catch (err) {
      if (statusEl) statusEl.textContent = 'Payment verification pending';
      if (detailEl) {
        detailEl.innerHTML = `
          <p class="mb-2">${escapeHtml(err.message || 'Could not verify payment yet.')}</p>
          <p class="text-sm text-ink-500">Reference: <code class="text-gold-400">${escapeHtml(reference)}</code></p>
          <p class="text-sm text-ink-500 mt-2">If you were charged, contact <a class="text-gold-400" href="mailto:hello@blackmapleink.ca">hello@blackmapleink.ca</a> with this reference. Webhooks may still confirm your booking shortly.</p>
        `;
      }
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  verify();
})();

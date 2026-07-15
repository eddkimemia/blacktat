(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const form = $('#bookingWizard');
  if (!form || !window.BMI_API) return;

  const state = {
    step: 1,
    config: null,
    fullName: '',
    email: '',
    phone: '',
    siteSlug: '',
    serviceSlug: '',
    artistSlug: '',
    preferredDate: '',
    preferredTime: '',
    vision: '',
  };

  const els = {
    steps: () => Array.from(document.querySelectorAll('.booking-step')),
    dots: () => Array.from(document.querySelectorAll('.step-dot')),
    error: $('#bookingError'),
    depositLabel: $('#depositLabel'),
    siteSelect: $('#siteSlug'),
    serviceSelect: $('#serviceSlug'),
    artistSelect: $('#artistSlug'),
    dateInput: $('#preferredDate'),
    slotsGrid: $('#slotsGrid'),
    slotsHint: $('#slotsHint'),
    reviewBox: $('#reviewBox'),
    submitBtn: $('#payDepositBtn'),
  };

  function showError(msg) {
    if (!els.error) return;
    els.error.textContent = msg || '';
    els.error.classList.toggle('hidden', !msg);
  }

  function setStep(n) {
    state.step = n;
    els.steps().forEach((step) => {
      const s = Number(step.dataset.step);
      step.classList.toggle('active', s === n);
    });
    els.dots().forEach((dot) => {
      const s = Number(dot.dataset.step);
      dot.classList.toggle('active', s === n);
      dot.classList.toggle('done', s < n);
    });
    showError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function fillSelect(select, items, valueKey, labelFn, placeholder) {
    if (!select) return;
    select.innerHTML = `<option value="">${placeholder}</option>`;
    items.forEach((item) => {
      const opt = document.createElement('option');
      opt.value = item[valueKey];
      opt.textContent = labelFn(item);
      select.appendChild(opt);
    });
  }

  function filterArtists() {
    if (!state.config) return;
    let artists = state.config.artists || [];
    if (state.siteSlug) {
      const site = (state.config.sites || []).find((s) => s.slug === state.siteSlug);
      if (site) {
        artists = artists.filter((a) => !a.siteId || a.siteId === site.id);
      }
    }
    fillSelect(
      els.artistSelect,
      artists,
      'slug',
      (a) => `${a.name} — ${a.specialty}`,
      'No preference'
    );
  }

  async function loadConfig() {
    const res = await window.BMI_API.getConfig();
    state.config = res.data;
    if (els.depositLabel) {
      els.depositLabel.textContent = state.config.deposit.label;
    }
    fillSelect(
      els.siteSelect,
      state.config.sites || [],
      'slug',
      (s) => `${s.city}, ${s.region}`,
      'Select studio location'
    );
    fillSelect(
      els.serviceSelect,
      state.config.services || [],
      'slug',
      (s) => s.name,
      'Select a service'
    );
    filterArtists();

    // Date bounds
    if (els.dateInput) {
      const lead = state.config.bookingLeadDays || 1;
      const horizon = state.config.bookingHorizonDays || 60;
      const min = new Date();
      min.setDate(min.getDate() + lead);
      const max = new Date();
      max.setDate(max.getDate() + horizon);
      els.dateInput.min = min.toISOString().slice(0, 10);
      els.dateInput.max = max.toISOString().slice(0, 10);
    }

    // Prefill from query string
    const params = new URLSearchParams(window.location.search);
    if (params.get('site') && els.siteSelect) {
      els.siteSelect.value = params.get('site');
      state.siteSlug = params.get('site');
      filterArtists();
    }
    if (params.get('service') && els.serviceSelect) {
      els.serviceSelect.value = params.get('service');
    }
    if (params.get('artist') && els.artistSelect) {
      els.artistSelect.value = params.get('artist');
    }
  }

  async function loadSlots() {
    if (!state.siteSlug || !state.preferredDate) {
      if (els.slotsGrid) els.slotsGrid.innerHTML = '';
      if (els.slotsHint) els.slotsHint.textContent = 'Select a location and date to see available times.';
      return;
    }

    if (els.slotsHint) els.slotsHint.textContent = 'Loading available times…';
    if (els.slotsGrid) els.slotsGrid.innerHTML = '';

    try {
      const artist = (state.config.artists || []).find((a) => a.slug === state.artistSlug);
      const res = await window.BMI_API.getAvailability({
        site: state.siteSlug,
        date: state.preferredDate,
        artistId: artist ? artist.id : undefined,
      });
      const data = res.data;
      if (!data.open) {
        if (els.slotsHint) els.slotsHint.textContent = data.reason || 'Studio closed on this date.';
        return;
      }
      if (els.slotsHint) {
        els.slotsHint.textContent = `Open ${data.hours.open}–${data.hours.close}. Select a time slot.`;
      }
      const grid = els.slotsGrid;
      if (!grid) return;
      data.slots.forEach((slot) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'slot-btn' + (state.preferredTime === slot.time ? ' selected' : '');
        btn.textContent = slot.time;
        btn.disabled = !slot.available;
        btn.dataset.time = slot.time;
        btn.addEventListener('click', () => {
          state.preferredTime = slot.time;
          grid.querySelectorAll('.slot-btn').forEach((b) => b.classList.remove('selected'));
          btn.classList.add('selected');
        });
        grid.appendChild(btn);
      });
    } catch (err) {
      if (els.slotsHint) els.slotsHint.textContent = err.message || 'Could not load availability.';
    }
  }

  function readStep1() {
    state.fullName = $('#fullName')?.value.trim() || '';
    state.email = $('#email')?.value.trim() || '';
    state.phone = $('#phone')?.value.trim() || '';
    if (!state.fullName || !state.email) {
      showError('Name and email are required.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
      showError('Please enter a valid email address.');
      return false;
    }
    return true;
  }

  function readStep2() {
    state.siteSlug = els.siteSelect?.value || '';
    state.serviceSlug = els.serviceSelect?.value || '';
    state.artistSlug = els.artistSelect?.value || '';
    if (!state.siteSlug || !state.serviceSlug) {
      showError('Please select a studio location and service.');
      return false;
    }
    return true;
  }

  function readStep3() {
    state.preferredDate = els.dateInput?.value || '';
    if (!state.preferredDate) {
      showError('Please choose a date.');
      return false;
    }
    if (!state.preferredTime) {
      showError('Please select an available time slot.');
      return false;
    }
    return true;
  }

  function readStep4() {
    state.vision = $('#vision')?.value.trim() || '';
    if (state.vision.length < 10) {
      showError('Tell us more about your vision (at least 10 characters).');
      return false;
    }
    return true;
  }

  function buildReview() {
    const site = (state.config.sites || []).find((s) => s.slug === state.siteSlug);
    const service = (state.config.services || []).find((s) => s.slug === state.serviceSlug);
    const artist = (state.config.artists || []).find((a) => a.slug === state.artistSlug);
    const deposit = state.config.deposit;

    if (!els.reviewBox) return;
    els.reviewBox.innerHTML = `
      <dl class="space-y-3 text-sm">
        <div class="flex justify-between gap-4"><dt class="text-ink-500">Name</dt><dd class="text-right">${escapeHtml(state.fullName)}</dd></div>
        <div class="flex justify-between gap-4"><dt class="text-ink-500">Email</dt><dd class="text-right break-all">${escapeHtml(state.email)}</dd></div>
        <div class="flex justify-between gap-4"><dt class="text-ink-500">Studio</dt><dd class="text-right">${escapeHtml(site ? site.city + ', ' + site.region : state.siteSlug)}</dd></div>
        <div class="flex justify-between gap-4"><dt class="text-ink-500">Service</dt><dd class="text-right">${escapeHtml(service ? service.name : state.serviceSlug)}</dd></div>
        <div class="flex justify-between gap-4"><dt class="text-ink-500">Artist</dt><dd class="text-right">${escapeHtml(artist ? artist.name : 'No preference')}</dd></div>
        <div class="flex justify-between gap-4"><dt class="text-ink-500">Appointment</dt><dd class="text-right">${escapeHtml(state.preferredDate)} at ${escapeHtml(state.preferredTime)}</dd></div>
        <div class="pt-3 border-t border-white/10 flex justify-between gap-4">
          <dt class="text-gold-400 font-medium">Deposit due now</dt>
          <dd class="text-gold-400 font-semibold">${escapeHtml(deposit.label)} <span class="text-ink-500 font-normal text-xs">(${deposit.currency})</span></dd>
        </div>
      </dl>
      <p class="mt-4 text-xs text-ink-500 font-light">You will complete secure payment via Paystack. Your appointment is confirmed only after the deposit is paid. The deposit is non-refundable and applies to your final balance.</p>
    `;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Navigation buttons
  form.addEventListener('click', async (e) => {
    const next = e.target.closest('[data-next]');
    const prev = e.target.closest('[data-prev]');
    if (next) {
      e.preventDefault();
      const from = Number(next.dataset.next) - 1;
      let ok = true;
      if (from === 1) ok = readStep1();
      if (from === 2) ok = readStep2();
      if (from === 3) ok = readStep3();
      if (from === 4) {
        ok = readStep4();
        if (ok) buildReview();
      }
      if (ok) setStep(Number(next.dataset.next));
    }
    if (prev) {
      e.preventDefault();
      setStep(Number(prev.dataset.prev));
    }
  });

  if (els.siteSelect) {
    els.siteSelect.addEventListener('change', () => {
      state.siteSlug = els.siteSelect.value;
      state.preferredTime = '';
      filterArtists();
      loadSlots();
    });
  }
  if (els.artistSelect) {
    els.artistSelect.addEventListener('change', () => {
      state.artistSlug = els.artistSelect.value;
      state.preferredTime = '';
      loadSlots();
    });
  }
  if (els.dateInput) {
    els.dateInput.addEventListener('change', () => {
      state.preferredDate = els.dateInput.value;
      state.preferredTime = '';
      loadSlots();
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showError('');
    if (!readStep1() || !readStep2() || !readStep3() || !readStep4()) {
      setStep(1);
      return;
    }

    const btn = els.submitBtn;
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Connecting to Paystack…';
    }

    try {
      const res = await window.BMI_API.createBooking({
        fullName: state.fullName,
        email: state.email,
        phone: state.phone,
        siteSlug: state.siteSlug,
        serviceSlug: state.serviceSlug,
        artistSlug: state.artistSlug || undefined,
        preferredDate: state.preferredDate,
        preferredTime: state.preferredTime,
        vision: state.vision,
      });

      const payment = res.data.payment;
      const booking = res.data.booking;

      if (payment && payment.authorizationUrl) {
        // Redirect to Paystack checkout — payment before visit
        window.location.href = payment.authorizationUrl;
        return;
      }

      if (payment && !payment.configured) {
        showError(
          'Booking saved (' +
            booking.reference +
            ') but Paystack is not configured on the server. Contact the studio to complete your deposit.'
        );
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Pay Deposit & Confirm';
        }
        return;
      }

      showError(
        (payment && payment.error) ||
          'Could not start payment. Your booking reference is ' +
            (booking && booking.reference) +
            '. Please try again or contact the studio.'
      );
    } catch (err) {
      showError(err.message || 'Booking failed. Please try again.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Pay Deposit & Confirm';
      }
    }
  });

  loadConfig().catch((err) => {
    showError(err.message || 'Could not load booking configuration.');
  });

  setStep(1);
})();

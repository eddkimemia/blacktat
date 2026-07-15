(function (global) {
  'use strict';

  const base = () => (global.BMI_CONFIG && global.BMI_CONFIG.apiBase) || '';

  async function request(path, options = {}) {
    const url = `${base()}${path}`;
    const headers = {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    };

    const res = await fetch(url, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    let data = null;
    const text = await res.text();
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { success: false, error: text || 'Invalid response' };
    }

    if (!res.ok) {
      const err = new Error((data && data.error) || `Request failed (${res.status})`);
      err.status = res.status;
      err.payload = data;
      throw err;
    }
    return data;
  }

  global.BMI_API = {
    getConfig: () => request('/api/config'),
    getSites: () => request('/api/sites'),
    getSite: (slug) => request(`/api/sites/${encodeURIComponent(slug)}`),
    getAvailability: ({ site, date, artistId }) => {
      const q = new URLSearchParams({ site, date });
      if (artistId) q.set('artistId', artistId);
      return request(`/api/availability?${q}`);
    },
    createBooking: (payload) =>
      request('/api/bookings', { method: 'POST', body: payload }),
    getBooking: (reference) =>
      request(`/api/bookings/${encodeURIComponent(reference)}`),
    verifyPayment: (reference) =>
      request(`/api/payments/verify?reference=${encodeURIComponent(reference)}`),
    submitConsultation: (payload) =>
      request('/api/consultations', { method: 'POST', body: payload }),
    submitContact: (payload) =>
      request('/api/contact', { method: 'POST', body: payload }),
    admin: {
      stats: (key) => request('/api/admin/stats', { headers: { 'x-admin-key': key } }),
      bookings: (key, status) => {
        const q = status ? `?status=${encodeURIComponent(status)}` : '';
        return request(`/api/admin/bookings${q}`, { headers: { 'x-admin-key': key } });
      },
      updateBooking: (key, id, body) =>
        request(`/api/admin/bookings/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          headers: { 'x-admin-key': key },
          body,
        }),
      consultations: (key) =>
        request('/api/admin/consultations', { headers: { 'x-admin-key': key } }),
      messages: (key) =>
        request('/api/admin/messages', { headers: { 'x-admin-key': key } }),
    },
  };
})(window);

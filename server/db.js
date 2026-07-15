'use strict';

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const config = require('./config');

const dataDir = path.dirname(config.dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(config.dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sites (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      region TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT 'CA',
      postal_code TEXT,
      street TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      timezone TEXT NOT NULL DEFAULT 'America/Toronto',
      map_embed TEXT,
      hours_json TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      seo_title TEXT,
      seo_description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS artists (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      specialty TEXT NOT NULL,
      bio TEXT,
      image_url TEXT,
      site_id TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (site_id) REFERENCES sites(id)
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'tattoo',
      description TEXT,
      min_price_label TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      reference TEXT NOT NULL UNIQUE,
      site_id TEXT NOT NULL,
      service_id TEXT NOT NULL,
      artist_id TEXT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      vision TEXT NOT NULL,
      preferred_date TEXT NOT NULL,
      preferred_time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending_payment',
      deposit_amount INTEGER NOT NULL,
      deposit_currency TEXT NOT NULL,
      paystack_reference TEXT,
      paystack_access_code TEXT,
      paid_at TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (site_id) REFERENCES sites(id),
      FOREIGN KEY (service_id) REFERENCES services(id),
      FOREIGN KEY (artist_id) REFERENCES artists(id)
    );

    CREATE TABLE IF NOT EXISTS consultations (
      id TEXT PRIMARY KEY,
      site_id TEXT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      service_slug TEXT,
      artist_slug TEXT,
      vision TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (site_id) REFERENCES sites(id)
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      site_id TEXT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL,
      paystack_reference TEXT NOT NULL UNIQUE,
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'initialized',
      channel TEXT,
      paid_at TEXT,
      raw_json TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (booking_id) REFERENCES bookings(id)
    );

    CREATE INDEX IF NOT EXISTS idx_bookings_site_date ON bookings(site_id, preferred_date, preferred_time);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
    CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);
    CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
  `);
}

function seed() {
  const siteCount = db.prepare('SELECT COUNT(*) AS c FROM sites').get().c;
  if (siteCount > 0) return { seeded: false, reason: 'already seeded' };

  const hoursToronto = JSON.stringify({
    mon: null,
    tue: { open: '11:00', close: '20:00' },
    wed: { open: '11:00', close: '20:00' },
    thu: { open: '11:00', close: '20:00' },
    fri: { open: '11:00', close: '20:00' },
    sat: { open: '10:00', close: '20:00' },
    sun: { open: '11:00', close: '18:00' },
  });
  const hoursVancouver = JSON.stringify({
    mon: null,
    tue: { open: '11:00', close: '19:00' },
    wed: { open: '11:00', close: '19:00' },
    thu: { open: '11:00', close: '19:00' },
    fri: { open: '11:00', close: '20:00' },
    sat: { open: '10:00', close: '18:00' },
    sun: null,
  });
  const hoursCalgary = JSON.stringify({
    mon: null,
    tue: { open: '12:00', close: '20:00' },
    wed: { open: '12:00', close: '20:00' },
    thu: { open: '12:00', close: '20:00' },
    fri: { open: '12:00', close: '20:00' },
    sat: { open: '11:00', close: '18:00' },
    sun: null,
  });

  const insertSite = db.prepare(`
    INSERT INTO sites (id, slug, name, city, region, country, postal_code, street, phone, email, timezone, hours_json, seo_title, seo_description)
    VALUES (@id, @slug, @name, @city, @region, @country, @postal_code, @street, @phone, @email, @timezone, @hours_json, @seo_title, @seo_description)
  `);

  const sites = [
    {
      id: 'site-toronto',
      slug: 'toronto',
      name: 'Black Maple Ink — Toronto',
      city: 'Toronto',
      region: 'ON',
      country: 'CA',
      postal_code: 'M6J 1J6',
      street: '1247 Queen Street West',
      phone: '+1-416-555-0199',
      email: 'toronto@blackmapleink.ca',
      timezone: 'America/Toronto',
      hours_json: hoursToronto,
      seo_title: 'Luxury Tattoo Studio Toronto | Black Maple Ink Queen West',
      seo_description:
        'Book custom tattoos and professional piercings at Black Maple Ink Toronto. Private suites, hospital-grade hygiene, award-winning artists on Queen Street West.',
    },
    {
      id: 'site-vancouver',
      slug: 'vancouver',
      name: 'Black Maple Ink — Vancouver',
      city: 'Vancouver',
      region: 'BC',
      country: 'CA',
      postal_code: 'V6B 1A1',
      street: '88 West Cordova Street',
      phone: '+1-604-555-0142',
      email: 'vancouver@blackmapleink.ca',
      timezone: 'America/Vancouver',
      hours_json: hoursVancouver,
      seo_title: 'Luxury Tattoo Studio Vancouver | Black Maple Ink',
      seo_description:
        'Vancouver flagship of Black Maple Ink. Fine line, black & grey, color realism, and piercing — book your consultation online before your visit.',
    },
    {
      id: 'site-calgary',
      slug: 'calgary',
      name: 'Black Maple Ink — Calgary',
      city: 'Calgary',
      region: 'AB',
      country: 'CA',
      postal_code: 'T2P 1J9',
      street: '220 8 Avenue SW',
      phone: '+1-403-555-0177',
      email: 'calgary@blackmapleink.ca',
      timezone: 'America/Edmonton',
      hours_json: hoursCalgary,
      seo_title: 'Luxury Tattoo Studio Calgary | Black Maple Ink',
      seo_description:
        'Calgary studio of Black Maple Ink. Custom tattoo artistry and professional piercing with deposits secured online via Paystack.',
    },
  ];

  const insertArtist = db.prepare(`
    INSERT INTO artists (id, slug, name, specialty, bio, image_url, site_id, sort_order)
    VALUES (@id, @slug, @name, @specialty, @bio, @image_url, @site_id, @sort_order)
  `);

  const artists = [
    {
      id: 'art-marcus',
      slug: 'marcus-chen',
      name: 'Marcus Chen',
      specialty: 'Realism & Large-Scale',
      bio: 'Specialist in photorealism and full-sleeve narratives with over a decade of studio leadership.',
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80&auto=format&fit=crop',
      site_id: 'site-toronto',
      sort_order: 1,
    },
    {
      id: 'art-sofia',
      slug: 'sofia-reyes',
      name: 'Sofia Reyes',
      specialty: 'Color Realism',
      bio: 'Vibrant color work and portraiture with a fine-art foundation.',
      image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80&auto=format&fit=crop',
      site_id: 'site-toronto',
      sort_order: 2,
    },
    {
      id: 'art-kai',
      slug: 'kai-tanaka',
      name: 'Kai Tanaka',
      specialty: 'Japanese & Blackwork',
      bio: 'Traditional Japanese motifs reimagined with modern blackwork precision.',
      image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&q=80&auto=format&fit=crop',
      site_id: 'site-vancouver',
      sort_order: 3,
    },
    {
      id: 'art-elena',
      slug: 'elena-voss',
      name: 'Elena Voss',
      specialty: 'Black & Grey & Geometric',
      bio: 'Architectural geometry and soft black & grey shading.',
      image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80&auto=format&fit=crop',
      site_id: 'site-calgary',
      sort_order: 4,
    },
  ];

  const insertService = db.prepare(`
    INSERT INTO services (id, slug, name, category, description, min_price_label, sort_order)
    VALUES (@id, @slug, @name, @category, @description, @min_price_label, @sort_order)
  `);

  const services = [
    { id: 'svc-sleeve', slug: 'sleeve', name: 'Custom Sleeve Tattoo', category: 'tattoo', description: 'Full or half-sleeve custom compositions.', min_price_label: 'From $800+', sort_order: 1 },
    { id: 'svc-fineline', slug: 'fineline', name: 'Fine Line Tattoo', category: 'tattoo', description: 'Delicate single-needle and micro detail work.', min_price_label: 'From $150', sort_order: 2 },
    { id: 'svc-bngrey', slug: 'bngrey', name: 'Black & Grey', category: 'tattoo', description: 'Classic black & grey realism and illustrative work.', min_price_label: 'From $250', sort_order: 3 },
    { id: 'svc-color', slug: 'color', name: 'Color Realism', category: 'tattoo', description: 'Vivid color realism and portraiture.', min_price_label: 'From $300', sort_order: 4 },
    { id: 'svc-portrait', slug: 'portrait', name: 'Portrait Tattoo', category: 'tattoo', description: 'Photorealistic portraits of people and pets.', min_price_label: 'From $400', sort_order: 5 },
    { id: 'svc-japanese', slug: 'japanese', name: 'Japanese Style', category: 'tattoo', description: 'Irezumi-inspired traditional and neo-Japanese.', min_price_label: 'From $350', sort_order: 6 },
    { id: 'svc-minimalist', slug: 'minimalist', name: 'Minimalist Tattoo', category: 'tattoo', description: 'Clean, intentional small-scale designs.', min_price_label: 'From $150', sort_order: 7 },
    { id: 'svc-coverup', slug: 'coverup', name: 'Cover-Up', category: 'tattoo', description: 'Thoughtful redesigns over existing work.', min_price_label: 'From $400', sort_order: 8 },
    { id: 'svc-piercing', slug: 'piercing', name: 'Professional Piercing', category: 'piercing', description: 'Hospital-grade piercing with premium jewelry.', min_price_label: 'From $80', sort_order: 9 },
  ];

  const tx = db.transaction(() => {
    for (const s of sites) insertSite.run(s);
    for (const a of artists) insertArtist.run(a);
    for (const s of services) insertService.run(s);
  });
  tx();

  return { seeded: true, sites: sites.length, artists: artists.length, services: services.length };
}

migrate();
const seedResult = seed();

if (require.main === module) {
  console.log('Database ready:', config.dbPath);
  console.log('Seed:', seedResult);
}

module.exports = { db, migrate, seed };

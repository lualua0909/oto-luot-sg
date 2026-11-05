-- Cloudflare D1 schema for Ô tô Lướt Sài Gòn (replaces Firestore).
-- Each table keeps the full record as JSON in `data`; the other columns exist for
-- lookups and sorting. Apply with: node scripts/migrate-firestore-to-d1.mjs (creates them).
CREATE TABLE IF NOT EXISTS cars (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  brand TEXT NOT NULL,
  is_featured INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  data TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS cars_created ON cars(created_at DESC);
CREATE INDEX IF NOT EXISTS cars_brand_created ON cars(brand, created_at DESC);
CREATE INDEX IF NOT EXISTS cars_featured_created ON cars(is_featured, created_at DESC);
CREATE TABLE IF NOT EXISTS news (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  is_published INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  data TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS news_created ON news(created_at DESC);
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  data TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS leads_created ON leads(created_at DESC);
CREATE TABLE IF NOT EXISTS brands (
  slug TEXT PRIMARY KEY,
  sort INTEGER NOT NULL DEFAULT 0,
  data TEXT NOT NULL
);
-- Single documents: settings 'showroom', content 'site'.
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS content (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL
);
-- Firebase Auth accounts and their role: 0 = root, 1 = admin, 2 = user.
CREATE TABLE IF NOT EXISTS users (
  uid TEXT PRIMARY KEY,
  email TEXT NOT NULL DEFAULT '',
  role INTEGER NOT NULL DEFAULT 2,
  created_at INTEGER NOT NULL
);

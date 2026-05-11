CREATE TABLE IF NOT EXISTS listings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brand        VARCHAR(50)  NOT NULL,
  model        VARCHAR(80)  NOT NULL,
  year         INTEGER,
  price        INTEGER      NOT NULL,
  vehicle_type VARCHAR(50),
  description  TEXT,
  status       VARCHAR(20)  NOT NULL DEFAULT 'active'
               CHECK (status IN ('active', 'paused', 'sold')),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CHECK (price > 0),
  CHECK (year IS NULL OR (year >= 1900 AND year <= 2100))
);

CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);

CREATE TABLE IF NOT EXISTS listing_photos (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  position   INTEGER NOT NULL DEFAULT 0,
  UNIQUE (listing_id, position)
);

CREATE INDEX IF NOT EXISTS idx_listing_photos_listing ON listing_photos(listing_id);

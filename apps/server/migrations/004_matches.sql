-- Swipes: cada interacción del comprador sobre un listing.
CREATE TABLE IF NOT EXISTS swipes (
  buyer_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  direction  VARCHAR(10) NOT NULL CHECK (direction IN ('like', 'pass')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (buyer_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_swipes_buyer ON swipes(buyer_id);

-- Matches: se crea automáticamente cuando un buyer hace swipe 'like'
-- sobre un listing activo. Un buyer puede tener máximo un match por
-- listing (la UNIQUE lo garantiza).
CREATE TABLE IF NOT EXISTS matches (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (buyer_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_buyer ON matches(buyer_id);
CREATE INDEX IF NOT EXISTS idx_matches_listing ON matches(listing_id);

-- Mensajes del chat directo entre buyer y seller de un match.
CREATE TABLE IF NOT EXISTS messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id   UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (length(trim(body)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_messages_match ON messages(match_id, created_at);

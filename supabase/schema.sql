-- users (Auth is handled by Supabase Auth, but we need a public profile table)
CREATE TABLE users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT UNIQUE NOT NULL,
  display_name  TEXT,
  avatar_url    TEXT,
  bio           TEXT,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- RLS setup for users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- items
CREATE TABLE items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  genre           TEXT NOT NULL,          -- 'book' | 'game' | 'gadget' | 'fashion' | 'other'
  description     TEXT,
  image_url       TEXT,
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  rating_average  FLOAT DEFAULT 0,
  rating_count    INTEGER DEFAULT 0,
  created_at      TIMESTAMP DEFAULT NOW()
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Items are viewable by everyone" ON items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert items" ON items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- user_items
CREATE TABLE user_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id          UUID REFERENCES items(id) ON DELETE CASCADE,
  purchased_at     DATE NOT NULL,
  purchased_at_approx TEXT,                 -- 'exact' | 'month' | 'year' | 'over1y' | 'over3y' | 'over5y'
  is_still_using   BOOLEAN DEFAULT TRUE,
  last_used_at     TIMESTAMP DEFAULT NOW(),
  influence_score  INTEGER DEFAULT 0,
  score_rank       TEXT DEFAULT '新鮮',
  created_at       TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

ALTER TABLE user_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User items are viewable by everyone" ON user_items FOR SELECT USING (true);
CREATE POLICY "Users can insert own user_items" ON user_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own user_items" ON user_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own user_items" ON user_items FOR DELETE USING (auth.uid() = user_id);

-- reviews
CREATE TABLE reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_item_id    UUID REFERENCES user_items(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id         UUID REFERENCES items(id) ON DELETE CASCADE,
  body            TEXT NOT NULL,
  rating          INTEGER CHECK (rating BETWEEN 1 AND 5),
  days_elapsed    INTEGER NOT NULL,
  stage           TEXT NOT NULL,            -- 'day1' | 'week1' | 'month1' | 'month3' | 'month6' | 'year1' | 'beyond' | 'retired'
  images          TEXT[],
  published_at    TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_item_id, stage)               -- One review per stage (except maybe retired, but we can handle that logic in app)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- still_using_logs
CREATE TABLE still_using_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_item_id  UUID REFERENCES user_items(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id       UUID REFERENCES items(id) ON DELETE CASCADE,
  days_elapsed  INTEGER NOT NULL,
  logged_at     TIMESTAMP DEFAULT NOW()
);

ALTER TABLE still_using_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Still using logs are viewable by everyone" ON still_using_logs FOR SELECT USING (true);
CREATE POLICY "Users can insert own logs" ON still_using_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- feed_events
CREATE TABLE feed_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id       UUID REFERENCES items(id) ON DELETE CASCADE,
  event_type    TEXT NOT NULL,  -- 'review_posted' | 'retired' | 'still_using_milestone'
  target_id     UUID,           -- polymorphic reference
  created_at    TIMESTAMP DEFAULT NOW()
);

ALTER TABLE feed_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Feed events are viewable by everyone" ON feed_events FOR SELECT USING (true);
CREATE POLICY "Users can insert own feed events" ON feed_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- trigger for updating items.rating_average (simplified version, can also be done via API)
-- We'll rely on the Next.js API to update rating_average for now as specified in the design doc,
-- but creating a Supabase function would be more robust. We'll stick to API for MVP.

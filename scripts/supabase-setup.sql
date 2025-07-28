-- Create the main invites table with enhanced features
CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_data JSONB NOT NULL,
  generated_code TEXT NOT NULL,
  user_email TEXT,
  view_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invites_created_at ON invites(created_at);
CREATE INDEX IF NOT EXISTS idx_invites_updated_at ON invites(updated_at);
CREATE INDEX IF NOT EXISTS idx_invites_user_email ON invites(user_email);
CREATE INDEX IF NOT EXISTS idx_invites_is_active ON invites(is_active);
CREATE INDEX IF NOT EXISTS idx_invites_view_count ON invites(view_count);

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(invite_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE invites 
  SET view_count = view_count + 1
  WHERE id = invite_id AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get popular invites
CREATE OR REPLACE FUNCTION get_popular_invites(limit_count INT DEFAULT 10)
RETURNS TABLE (
  id UUID,
  event_title TEXT,
  event_date DATE,
  view_count INT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.form_data->>'eventTitle' as event_title,
    (i.form_data->>'eventDate')::DATE as event_date,
    i.view_count,
    i.created_at
  FROM invites i
  WHERE i.is_active = true
    AND i.created_at > NOW() - INTERVAL '30 days'
  ORDER BY i.view_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get upcoming events
CREATE OR REPLACE FUNCTION get_upcoming_events(days_ahead INT DEFAULT 30)
RETURNS TABLE (
  id UUID,
  event_title TEXT,
  event_date DATE,
  event_time TIME,
  venue_name TEXT,
  days_until INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.form_data->>'eventTitle' as event_title,
    (i.form_data->>'eventDate')::DATE as event_date,
    (i.form_data->>'eventTime')::TIME as event_time,
    i.form_data->>'venue' as venue_name,
    ((i.form_data->>'eventDate')::DATE - CURRENT_DATE)::INT as days_until
  FROM invites i
  WHERE i.is_active = true
    AND (i.form_data->>'eventDate')::DATE >= CURRENT_DATE
    AND (i.form_data->>'eventDate')::DATE <= CURRENT_DATE + days_ahead
  ORDER BY event_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to search invites
CREATE OR REPLACE FUNCTION search_invites(search_term TEXT)
RETURNS TABLE (
  id UUID,
  event_title TEXT,
  event_description TEXT,
  event_date DATE,
  relevance FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.form_data->>'eventTitle' as event_title,
    i.form_data->>'eventDescription' as event_description,
    (i.form_data->>'eventDate')::DATE as event_date,
    ts_rank(
      to_tsvector('english', 
        COALESCE(i.form_data->>'eventTitle', '') || ' ' || 
        COALESCE(i.form_data->>'eventDescription', '')
      ),
      plainto_tsquery('english', search_term)
    ) as relevance
  FROM invites i
  WHERE i.is_active = true
    AND (
      i.form_data->>'eventTitle' ILIKE '%' || search_term || '%' OR
      i.form_data->>'eventDescription' ILIKE '%' || search_term || '%'
    )
  ORDER BY relevance DESC, i.created_at DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_invites_search ON invites 
USING gin(to_tsvector('english', 
  COALESCE(form_data->>'eventTitle', '') || ' ' || 
  COALESCE(form_data->>'eventDescription', '')
));

-- Enable Row Level Security
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone can view active invites" ON invites;
DROP POLICY IF EXISTS "Anyone can create invites" ON invites;
DROP POLICY IF EXISTS "Users can update their own invites" ON invites;
DROP POLICY IF EXISTS "Users can soft delete their own invites" ON invites;

-- Policy: Anyone can view active invites
CREATE POLICY "Anyone can view active invites"
  ON invites FOR SELECT
  USING (is_active = true);

-- Policy: Anyone can create invites (for public access)
CREATE POLICY "Anyone can create invites"
  ON invites FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update their own invites (if user_email matches)
CREATE POLICY "Users can update their own invites"
  ON invites FOR UPDATE
  USING (user_email = current_setting('request.jwt.claims', true)::json->>'email')
  WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Policy: Users can soft delete their own invites
CREATE POLICY "Users can soft delete their own invites"
  ON invites FOR UPDATE
  USING (
    user_email = current_setting('request.jwt.claims', true)::json->>'email' AND
    is_active = true
  )
  WITH CHECK (
    user_email = current_setting('request.jwt.claims', true)::json->>'email' AND
    is_active = false
  );

-- Create materialized view for analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS invite_daily_stats AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as invites_created,
  COUNT(DISTINCT user_email) as unique_users,
  AVG(view_count) as avg_views,
  MAX(view_count) as max_views,
  COUNT(*) FILTER (WHERE view_count > 10) as viral_invites
FROM invites
WHERE is_active = true
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_invite_daily_stats_date ON invite_daily_stats(date);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_invite_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY invite_daily_stats;
END;
$$ LANGUAGE plpgsql;

-- Function to get invite statistics
CREATE OR REPLACE FUNCTION get_invite_statistics()
RETURNS TABLE (
  total_invites BIGINT,
  total_views BIGINT,
  active_invites BIGINT,
  unique_users BIGINT,
  avg_views_per_invite NUMERIC,
  most_popular_event_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_invites,
    SUM(view_count)::BIGINT as total_views,
    COUNT(*) FILTER (WHERE is_active = true)::BIGINT as active_invites,
    COUNT(DISTINCT user_email)::BIGINT as unique_users,
    AVG(view_count)::NUMERIC(10,2) as avg_views_per_invite,
    MODE() WITHIN GROUP (ORDER BY form_data->>'eventTheme') as most_popular_event_type
  FROM invites;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-cleanup old invites
CREATE OR REPLACE FUNCTION auto_cleanup_old_invites()
RETURNS void AS $$
BEGIN
  -- Delete invites that have been inactive for more than 90 days
  DELETE FROM invites
  WHERE is_active = false 
    AND updated_at < NOW() - INTERVAL '90 days';
    
  -- Delete invites that are active but older than 1 year with no views
  UPDATE invites
  SET is_active = false
  WHERE is_active = true
    AND created_at < NOW() - INTERVAL '1 year'
    AND view_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_invites_updated_at ON invites;
CREATE TRIGGER update_invites_updated_at
    BEFORE UPDATE ON invites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

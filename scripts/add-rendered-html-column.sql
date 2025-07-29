-- Add rendered_html column to invites table
-- This migration adds server-side rendered HTML support to the invites table

-- Add the new column
ALTER TABLE invites ADD COLUMN IF NOT EXISTS rendered_html TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN invites.rendered_html IS 'Server-side rendered HTML version of the invite for improved performance and reliability';

-- Update the RLS policies to include the new column (they already cover all columns via SELECT)
-- No changes needed to existing policies as they use wildcard selection

-- Optional: Create an index if we ever need to search through HTML content
-- CREATE INDEX IF NOT EXISTS idx_invites_rendered_html_length ON invites((length(rendered_html)));

-- Migration complete
SELECT 'Migration completed: added rendered_html column to invites table' as status;
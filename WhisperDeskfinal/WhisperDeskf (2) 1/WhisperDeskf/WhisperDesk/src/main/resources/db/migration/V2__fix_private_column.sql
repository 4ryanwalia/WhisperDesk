-- Drop the existing private column if it exists
ALTER TABLE complaints DROP COLUMN IF EXISTS private;

-- Add the private column with correct type
ALTER TABLE complaints ADD COLUMN private BIT(1) NOT NULL DEFAULT 0; 
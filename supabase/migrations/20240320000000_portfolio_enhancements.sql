-- Enable video extensions
CREATE EXTENSION IF NOT EXISTS "vector";

-- Add new columns to works table
ALTER TABLE works ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE works ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE works ADD COLUMN IF NOT EXISTS before_image TEXT;
ALTER TABLE works ADD COLUMN IF NOT EXISTS after_image TEXT;
ALTER TABLE works ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE works ADD COLUMN IF NOT EXISTS custom_url_slug TEXT UNIQUE;

-- Create function to generate unique slug
CREATE OR REPLACE FUNCTION generate_unique_slug(title TEXT) 
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  new_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Convert title to lowercase and replace spaces/special chars with hyphens
  base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'));
  new_slug := base_slug;
  
  -- Keep checking until we find a unique slug
  WHILE EXISTS (SELECT 1 FROM works WHERE custom_url_slug = new_slug) LOOP
    counter := counter + 1;
    new_slug := base_slug || '-' || counter::TEXT;
  END LOOP;
  
  RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate slug
CREATE OR REPLACE FUNCTION set_custom_url_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.custom_url_slug IS NULL THEN
    NEW.custom_url_slug := generate_unique_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS works_set_slug ON works;
CREATE TRIGGER works_set_slug
  BEFORE INSERT ON works
  FOR EACH ROW
  EXECUTE FUNCTION set_custom_url_slug();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_works_is_featured ON works(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_works_custom_url_slug ON works(custom_url_slug);
CREATE INDEX IF NOT EXISTS idx_works_sort_order ON works(sort_order);

-- Update RLS policies
ALTER TABLE works ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public works are viewable by everyone" ON works;
DROP POLICY IF EXISTS "Artists can insert their own works" ON works;
DROP POLICY IF EXISTS "Artists can update their own works" ON works;

-- Create new policies
CREATE POLICY "Public works are viewable by everyone"
  ON works FOR SELECT
  USING (status = 'active');

CREATE POLICY "Artists can insert their own works"
  ON works FOR INSERT
  WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Artists can update their own works"
  ON works FOR UPDATE
  USING (auth.uid() = artist_id)
  WITH CHECK (auth.uid() = artist_id); 
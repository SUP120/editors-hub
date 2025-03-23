-- Add is_deleted column to works table for soft deletes
ALTER TABLE works
ADD COLUMN is_deleted boolean DEFAULT false;

-- Update the existing select policy to exclude deleted works
DROP POLICY IF EXISTS "Public works are viewable by everyone" ON works;
CREATE POLICY "Public works are viewable by everyone"
  ON works FOR SELECT
  USING (is_deleted = false);

-- Add delete policy for works
CREATE POLICY "Artists can delete own works"
  ON works FOR DELETE
  USING (auth.uid() = artist_id);

-- Create function to handle work deletion
CREATE OR REPLACE FUNCTION handle_work_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Instead of actually deleting the record, update is_deleted to true
  UPDATE works
  SET 
    is_deleted = true,
    updated_at = NOW(),
    status = 'deleted'
  WHERE id = OLD.id;
  
  -- Cancel the actual deletion
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for work deletion
CREATE TRIGGER before_work_delete
  BEFORE DELETE ON works
  FOR EACH ROW
  EXECUTE FUNCTION handle_work_deletion();

-- Function to permanently delete works (admin only)
CREATE OR REPLACE FUNCTION permanently_delete_work(work_id UUID, admin_id UUID)
RETURNS void AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Check if the user is an admin
  SELECT is_admin INTO is_admin FROM profiles WHERE id = admin_id;
  
  IF is_admin THEN
    -- Permanently delete the work
    DELETE FROM works WHERE id = work_id;
  ELSE
    RAISE EXCEPTION 'Only administrators can permanently delete works';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for active works
CREATE OR REPLACE VIEW active_works AS
SELECT *
FROM works
WHERE is_deleted = false AND status = 'active'; 
-- Create a function to update pending amount
CREATE OR REPLACE FUNCTION update_pending_amount(artist_id UUID, amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE artist_earnings
  SET pending_amount = pending_amount - amount
  WHERE artist_id = $1;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER; 
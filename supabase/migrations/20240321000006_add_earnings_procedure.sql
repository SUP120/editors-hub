-- Create function to update artist earnings
CREATE OR REPLACE FUNCTION update_artist_earnings(
  p_order_id UUID,
  p_artist_id UUID,
  p_amount DECIMAL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_timestamp TIMESTAMPTZ := NOW();
BEGIN
  -- First, create or update the artist_earnings record
  INSERT INTO artist_earnings (
    artist_id,
    total_earned,
    pending_amount,
    created_at,
    updated_at
  ) VALUES (
    p_artist_id,
    p_amount,
    p_amount,
    v_timestamp,
    v_timestamp
  )
  ON CONFLICT (artist_id) DO UPDATE
  SET
    total_earned = artist_earnings.total_earned + p_amount,
    pending_amount = artist_earnings.pending_amount + p_amount,
    updated_at = v_timestamp;

  -- Then, create a transaction record
  INSERT INTO earnings_transactions (
    artist_id,
    amount,
    transaction_type,
    description,
    reference_id,
    created_at
  ) VALUES (
    p_artist_id,
    p_amount,
    'credit',
    'Earnings from completed order',
    p_order_id,
    v_timestamp
  );
END;
$$; 
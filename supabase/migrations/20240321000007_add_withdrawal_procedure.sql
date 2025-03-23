-- Create function to handle withdrawal requests
CREATE OR REPLACE FUNCTION request_withdrawal(
  p_artist_id UUID,
  p_amount NUMERIC,
  p_payment_type TEXT
)
RETURNS VOID AS $$
DECLARE
  v_current_balance NUMERIC;
BEGIN
  -- Get current balance
  SELECT current_balance INTO v_current_balance
  FROM artist_wallet
  WHERE artist_id = p_artist_id;

  -- Check if balance is sufficient
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Create withdrawal request
  INSERT INTO payment_requests (
    artist_id,
    amount,
    status,
    payment_type,
    requested_at
  ) VALUES (
    p_artist_id,
    p_amount,
    'pending',
    p_payment_type,
    NOW()
  );

  -- Update wallet balance
  UPDATE artist_wallet
  SET 
    current_balance = current_balance - p_amount,
    last_updated = NOW()
  WHERE artist_id = p_artist_id;

  -- Record transaction
  INSERT INTO transaction_history (
    artist_id,
    amount,
    type,
    description,
    created_at
  ) VALUES (
    p_artist_id,
    p_amount,
    'debit',
    'Withdrawal request',
    NOW()
  );
END;
$$ LANGUAGE plpgsql; 
-- Drop existing foreign key constraints
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_work_id_fkey;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_artist_id_fkey;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_client_id_fkey;

-- Recreate constraints with ON DELETE SET NULL
ALTER TABLE orders 
  ADD CONSTRAINT orders_work_id_fkey 
  FOREIGN KEY (work_id) 
  REFERENCES works(id) 
  ON DELETE SET NULL;

-- Add transaction history table
CREATE TABLE IF NOT EXISTS transaction_history (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  artist_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('credit', 'debit')),
  description text,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Add wallet table
CREATE TABLE IF NOT EXISTS artist_wallet (
  artist_id uuid REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  current_balance numeric DEFAULT 0,
  total_earned numeric DEFAULT 0,
  last_updated timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create function to handle earnings
CREATE OR REPLACE FUNCTION handle_artist_earnings()
RETURNS TRIGGER AS $$
BEGIN
  -- If order is completed and payment is completed
  IF NEW.status = 'completed' AND NEW.payment_status = 'completed' AND 
     (OLD.status != 'completed' OR OLD.payment_status != 'completed') THEN
    
    -- Insert into transaction history
    INSERT INTO transaction_history (
      artist_id,
      amount,
      type,
      description,
      order_id
    ) VALUES (
      NEW.artist_id,
      NEW.total_amount - 4, -- Subtract platform fee
      'credit',
      'Order completion payment',
      NEW.id
    );

    -- Update wallet
    INSERT INTO artist_wallet (artist_id, current_balance, total_earned)
    VALUES (
      NEW.artist_id,
      NEW.total_amount - 4,
      NEW.total_amount - 4
    )
    ON CONFLICT (artist_id) DO UPDATE
    SET 
      current_balance = artist_wallet.current_balance + (NEW.total_amount - 4),
      total_earned = artist_wallet.total_earned + (NEW.total_amount - 4),
      last_updated = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for earnings
DROP TRIGGER IF EXISTS handle_earnings ON orders;
CREATE TRIGGER handle_earnings
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_artist_earnings();

-- Add RLS policies
ALTER TABLE transaction_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_wallet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON transaction_history FOR SELECT
  USING (auth.uid() = artist_id);

CREATE POLICY "System can insert transactions"
  ON transaction_history FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own wallet"
  ON artist_wallet FOR SELECT
  USING (auth.uid() = artist_id);

CREATE POLICY "System can manage wallets"
  ON artist_wallet FOR ALL
  USING (true)
  WITH CHECK (true);

-- Migrate existing data
INSERT INTO artist_wallet (artist_id, current_balance, total_earned)
SELECT 
  artist_id,
  COALESCE(SUM(total_amount - 4), 0),
  COALESCE(SUM(total_amount - 4), 0)
FROM orders
WHERE status = 'completed' AND payment_status = 'completed'
GROUP BY artist_id
ON CONFLICT (artist_id) DO UPDATE
SET 
  current_balance = EXCLUDED.current_balance,
  total_earned = EXCLUDED.total_earned,
  last_updated = NOW();

INSERT INTO transaction_history (artist_id, amount, type, description, order_id)
SELECT 
  artist_id,
  total_amount - 4,
  'credit',
  'Order completion payment (migrated)',
  id
FROM orders
WHERE status = 'completed' AND payment_status = 'completed'; 
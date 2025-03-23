-- First, drop the dependent policies
DROP POLICY IF EXISTS "Artists can update payment status" ON orders;

-- Drop existing payment-related columns
ALTER TABLE orders
DROP COLUMN IF EXISTS payment_status CASCADE,
DROP COLUMN IF EXISTS payment_session_id CASCADE,
DROP COLUMN IF EXISTS payment_reference CASCADE,
DROP COLUMN IF EXISTS payment_mode CASCADE,
DROP COLUMN IF EXISTS payment_time CASCADE,
DROP COLUMN IF EXISTS amount CASCADE;

-- Add the columns again with the correct structure
ALTER TABLE orders
ADD COLUMN payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
ADD COLUMN payment_session_id text,
ADD COLUMN payment_reference text,
ADD COLUMN payment_mode text,
ADD COLUMN payment_time timestamp with time zone,
ADD COLUMN amount numeric(10,2) NOT NULL DEFAULT 0;

-- Recreate the policy for artists to update payment status
CREATE POLICY "Artists can update payment status" ON orders
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT artist_id FROM works WHERE id = orders.work_id
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT artist_id FROM works WHERE id = orders.work_id
  )
); 
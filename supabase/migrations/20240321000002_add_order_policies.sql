-- Enable RLS for orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow artists to view their own orders
CREATE POLICY "Artists can view their own orders"
ON orders FOR SELECT
TO authenticated
USING (artist_id = auth.uid());

-- Allow artists to update their own orders' payment status
CREATE POLICY "Artists can update their orders payment status"
ON orders FOR UPDATE
TO authenticated
USING (artist_id = auth.uid())
WITH CHECK (
  artist_id = auth.uid() AND
  (OLD.status = 'completed' AND NEW.status = OLD.status) AND
  ((OLD.payment_status = 'completed' AND NEW.payment_status = 'transferred') OR
   (OLD.payment_status = NEW.payment_status))
); 
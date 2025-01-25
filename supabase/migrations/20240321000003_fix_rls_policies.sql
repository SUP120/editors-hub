-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Artists can view their own orders" ON orders;
DROP POLICY IF EXISTS "Artists can update their orders payment status" ON orders;
DROP POLICY IF EXISTS "Artists can update their own orders" ON orders;
DROP POLICY IF EXISTS "Artists can update payment status" ON orders;
DROP POLICY IF EXISTS "Artists can view their earnings" ON artist_earnings;
DROP POLICY IF EXISTS "Artists can update their earnings" ON artist_earnings;
DROP POLICY IF EXISTS "Artists can insert their earnings" ON artist_earnings;
DROP POLICY IF EXISTS "Artists can view their profile" ON artist_profiles;
DROP POLICY IF EXISTS "Artists can update their profile" ON artist_profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- Orders policies
CREATE POLICY "Artists can view their own orders"
ON orders FOR SELECT
TO authenticated
USING (artist_id = auth.uid());

CREATE POLICY "Artists can update their own orders"
ON orders FOR UPDATE
TO authenticated
USING (artist_id = auth.uid() AND status = 'completed');

CREATE POLICY "Artists can update payment status"
ON orders FOR UPDATE
TO authenticated
USING (artist_id = auth.uid() AND status = 'completed')
WITH CHECK (
  artist_id = auth.uid() AND 
  status = 'completed' AND 
  payment_status IN ('completed', 'transferred')
);

-- Artist earnings policies
CREATE POLICY "Artists can view their earnings"
ON artist_earnings FOR SELECT
TO authenticated
USING (artist_id = auth.uid());

CREATE POLICY "Artists can update their earnings"
ON artist_earnings FOR UPDATE
TO authenticated
USING (artist_id = auth.uid());

CREATE POLICY "Artists can insert their earnings"
ON artist_earnings FOR INSERT
TO authenticated
WITH CHECK (artist_id = auth.uid());

-- Artist profiles policies
CREATE POLICY "Artists can view their profile"
ON artist_profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Artists can update their profile"
ON artist_profiles FOR UPDATE
TO authenticated
USING (id = auth.uid()); 
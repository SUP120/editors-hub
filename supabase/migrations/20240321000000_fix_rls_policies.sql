-- Drop existing policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;

-- Drop existing policies for artist_profiles table
DROP POLICY IF EXISTS "Artists can view their own profile" ON artist_profiles;
DROP POLICY IF EXISTS "Artists can insert their own profile" ON artist_profiles;
DROP POLICY IF EXISTS "Artists can update their own profile" ON artist_profiles;
DROP POLICY IF EXISTS "Public artist profiles are viewable by everyone" ON artist_profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Enable insert for authenticated users only"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for users based on id"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable delete for users based on id"
ON profiles FOR DELETE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Enable read access for all users"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Create policies for artist_profiles table
CREATE POLICY "Enable insert for authenticated users only"
ON artist_profiles FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for users based on id"
ON artist_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable delete for users based on id"
ON artist_profiles FOR DELETE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Enable read access for all users"
ON artist_profiles FOR SELECT
USING (true); 
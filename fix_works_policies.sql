DROP POLICY IF EXISTS \
Public
works
are
viewable
by
everyone\ ON works; CREATE POLICY \Public
works
are
viewable
by
everyone\ ON works FOR SELECT USING (status = 'active' OR auth.uid() = artist_id);

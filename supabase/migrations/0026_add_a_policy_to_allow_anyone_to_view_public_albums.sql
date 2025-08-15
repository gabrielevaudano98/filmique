-- Add a policy to allow anyone to view public albums
CREATE POLICY "Public albums are viewable by everyone." ON public.albums
FOR SELECT
USING (type = 'public');
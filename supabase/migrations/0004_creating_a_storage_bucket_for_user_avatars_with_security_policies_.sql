-- Create a bucket for avatars with public access.
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create a policy for viewing avatars.
CREATE POLICY "Avatar images are publicly accessible."
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'avatars' );

-- Create a policy for uploading avatars.
CREATE POLICY "Anyone can upload an avatar."
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id = 'avatars' );

-- Create a policy for updating avatars.
CREATE POLICY "Users can update their own avatar."
ON storage.objects FOR UPDATE
TO authenticated
USING ( auth.uid() = owner );

-- Create a policy for deleting avatars.
CREATE POLICY "Users can delete their own avatar."
ON storage.objects FOR DELETE
TO authenticated
USING ( auth.uid() = owner );
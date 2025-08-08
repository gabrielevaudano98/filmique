-- Create a bucket for photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Remove old, potentially conflicting policies
DROP POLICY IF EXISTS "users_can_upload_photos" ON storage.objects;
DROP POLICY IF EXISTS "users_can_view_own_photos" ON storage.objects;
DROP POLICY IF EXISTS "users_can_update_own_photos" ON storage.objects;
DROP POLICY IF EXISTS "users_can_delete_own_photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can manage their own photos." ON storage.objects;


-- Create policies for the photos bucket
-- 1. Allow authenticated users to upload photos into a folder matching their user ID.
CREATE POLICY "users_can_upload_photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'photos' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);

-- 2. Allow users to view their own photos.
CREATE POLICY "users_can_view_own_photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'photos' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);

-- 3. Allow users to update their own photos.
CREATE POLICY "users_can_update_own_photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'photos' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);

-- 4. Allow users to delete their own photos.
CREATE POLICY "users_can_delete_own_photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'photos' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);
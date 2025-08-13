-- Create the storage bucket named 'film_rolls' and make it public
INSERT INTO storage.buckets (id, name, public)
VALUES ('film_rolls', 'film_rolls', true);

-- Create RLS policies for the new bucket

-- 1. Allow public, anonymous read access to all files in the bucket
CREATE POLICY "Public read access for film_rolls"
ON storage.objects FOR SELECT
USING (bucket_id = 'film_rolls');

-- 2. Allow authenticated users to upload files into the bucket
CREATE POLICY "Authenticated users can upload film_rolls"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'film_rolls');

-- 3. Allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update their own film_rolls"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid() = owner)
WITH CHECK (bucket_id = 'film_rolls');

-- 4. Allow authenticated users to delete their own files
CREATE POLICY "Authenticated users can delete their own film_rolls"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid() = owner);
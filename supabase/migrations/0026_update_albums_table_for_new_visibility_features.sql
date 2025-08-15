-- Standardize album types for new visibility options
UPDATE public.albums
SET type = 'private'
WHERE type = 'personal';

-- Ensure album types are one of the allowed values
ALTER TABLE public.albums
DROP CONSTRAINT IF EXISTS albums_type_check;

ALTER TABLE public.albums
ADD CONSTRAINT albums_type_check CHECK (type IN ('private', 'unlisted', 'public'));
ALTER TABLE public.profiles
ADD COLUMN is_geolocation_enabled BOOLEAN NOT NULL DEFAULT false;
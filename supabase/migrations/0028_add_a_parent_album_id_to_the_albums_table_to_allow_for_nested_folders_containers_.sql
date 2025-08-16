ALTER TABLE public.albums
ADD COLUMN parent_album_id UUID REFERENCES public.albums(id) ON DELETE SET NULL;
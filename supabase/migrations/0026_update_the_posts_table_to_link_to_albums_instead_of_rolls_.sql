-- First, drop the existing foreign key constraint on roll_id
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_roll_id_fkey;

-- Next, drop the roll_id column
ALTER TABLE public.posts DROP COLUMN IF EXISTS roll_id;

-- Then, add the new album_id column
ALTER TABLE public.posts ADD COLUMN album_id UUID;

-- Finally, add the new foreign key constraint to link to the albums table
ALTER TABLE public.posts 
ADD CONSTRAINT posts_album_id_fkey 
FOREIGN KEY (album_id) 
REFERENCES public.albums(id) 
ON DELETE CASCADE;
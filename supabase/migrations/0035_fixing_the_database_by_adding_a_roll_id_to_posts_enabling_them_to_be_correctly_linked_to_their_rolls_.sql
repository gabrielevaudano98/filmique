-- Add roll_id column to posts table
ALTER TABLE public.posts ADD COLUMN roll_id UUID;

-- Add foreign key constraint to link posts to rolls
-- This ensures that if a roll is deleted, all associated posts are also deleted.
ALTER TABLE public.posts
ADD CONSTRAINT posts_roll_id_fkey
FOREIGN KEY (roll_id)
REFERENCES public.rolls(id)
ON DELETE CASCADE;
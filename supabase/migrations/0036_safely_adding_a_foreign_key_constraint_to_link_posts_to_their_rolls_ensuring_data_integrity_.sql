DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_roll_id_fkey' AND conrelid = 'public.posts'::regclass) THEN
    ALTER TABLE public.posts
    ADD CONSTRAINT posts_roll_id_fkey
    FOREIGN KEY (roll_id)
    REFERENCES public.rolls(id)
    ON DELETE CASCADE;
  END IF;
END $$;
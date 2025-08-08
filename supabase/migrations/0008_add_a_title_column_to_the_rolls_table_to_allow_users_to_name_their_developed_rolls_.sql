ALTER TABLE public.rolls ADD COLUMN title TEXT;
ALTER TABLE public.rolls ADD CONSTRAINT unique_roll_title_per_user UNIQUE (user_id, title);
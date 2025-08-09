-- Add bio column to profiles table
ALTER TABLE public.profiles ADD COLUMN bio TEXT;

-- Add a check constraint for the length of the bio
ALTER TABLE public.profiles ADD CONSTRAINT bio_length_check CHECK (char_length(bio) <= 255);
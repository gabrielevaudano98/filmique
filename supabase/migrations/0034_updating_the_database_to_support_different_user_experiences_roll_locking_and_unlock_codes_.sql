-- Add experience_mode to profiles to store the user's choice
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS experience_mode TEXT NOT NULL DEFAULT 'standard';

-- Add unlock_code to rolls for the authentic experience
ALTER TABLE public.rolls
ADD COLUMN IF NOT EXISTS unlock_code TEXT;

-- Add is_locked to rolls to manage visibility in authentic mode
ALTER TABLE public.rolls
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.profiles
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT,
ADD COLUMN has_completed_onboarding BOOLEAN DEFAULT false;
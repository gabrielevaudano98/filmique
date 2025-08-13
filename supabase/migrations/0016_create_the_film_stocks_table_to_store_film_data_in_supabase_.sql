CREATE TABLE public.film_stocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  brand TEXT,
  type TEXT, -- e.g., 'Color Negative', 'Black & White'
  capacity INTEGER NOT NULL,
  price INTEGER NOT NULL,
  preset JSONB NOT NULL,
  image_url TEXT,
  roll_image_url TEXT,
  unlocked BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.film_stocks ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow authenticated users to read from the table
CREATE POLICY "Film stocks are public to view." ON public.film_stocks
FOR SELECT
TO authenticated
USING (true);
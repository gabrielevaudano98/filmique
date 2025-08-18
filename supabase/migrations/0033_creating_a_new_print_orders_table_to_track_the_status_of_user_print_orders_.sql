-- Create the print_orders table
CREATE TABLE public.print_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  roll_id UUID NOT NULL REFERENCES public.rolls(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued', -- e.g., 'queued', 'processing', 'shipped', 'canceled'
  cost INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  shipped_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security (REQUIRED)
ALTER TABLE public.print_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can manage their own print orders" ON public.print_orders
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own print orders" ON public.print_orders
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
-- Add xp column to profiles
ALTER TABLE public.profiles ADD COLUMN xp INTEGER NOT NULL DEFAULT 0;

-- Create badges table
CREATE TABLE public.badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL, -- e.g., 'Camera', 'Heart' from lucide-react
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- RLS for badges
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Badges are public to view" ON public.badges FOR SELECT USING (true);

-- Create user_badges table
CREATE TABLE public.user_badges (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);
-- RLS for user_badges
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User badges are public to view" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Users can't insert their own badges" ON public.user_badges FOR INSERT WITH CHECK (false); -- Only server can award badges

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- The one who receives the notification
  actor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- The one who performed the action
  type TEXT NOT NULL, -- 'like', 'comment', 'follow', 'badge_unlocked'
  entity_id UUID, -- e.g., post_id, badge_id
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Insert some starter badges
INSERT INTO public.badges (name, description, icon_name) VALUES
('First Steps', 'Posted your first roll to the community', 'Footprints'),
('Photographer', 'Posted 5 rolls', 'Camera'),
('Social Butterfly', 'Followed 10 people', 'Users'),
('Heartthrob', 'Received 10 likes on your posts', 'Heart'),
('Tastemaker', 'Liked 25 posts', 'ThumbsUp'),
('Commentator', 'Left 10 comments', 'MessageSquare');
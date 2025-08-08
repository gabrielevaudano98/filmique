-- Rolls Table: Stores information about each film roll a user has.
CREATE TABLE public.rolls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  film_type TEXT NOT NULL,
  capacity INT NOT NULL,
  shots_used INT NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.rolls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own rolls." ON public.rolls
  FOR ALL USING (auth.uid() = user_id);

-- Photos Table: Stores individual photos, linked to a roll.
CREATE TABLE public.photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  roll_id UUID NOT NULL REFERENCES public.rolls(id) ON DELETE CASCADE,
  url TEXT NOT NULL, -- For now, we'll use Pexels URLs
  thumbnail_url TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own photos." ON public.photos
  FOR ALL USING (auth.uid() = user_id);

-- Posts Table: Represents a shared roll on the community feed.
CREATE TABLE public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  roll_id UUID NOT NULL REFERENCES public.rolls(id) ON DELETE CASCADE,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts are public to view." ON public.posts
  FOR SELECT USING (true);
CREATE POLICY "Users can create and manage their own posts." ON public.posts
  FOR ALL USING (auth.uid() = user_id);

-- Likes Table: Tracks likes on posts.
CREATE TABLE public.likes (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes are public to view." ON public.likes
  FOR SELECT USING (true);
CREATE POLICY "Users can manage their own likes." ON public.likes
  FOR ALL USING (auth.uid() = user_id);

-- Albums Table: Stores user-created photo albums.
CREATE TABLE public.albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  cover_image_url TEXT,
  type TEXT NOT NULL DEFAULT 'personal', -- 'personal', 'shared', 'public'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own albums." ON public.albums
  FOR ALL USING (auth.uid() = user_id);

-- Album Rolls Table: Join table to link rolls to albums.
CREATE TABLE public.album_rolls (
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  roll_id UUID NOT NULL REFERENCES public.rolls(id) ON DELETE CASCADE,
  PRIMARY KEY (album_id, roll_id)
);
ALTER TABLE public.album_rolls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own album content." ON public.album_rolls
  FOR ALL USING (auth.uid() = (SELECT user_id FROM public.albums WHERE id = album_id));

-- Challenges Table: Stores available challenges.
CREATE TABLE public.challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL, -- 'daily', 'weekly', 'special'
  target INT NOT NULL,
  reward JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Challenges are public to view." ON public.challenges
  FOR SELECT USING (true);

-- User Challenges Table: Tracks user progress on challenges.
CREATE TABLE public.user_challenges (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  progress INT NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  claimed_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (user_id, challenge_id)
);
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own challenge progress." ON public.user_challenges
  FOR ALL USING (auth.uid() = user_id);
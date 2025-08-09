-- This script safely resets and defines all foreign key constraints.
-- It first drops the constraint if it exists, then adds it back.
-- This ensures the database schema is in a known, correct state, resolving relationship errors.

-- Link rolls to users
ALTER TABLE public.rolls DROP CONSTRAINT IF EXISTS rolls_user_id_fkey;
ALTER TABLE public.rolls ADD CONSTRAINT rolls_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Link posts to users and rolls
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
ALTER TABLE public.posts ADD CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_roll_id_fkey;
ALTER TABLE public.posts ADD CONSTRAINT posts_roll_id_fkey FOREIGN KEY (roll_id) REFERENCES public.rolls(id) ON DELETE CASCADE;

-- Link comments to posts and users
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_post_id_fkey;
ALTER TABLE public.comments ADD CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE public.comments ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Link likes to posts and users
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_post_id_fkey;
ALTER TABLE public.likes ADD CONSTRAINT likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_user_id_fkey;
ALTER TABLE public.likes ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Link photos to users and rolls
ALTER TABLE public.photos DROP CONSTRAINT IF EXISTS photos_user_id_fkey;
ALTER TABLE public.photos ADD CONSTRAINT photos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.photos DROP CONSTRAINT IF EXISTS photos_roll_id_fkey;
ALTER TABLE public.photos ADD CONSTRAINT photos_roll_id_fkey FOREIGN KEY (roll_id) REFERENCES public.rolls(id) ON DELETE CASCADE;

-- Link albums to users
ALTER TABLE public.albums DROP CONSTRAINT IF EXISTS albums_user_id_fkey;
ALTER TABLE public.albums ADD CONSTRAINT albums_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Link album_rolls to albums and rolls
ALTER TABLE public.album_rolls DROP CONSTRAINT IF EXISTS album_rolls_album_id_fkey;
ALTER TABLE public.album_rolls ADD CONSTRAINT album_rolls_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.albums(id) ON DELETE CASCADE;
ALTER TABLE public.album_rolls DROP CONSTRAINT IF EXISTS album_rolls_roll_id_fkey;
ALTER TABLE public.album_rolls ADD CONSTRAINT album_rolls_roll_id_fkey FOREIGN KEY (roll_id) REFERENCES public.rolls(id) ON DELETE CASCADE;

-- Link user_challenges to users and challenges
ALTER TABLE public.user_challenges DROP CONSTRAINT IF EXISTS user_challenges_user_id_fkey;
ALTER TABLE public.user_challenges ADD CONSTRAINT user_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.user_challenges DROP CONSTRAINT IF EXISTS user_challenges_challenge_id_fkey;
ALTER TABLE public.user_challenges ADD CONSTRAINT user_challenges_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id) ON DELETE CASCADE;

-- Link user_badges to users and badges
ALTER TABLE public.user_badges DROP CONSTRAINT IF EXISTS user_badges_user_id_fkey;
ALTER TABLE public.user_badges ADD CONSTRAINT user_badges_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.user_badges DROP CONSTRAINT IF EXISTS user_badges_badge_id_fkey;
ALTER TABLE public.user_badges ADD CONSTRAINT user_badges_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES public.badges(id) ON DELETE CASCADE;

-- Link notifications to users
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_actor_id_fkey;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Link followers
ALTER TABLE public.followers DROP CONSTRAINT IF EXISTS followers_follower_id_fkey;
ALTER TABLE public.followers ADD CONSTRAINT followers_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.followers DROP CONSTRAINT IF EXISTS followers_following_id_fkey;
ALTER TABLE public.followers ADD CONSTRAINT followers_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
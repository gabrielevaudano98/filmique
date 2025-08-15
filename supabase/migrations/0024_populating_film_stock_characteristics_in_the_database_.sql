-- Kodak Portra 400
UPDATE public.film_stocks
SET 
  good_for = 'Portraits, fashion, and weddings. Renders skin tones beautifully with a soft, natural palette.',
  bad_for = 'High-contrast, gritty street photography where deep blacks are desired.',
  usage_notes = 'Slightly overexposing by 1/2 to 1 stop can enhance its pastel color profile. Very forgiving with exposure.'
WHERE name = 'Kodak Portra 400';

-- Kodak Gold 200
UPDATE public.film_stocks
SET 
  good_for = 'Everyday snapshots in bright daylight. Excellent for capturing a warm, nostalgic, vintage feel.',
  bad_for = 'Low light situations without a flash due to its lower ISO. Can look muddy in overcast weather.',
  usage_notes = 'Its warmth is perfect for golden hour photos. A classic consumer film look.'
WHERE name = 'Kodak Gold 200';

-- Fujifilm Superia 400
UPDATE public.film_stocks
SET 
  good_for = 'General purpose photography, especially landscapes and scenes with a lot of green and blue tones.',
  bad_for = 'Accurate skin tone reproduction in mixed lighting; can sometimes render skin with a slight magenta cast.',
  usage_notes = 'Known for its vibrant greens and cool undertones, a signature Fuji look. Performs well in various lighting conditions.'
WHERE name = 'Fujifilm Superia 400';

-- Ilford HP5 Plus 400
UPDATE public.film_stocks
SET 
  good_for = 'Documentary, street, and portrait photography. A classic black and white film with beautiful grain and contrast.',
  bad_for = 'Situations where a completely grain-free, clinical look is required.',
  usage_notes = 'Extremely flexible. Can be push-processed to ISO 800 or 1600 with excellent results, increasing contrast and grain.'
WHERE name = 'Ilford HP5 Plus 400';

-- CineStill 800T
UPDATE public.film_stocks
SET 
  good_for = 'Night photography, neon signs, and creating a cinematic atmosphere. Famous for its red halation around highlights.',
  bad_for = 'Bright daylight without a warming filter (85B), as it is balanced for tungsten light and will appear very blue.',
  usage_notes = 'Shoot at box speed (800 ISO) to get the full effect. The halation is a feature, not a bug!'
WHERE name = 'CineStill 800T';

-- Kodak Ektar 100
UPDATE public.film_stocks
SET 
  good_for = 'Landscapes, travel, and architectural photography where fine detail and high saturation are key.',
  bad_for = 'Portraits, as its high saturation can sometimes make skin tones appear reddish or unnatural.',
  usage_notes = 'Often called the world''s finest grain color negative film. Requires accurate exposure for best results.'
WHERE name = 'Kodak Ektar 100';
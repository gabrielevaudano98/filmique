-- Fujifilm Pro 400H
UPDATE public.film_stocks
SET 
  good_for = 'Weddings, portraits, and fashion. Renders beautiful, soft skin tones and is famous for its signature minty green and cyan tones.',
  bad_for = 'Situations requiring warm, punchy colors. Its muted, cool palette is a specific look.',
  usage_notes = 'Often slightly overexposed to enhance its pastel look. Its color science is very different from Kodak stocks.'
WHERE name = 'Fujifilm Pro 400H';

-- Kodak Tri-X 400
UPDATE public.film_stocks
SET 
  good_for = 'Photojournalism, street photography, and high-contrast scenes. A legendary B&W film with a gritty, timeless character.',
  bad_for = 'Clean, fine-grain architectural work. The grain is a prominent feature of its look.',
  usage_notes = 'Has a classic, punchy contrast that defines much of 20th-century photography. Pushes very well to 1600 for low light.'
WHERE name = 'Kodak Tri-X 400';

-- Lomography Color Negative 800
UPDATE public.film_stocks
SET 
  good_for = 'Parties, concerts, and creative snapshots. Delivers highly saturated, punchy colors with a distinct retro vibe.',
  bad_for = 'Natural and accurate color reproduction. This film is all about stylized, vibrant results.',
  usage_notes = 'Embrace the grain and saturation. Great for low-light situations where you want a fun, energetic look.'
WHERE name = 'Lomography Color Negative 800';

-- Kodak Vision3 500T
UPDATE public.film_stocks
SET 
  good_for = 'Creating a moody, cinematic look, especially at night or under artificial light. Offers a wide dynamic range.',
  bad_for = 'Daylight shooting without an 85B warming filter, as it will produce a strong blue cast.',
  usage_notes = 'This is a motion picture film stock. It provides a softer, more nuanced look compared to CineStill 800T, without the red halation.'
WHERE name = 'Kodak Vision3 500T';
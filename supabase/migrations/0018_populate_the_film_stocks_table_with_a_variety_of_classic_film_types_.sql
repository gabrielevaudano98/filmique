INSERT INTO public.film_stocks (name, description, brand, type, capacity, price, preset, unlocked) VALUES
('Filmique Classic 400', 'A versatile and balanced color film, perfect for everyday shooting.', 'Filmique', 'Color Negative', 36, 10, '{
  "ev": 0.1,
  "wbK": 6500,
  "tint": 5,
  "contrast": 5,
  "saturation": 8,
  "grain": {"amt": 15},
  "bloom": 0.1,
  "vignette": {"ev": -0.2}
}', true),
('Kodak Gold 200', 'Iconic film stock with warm, golden tones and fine grain. Ideal for portraits and sunny days.', 'Kodak', 'Color Negative', 24, 15, '{
  "ev": 0.15,
  "wbK": 7200,
  "tint": 8,
  "contrast": 8,
  "saturation": 12,
  "grain": {"amt": 10},
  "bloom": 0.05,
  "vignette": {"ev": -0.15}
}', true),
('Fujifilm Superia 400', 'Known for its vibrant colors, especially cool greens and blues. A great all-around film.', 'Fujifilm', 'Color Negative', 36, 20, '{
  "ev": 0.0,
  "wbK": 6200,
  "tint": -5,
  "contrast": 10,
  "saturation": 10,
  "grain": {"amt": 18},
  "bloom": 0.0,
  "vignette": {"ev": -0.2}
}', true),
('Ilford HP5 400', 'A classic high-speed black and white film with beautiful grain and wide tonal range.', 'Ilford', 'Black & White', 36, 25, '{
  "ev": 0.0,
  "contrast": 15,
  "saturation": -100,
  "grain": {"amt": 25},
  "bloom": 0.0,
  "vignette": {"ev": -0.3},
  "bw": {"enable": true}
}', true),
('CineStill 800T', 'Tungsten-balanced cinema film with a unique look and red halation around light sources.', 'CineStill', 'Color Negative', 36, 30, '{
  "ev": -0.1,
  "wbK": 3200,
  "tint": 10,
  "contrast": 12,
  "saturation": 15,
  "grain": {"amt": 22},
  "bloom": 0.5,
  "vignette": {"ev": -0.25}
}', true);
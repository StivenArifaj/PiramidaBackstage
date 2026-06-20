-- Missing ground-floor extension spaces A16-A19.
-- These exist in lib/db/mock-data.ts and are rendered as clickable SVG polygons
-- in components/pyramid/floor-plans/ground-floor.tsx but were absent from 0002_seed.sql.

INSERT INTO spaces (
  code, name, name_sq, floor, category, color,
  area_sqm, capacity_pax, ceiling_m, hourly_rate_eur,
  setup_types, features,
  description, description_sq,
  photo_urls, plan_x, plan_y
) VALUES
('A16', 'Exhibition Room A16', 'Salla Ekspozite A16', 'l0', 'extension', NULL,
  84, 90, 3.6, 120,
  ARRAY['roundtable','standing','flex'],
  ARRAY['projector','natural_light'],
  'Premium modular space on the octagonal perimeter ring of the newly revitalized Pyramid of Tirana, perfect for workshops and tech events. Its radial geometry and exposed concrete finish create a distinctive backdrop for up to 90 guests.',
  NULL, ARRAY[]::text[], 44.00, 19.60),

('A17', 'Entrance Node A17', 'Nyja e Hyrjes A17', 'l0', 'extension', NULL,
  42, 38, 3.6, 75,
  ARRAY['roundtable','standing','flex'],
  ARRAY['natural_light'],
  'Contemporary exhibition room located within the Pyramid''s ground-floor radial extension, designed for flexible event programming. Natural light and open sightlines accommodate 38 guests in theater, roundtable, or standing configurations.',
  NULL, ARRAY[]::text[], 50.00, 12.00),

('A18', 'Entrance Node A18', 'Nyja e Hyrjes A18', 'l0', 'extension', NULL,
  42, 38, 3.6, 75,
  ARRAY['roundtable','standing','flex'],
  ARRAY['natural_light'],
  'Versatile event space forming part of the Pyramid''s iconic perimeter arcade — a space that blends MVRDV''s architectural vision with practical functionality for 38 guests. Ideal for networking events, product showcases, and creative workshops.',
  NULL, ARRAY[]::text[], 50.00, 88.00),

('A19', 'Entrance Node A19', 'Nyja e Hyrjes A19', 'l0', 'extension', NULL,
  40, 35, 3.6, 70,
  ARRAY['roundtable','standing','flex'],
  ARRAY['projector','natural_light'],
  'Premium modular space on the octagonal perimeter ring of the newly revitalized Pyramid of Tirana, perfect for workshops and tech events. Its radial geometry and exposed concrete finish create a distinctive backdrop for up to 35 guests.',
  NULL, ARRAY[]::text[], 12.00, 50.00)

ON CONFLICT (code) DO NOTHING;

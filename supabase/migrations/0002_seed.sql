-- Pyramid Backstage — Seed Data
-- Run after 0001_init.sql on a fresh database.

-- ─────────────────────────────────────────────────────────────────────────────
-- SPACES  (53 total)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO spaces (
  code, name, name_sq, floor, category, color,
  area_sqm, capacity_pax, ceiling_m, hourly_rate_eur,
  setup_types, features,
  description, description_sq,
  photo_urls, plan_x, plan_y
) VALUES

-- ── HERO SPACES (4) ──────────────────────────────────────────────────────────
('BLUE',   'Blue Space',   'Hapësira Blu',       'l0',        'hero', 'blue',
 240, 300, 6.5, 180,
 ARRAY['theater','roundtable','standing','exhibition','flex'],
 ARRAY['projector','mixer','av_booth','natural_light','stage'],
 'The flagship event volume — a striking blue cube suspended inside the central atrium. Full AV integration, panoramic internal views, access from all floors.',
 'Hapësira kryesore — një kub blu i varur brenda atriumit qendror. Integrim i plotë AV, pamje panoramike.',
 ARRAY['/pyramid/mvrdv-15.jpg','/pyramid/mvrdv-10.jpg'], 50.00, 50.00),

('ORANGE', 'Orange Space', 'Hapësira Portokalli', 'l0',        'hero', 'orange',
 180, 220, 5.8, 150,
 ARRAY['theater','roundtable','standing','flex'],
 ARRAY['projector','speaker','natural_light'],
 'Warm-toned creative volume. Ideal for product launches, design workshops, and panel discussions.',
 'Vëllim krijues në ngjyrë portokalli. Ideal për lançime produktesh, punëtori dizajni dhe diskutime.',
 ARRAY['/pyramid/mvrdv-10.jpg'], 55.00, 45.00),

('GREEN',  'Green Space',  'Hapësira Gjelbër',   'l_minus_1', 'hero', 'green',
 150, 160, 5.2, 130,
 ARRAY['theater','roundtable','exhibition'],
 ARRAY['projector','screen','natural_light'],
 'Basement-level hero space with dramatic low ceiling. Favoured for immersive exhibitions and intimate showcases.',
 'Hapësirë kryesore nëntokësore. E preferuar për ekspozita dhe shfaqje intime.',
 ARRAY['/pyramid/mvrdv-13.jpg'], 45.00, 55.00),

('YELLOW', 'Yellow Space', 'Hapësira Verdhë',    'l_minus_1', 'hero', 'yellow',
 120, 140, 4.8, 110,
 ARRAY['theater','standing','flex'],
 ARRAY['projector','speaker'],
 'Golden cube on the lower level. Perfect for workshops, meetups, and small performances.',
 'Kub i artë në nivelin e poshtëm. Perfekt për punëtori, takime dhe performanca të vogla.',
 ARRAY['/pyramid/mvrdv-11.jpg'], 55.00, 55.00),

-- ── GROUND FLOOR EXTENSIONS A1–A15 (15 spaces, radial ring, ~31% from centre) ──
('A1',  'Space A1',  'Hapësira A1',  'l0', 'extension', NULL,  85, 90,  3.6,  95, ARRAY['roundtable','standing','flex'], ARRAY['projector','natural_light'], 'Extension room on the ground-floor radial ring. Flexible layout with concrete column visible on entry.', NULL, ARRAY[]::text[], 50.00, 19.00),
('A2',  'Space A2',  'Hapësira A2',  'l0', 'extension', NULL,  93, 98,  3.6, 110, ARRAY['roundtable','standing','flex'], ARRAY['natural_light'],              'Extension room on the ground-floor radial ring.',                                                       NULL, ARRAY[]::text[], 62.60, 21.60),
('A3',  'Space A3',  'Hapësira A3',  'l0', 'extension', NULL, 101, 106, 3.6,  95, ARRAY['roundtable','standing','flex'], ARRAY['projector','natural_light'], 'Extension room on the ground-floor radial ring.',                                                       NULL, ARRAY[]::text[], 73.00, 29.30),
('A4',  'Space A4',  'Hapësira A4',  'l0', 'extension', NULL,  85, 114, 3.6, 110, ARRAY['roundtable','standing','flex'], ARRAY['natural_light'],              'Extension room on the ground-floor radial ring.',                                                       NULL, ARRAY[]::text[], 79.50, 40.40),
('A5',  'Space A5',  'Hapësira A5',  'l0', 'extension', NULL,  93, 90,  3.6, 125, ARRAY['roundtable','standing','flex'], ARRAY['projector','natural_light'], 'Extension room on the ground-floor radial ring.',                                                       NULL, ARRAY[]::text[], 80.80, 53.20),
('A6',  'Space A6',  'Hapësira A6',  'l0', 'extension', NULL, 101, 98,  3.6,  95, ARRAY['roundtable','standing','flex'], ARRAY['natural_light'],              'Extension room on the ground-floor radial ring.',                                                       NULL, ARRAY[]::text[], 76.80, 65.50),
('A7',  'Space A7',  'Hapësira A7',  'l0', 'extension', NULL,  85, 106, 3.6, 110, ARRAY['roundtable','standing','flex'], ARRAY['projector','natural_light'], 'Extension room on the ground-floor radial ring.',                                                       NULL, ARRAY[]::text[], 68.20, 75.10),
('A8',  'Space A8',  'Hapësira A8',  'l0', 'extension', NULL,  93, 114, 3.6,  95, ARRAY['roundtable','standing','flex'], ARRAY['natural_light'],              'Extension room on the ground-floor radial ring.',                                                       NULL, ARRAY[]::text[], 56.40, 80.30),
('A9',  'Space A9',  'Hapësira A9',  'l0', 'extension', NULL, 101, 90,  3.6, 125, ARRAY['roundtable','standing','flex'], ARRAY['projector','natural_light'], 'Extension room on the ground-floor radial ring.',                                                       NULL, ARRAY[]::text[], 43.60, 80.30),
('A10', 'Space A10', 'Hapësira A10', 'l0', 'extension', NULL,  85, 98,  3.6,  95, ARRAY['roundtable','standing','flex'], ARRAY['natural_light'],              'Extension room on the ground-floor radial ring.',                                                       NULL, ARRAY[]::text[], 31.80, 75.10),
('A11', 'Space A11', 'Hapësira A11', 'l0', 'extension', NULL,  93, 106, 3.6, 110, ARRAY['roundtable','standing','flex'], ARRAY['projector','natural_light'], 'Extension room on the ground-floor radial ring.',                                                       NULL, ARRAY[]::text[], 23.20, 65.50),
('A12', 'Space A12', 'Hapësira A12', 'l0', 'extension', NULL, 101, 114, 3.6,  95, ARRAY['roundtable','standing','flex'], ARRAY['natural_light'],              'Extension room on the ground-floor radial ring.',                                                       NULL, ARRAY[]::text[], 19.20, 53.20),
('A13', 'Space A13', 'Hapësira A13', 'l0', 'extension', NULL,  85, 90,  3.6, 125, ARRAY['roundtable','standing','flex'], ARRAY['projector','natural_light'], 'Extension room on the ground-floor radial ring.',                                                       NULL, ARRAY[]::text[], 20.50, 40.40),
('A14', 'Space A14', 'Hapësira A14', 'l0', 'extension', NULL,  93, 98,  3.6,  95, ARRAY['roundtable','standing','flex'], ARRAY['natural_light'],              'Extension room on the ground-floor radial ring.',                                                       NULL, ARRAY[]::text[], 27.00, 29.30),
('A15', 'Space A15', 'Hapësira A15', 'l0', 'extension', NULL, 101, 106, 3.6, 110, ARRAY['roundtable','standing','flex'], ARRAY['projector','natural_light'], 'Extension room on the ground-floor radial ring.',                                                       NULL, ARRAY[]::text[], 37.40, 21.60),

-- ── EXTERIOR BOXES BE1–BE16 (16 boxes, ~45% radius perimeter) ────────────────
('BE1',  'Exterior Box 1',  'Kuti Eksteriore 1',  'exterior', 'exterior_box', 'blue',   104, 65, 3.0,  65, ARRAY['standing','flex'],             ARRAY['natural_light'], 'MVRDV blue exterior box — technology & co-working. North-facing position.',      NULL, ARRAY[]::text[], 50.00,  5.00),
('BE2',  'Exterior Box 2',  'Kuti Eksteriore 2',  'exterior', 'exterior_box', 'orange',  86, 40, 3.0,  65, ARRAY['standing','flex','roundtable'], ARRAY['natural_light'], 'MVRDV orange exterior box — food & beverage. Pop-up café and social events.',   NULL, ARRAY[]::text[], 67.23,  8.43),
('BE3',  'Exterior Box 3',  'Kuti Eksteriore 3',  'exterior', 'exterior_box', 'green',  140, 90, 3.0,  77, ARRAY['standing','flex','roundtable'], ARRAY['natural_light'], 'MVRDV green exterior box — services & professional. Flexible layout.',          NULL, ARRAY[]::text[], 81.82, 18.18),
('BE4',  'Exterior Box 4',  'Kuti Eksteriore 4',  'exterior', 'exterior_box', 'yellow', 192,115, 3.0,  89, ARRAY['standing','flex','roundtable'], ARRAY['natural_light'], 'MVRDV yellow exterior box — the largest exterior volume. Retail & social.',     NULL, ARRAY[]::text[], 91.57, 32.77),
('BE5',  'Exterior Box 5',  'Kuti Eksteriore 5',  'exterior', 'exterior_box', 'red',    104, 65, 3.0,  65, ARRAY['standing','flex'],             ARRAY['natural_light'], 'MVRDV red exterior box — technology. High-visibility main approach position.',  NULL, ARRAY[]::text[], 95.00, 50.00),
('BE6',  'Exterior Box 6',  'Kuti Eksteriore 6',  'exterior', 'exterior_box', 'purple', 122, 65, 3.0,  65, ARRAY['standing','flex','roundtable'], ARRAY['natural_light'], 'MVRDV purple exterior box — services. Quiet south-east position.',              NULL, ARRAY[]::text[], 91.57, 67.23),
('BE7',  'Exterior Box 7',  'Kuti Eksteriore 7',  'exterior', 'exterior_box', 'teal',   158, 90, 3.0,  77, ARRAY['standing','flex','roundtable'], ARRAY['natural_light'], 'MVRDV teal exterior box — food & beverage. Garden-side terrace access.',        NULL, ARRAY[]::text[], 81.82, 81.82),
('BE8',  'Exterior Box 8',  'Kuti Eksteriore 8',  'exterior', 'exterior_box', 'coral',   86, 40, 3.0,  65, ARRAY['standing','flex'],             ARRAY['natural_light'], 'MVRDV coral exterior box — retail. Compact boutique pop-up volume.',            NULL, ARRAY[]::text[], 67.23, 91.57),
('BE9',  'Exterior Box 9',  'Kuti Eksteriore 9',  'exterior', 'exterior_box', 'blue',   104, 65, 3.0,  65, ARRAY['standing','flex'],             ARRAY['natural_light'], 'MVRDV blue exterior box — technology. South-facing park views.',                NULL, ARRAY[]::text[], 50.00, 95.00),
('BE10', 'Exterior Box 10', 'Kuti Eksteriore 10', 'exterior', 'exterior_box', 'orange', 140, 90, 3.0,  77, ARRAY['standing','flex','roundtable'], ARRAY['natural_light'], 'MVRDV orange exterior box — food & beverage. Spacious terrace-linked space.',  NULL, ARRAY[]::text[], 32.77, 91.57),
('BE11', 'Exterior Box 11', 'Kuti Eksteriore 11', 'exterior', 'exterior_box', 'green',  104, 65, 3.0,  65, ARRAY['standing','flex'],             ARRAY['natural_light'], 'MVRDV green exterior box — services. Park-facing position.',                    NULL, ARRAY[]::text[], 18.18, 81.82),
('BE12', 'Exterior Box 12', 'Kuti Eksteriore 12', 'exterior', 'exterior_box', 'yellow', 122, 65, 3.0,  65, ARRAY['standing','flex','roundtable'], ARRAY['natural_light'], 'MVRDV yellow exterior box — retail. High footfall boulevard position.',         NULL, ARRAY[]::text[],  8.43, 67.23),
('BE13', 'Exterior Box 13', 'Kuti Eksteriore 13', 'exterior', 'exterior_box', 'red',    192,115, 3.0,  89, ARRAY['standing','flex','roundtable'], ARRAY['natural_light'], 'MVRDV red exterior box — largest on west side. Technology showcase.',           NULL, ARRAY[]::text[],  5.00, 50.00),
('BE14', 'Exterior Box 14', 'Kuti Eksteriore 14', 'exterior', 'exterior_box', 'purple',  86, 40, 3.0,  65, ARRAY['standing','flex'],             ARRAY['natural_light'], 'MVRDV purple exterior box — services. Corner position with dual frontage.',     NULL, ARRAY[]::text[],  8.43, 32.77),
('BE15', 'Exterior Box 15', 'Kuti Eksteriore 15', 'exterior', 'exterior_box', 'teal',   104, 65, 3.0,  65, ARRAY['standing','flex','roundtable'], ARRAY['natural_light'], 'MVRDV teal exterior box — food & beverage. North-west corner position.',       NULL, ARRAY[]::text[], 18.18, 18.18),
('BE16', 'Exterior Box 16', 'Kuti Eksteriore 16', 'exterior', 'exterior_box', 'coral',  140, 90, 3.0,  77, ARRAY['standing','flex','roundtable'], ARRAY['natural_light'], 'MVRDV coral exterior box — retail. Main boulevard-facing position.',            NULL, ARRAY[]::text[], 32.77,  8.43),

-- ── L3 COLOURED BOXES (6, inner atrium ring ~20% radius) ─────────────────────
('L3-RED',    'Red Box · L+3',     'Kuti e Kuqe · K+3',     'l3', 'hero', 'red',    86, 80, 4.2, 120, ARRAY['theater','standing'],          ARRAY['projector','natural_light'], 'Red volume on the third level with panoramic atrium views across all floors.',         NULL, ARRAY['/pyramid/mvrdv-13.jpg'], 50.00, 30.00),
('L3-PURPLE', 'Purple Box · L+3',  'Kuti Vjollce · K+3',    'l3', 'hero', 'purple', 72, 60, 4.0, 100, ARRAY['roundtable','flex'],           ARRAY['natural_light'],              'Intimate purple cube on the upper ring. Perfect for board meetings and VIP events.',  NULL, ARRAY[]::text[],               67.32, 40.00),
('L3-BLUE',   'Blue Box · L+3',    'Kuti Blu · K+3',        'l3', 'hero', 'blue',   98, 90, 4.5, 130, ARRAY['theater','roundtable'],        ARRAY['projector','natural_light'], 'Upper-level blue box with suspended atrium views and direct bridge access.',           NULL, ARRAY[]::text[],               67.32, 60.00),
('L3-YELLOW', 'Yellow Box · L+3',  'Kuti Verdhë · K+3',     'l3', 'hero', 'yellow', 64, 50, 3.8,  90, ARRAY['flex','standing'],             ARRAY['natural_light'],              'Compact yellow volume, great for workshops and private dinners.',                     NULL, ARRAY[]::text[],               50.00, 70.00),
('L3-GREEN',  'Green Box · L+3',   'Kuti Gjelbër · K+3',    'l3', 'hero', 'green',  80, 70, 4.0, 110, ARRAY['theater','flex'],              ARRAY['natural_light'],              'Green cube suspended mid-atrium with dramatic vertical views.',                       NULL, ARRAY[]::text[],               32.68, 60.00),
('L3-ORANGE', 'Orange Box · L+3',  'Kuti Portokalli · K+3', 'l3', 'hero', 'orange', 76, 65, 4.0, 105, ARRAY['standing','roundtable'],       ARRAY['natural_light'],              'Vibrant orange volume on the upper atrium ring. Great for networking events.',        NULL, ARRAY[]::text[],               32.68, 40.00),

-- ── ROOFTOP BOXES (4) ────────────────────────────────────────────────────────
('ROOF-YELLOW', 'Yellow Roof Box', 'Kuti Verdhë e Çatisë',    'roof', 'exterior_box', 'yellow', 112, 80, 3.2, 140, ARRAY['standing','flex','roundtable'], ARRAY['natural_light'], 'Rooftop yellow volume with panoramic views of Tirana and Mount Dajti. The most photographed space.', NULL, ARRAY['/pyramid/mvrdv-26.jpg'], 30.00, 30.00),
('ROOF-RED',    'Red Roof Box',    'Kuti e Kuqe e Çatisë',    'roof', 'exterior_box', 'red',     96, 65, 3.2, 135, ARRAY['standing','flex'],              ARRAY['natural_light'], 'Bold red rooftop volume — iconic in Tirana''s skyline. Dramatic evening silhouette.',             NULL, ARRAY['/pyramid/mvrdv-26.jpg'], 70.00, 30.00),
('ROOF-ORANGE', 'Orange Roof Box', 'Kuti Portokalli e Çatisë','roof', 'exterior_box', 'orange',  104, 75, 3.2, 138, ARRAY['standing','flex','roundtable'], ARRAY['natural_light'], 'Orange rooftop space with city and mountain panorama. Ideal for sunset receptions.',              NULL, ARRAY[]::text[],               30.00, 70.00),
('ROOF-PURPLE', 'Purple Roof Box', 'Kuti Vjollce e Çatisë',   'roof', 'exterior_box', 'purple',   88, 55, 3.2, 125, ARRAY['standing','flex'],              ARRAY['natural_light'], 'Intimate purple rooftop cube. Ideal for private receptions and small weddings.',                  NULL, ARRAY[]::text[],               70.00, 70.00),

-- ── BASEMENT L-1 (8 spaces, service ring) ────────────────────────────────────
('B1', 'Basement B1', 'Bodrum B1', 'l_minus_1', 'extension', NULL, 110,  80, 3.8,  85, ARRAY['theater','roundtable','exhibition'], ARRAY['projector'], 'Basement-level room. Lower ceiling creates intimate atmosphere for focused events.',              NULL, ARRAY[]::text[], 50.00, 19.00),
('B2', 'Basement B2', 'Bodrum B2', 'l_minus_1', 'extension', NULL, 130,  95, 3.8,  95, ARRAY['theater','roundtable','exhibition'], ARRAY['projector'], 'Basement-level room with flexible partition wall.',                                               NULL, ARRAY[]::text[], 71.93, 28.07),
('B3', 'Basement B3', 'Bodrum B3', 'l_minus_1', 'extension', NULL, 150, 110, 3.8,  85, ARRAY['theater','roundtable','exhibition'], ARRAY['projector'], 'Larger basement space, ideal for workshops and training sessions.',                               NULL, ARRAY[]::text[], 81.00, 50.00),
('B4', 'Basement B4', 'Bodrum B4', 'l_minus_1', 'extension', NULL, 170, 125, 3.8,  95, ARRAY['theater','roundtable','exhibition'], ARRAY['projector'], 'Basement storage-adjacent space with direct loading dock access.',                                NULL, ARRAY[]::text[], 71.93, 71.93),
('B5', 'Basement B5', 'Bodrum B5', 'l_minus_1', 'extension', NULL, 190, 140, 3.8, 105, ARRAY['theater','roundtable','exhibition'], ARRAY['projector'], 'The largest basement room. Used for large-scale set construction and staging.',                   NULL, ARRAY[]::text[], 50.00, 81.00),
('B6', 'Basement B6', 'Bodrum B6', 'l_minus_1', 'extension', NULL, 210, 155, 3.8, 115, ARRAY['theater','roundtable','exhibition'], ARRAY['projector'], 'Basement-level room adjacent to the service lift. Good for catering preparation.',               NULL, ARRAY[]::text[], 28.07, 71.93),
('B7', 'Basement B7', 'Bodrum B7', 'l_minus_1', 'extension', NULL, 130,  95, 3.8,  95, ARRAY['theater','roundtable','exhibition'], ARRAY['projector'], 'Basement-level room with acoustic dampening treatment. Ideal for rehearsals.',                   NULL, ARRAY[]::text[], 19.00, 50.00),
('B8', 'Basement B8', 'Bodrum B8', 'l_minus_1', 'extension', NULL, 110,  80, 3.8,  85, ARRAY['theater','roundtable','exhibition'], ARRAY['projector'], 'Compact basement room. Used for breakout sessions and VIP green rooms.',                         NULL, ARRAY[]::text[], 28.07, 28.07)

ON CONFLICT (code) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- ASSETS  (11 types, ~200+ total units across all categories)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO assets (type, name, total_qty, storage_location, unit_rate_eur, condition) VALUES
('chair',       'Conference Chair (padded)',   600, 'storage-l-1-a', 0.50,  'good'),
('table_round', 'Round Table 180cm',            80, 'storage-l-1-b', 5.00,  'good'),
('table_rect',  'Rectangular Table 200cm',      60, 'storage-l-1-b', 4.00,  'good'),
('microphone',  'Wireless Handheld Mic',        30, 'av-booth-l3',   8.00,  'good'),
('projector',   '4K Laser Projector',           12, 'av-booth-l3',   45.00, 'good'),
('screen',      'Motorised Screen 3m',          18, 'av-booth-l3',   20.00, 'good'),
('speaker',     'Line Array Speaker Pair',      24, 'av-booth-l3',   35.00, 'good'),
('lighting',    'LED Par Can (set of 6)',        12, 'storage-l-1-c', 60.00, 'good'),
('stage',       'Stage Platform 2×1m',           6, 'storage-l-1-a', 80.00, 'good'),
('barrier',     'Crowd Barrier 2m',             40, 'storage-l-1-a',  3.00, 'good'),
('cable',       'XLR Cable 10m',               200, 'av-booth-l3',    1.00, 'good');

-- ─────────────────────────────────────────────────────────────────────────────
-- DEMO EVENTS  (3 events for the demo script — master-plan §10)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO events (
  reference_code, title, event_type,
  organizer_name, organizer_email, organizer_org,
  attendees_count, status,
  start_at, end_at, setup_start_at, teardown_end_at, notes
) VALUES
('PB-2026-001', 'Tech Summit Tirana',         'conference',
 'Ardi Mëhilli',  'ardi@techsummit.al',  'Tech Summit ALB',
 250, 'confirmed',
 NOW() + INTERVAL '1 day',
 NOW() + INTERVAL '1 day'  + INTERVAL '4 hours',
 NOW() + INTERVAL '1 day'  - INTERVAL '2 hours',
 NOW() + INTERVAL '1 day'  + INTERVAL '5 hours',
 'Bilingual simultaneous translation required.'),

('PB-2026-002', 'MVRDV Architecture Talk',    'workshop',
 'Elona Berisha', 'elona@architecture.al', 'AKPT',
 80, 'confirmed',
 NOW() + INTERVAL '2 days',
 NOW() + INTERVAL '2 days' + INTERVAL '3 hours',
 NULL, NULL, NULL),

('PB-2026-003', 'Startup Albania Launch Night','reception',
 'Gent Shllaku',  'gent@startup.al',      'Startup Albania',
 120, 'quoted',
 NOW() + INTERVAL '3 days',
 NOW() + INTERVAL '3 days' + INTERVAL '3 hours',
 NULL, NULL, NULL)

ON CONFLICT (reference_code) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- EVENT → SPACE LINKS
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO event_spaces (event_id, space_id, setup_type)
SELECT e.id, s.id, 'theater'
FROM events e, spaces s
WHERE e.reference_code = 'PB-2026-001' AND s.code = 'BLUE'
ON CONFLICT (event_id, space_id) DO NOTHING;

INSERT INTO event_spaces (event_id, space_id, setup_type)
SELECT e.id, s.id, 'roundtable'
FROM events e, spaces s
WHERE e.reference_code = 'PB-2026-002' AND s.code = 'A5'
ON CONFLICT (event_id, space_id) DO NOTHING;

INSERT INTO event_spaces (event_id, space_id, setup_type)
SELECT e.id, s.id, 'standing'
FROM events e, spaces s
WHERE e.reference_code = 'PB-2026-003' AND s.code = 'ORANGE'
ON CONFLICT (event_id, space_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- EVENT → ASSET RESERVATIONS
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO event_assets (event_id, asset_id, quantity)
SELECT e.id, a.id, 250 FROM events e, assets a
WHERE e.reference_code = 'PB-2026-001' AND a.type = 'chair'
ON CONFLICT (event_id, asset_id) DO NOTHING;

INSERT INTO event_assets (event_id, asset_id, quantity)
SELECT e.id, a.id, 2 FROM events e, assets a
WHERE e.reference_code = 'PB-2026-001' AND a.type = 'projector'
ON CONFLICT (event_id, asset_id) DO NOTHING;

INSERT INTO event_assets (event_id, asset_id, quantity)
SELECT e.id, a.id, 2 FROM events e, assets a
WHERE e.reference_code = 'PB-2026-001' AND a.type = 'speaker'
ON CONFLICT (event_id, asset_id) DO NOTHING;

INSERT INTO event_assets (event_id, asset_id, quantity)
SELECT e.id, a.id, 80 FROM events e, assets a
WHERE e.reference_code = 'PB-2026-002' AND a.type = 'chair'
ON CONFLICT (event_id, asset_id) DO NOTHING;

INSERT INTO event_assets (event_id, asset_id, quantity)
SELECT e.id, a.id, 1 FROM events e, assets a
WHERE e.reference_code = 'PB-2026-002' AND a.type = 'projector'
ON CONFLICT (event_id, asset_id) DO NOTHING;

INSERT INTO event_assets (event_id, asset_id, quantity)
SELECT e.id, a.id, 120 FROM events e, assets a
WHERE e.reference_code = 'PB-2026-003' AND a.type = 'chair'
ON CONFLICT (event_id, asset_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- QUOTE for the quoted event
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO quotes (event_id, line_items, subtotal, tax, total, currency, valid_until)
SELECT e.id,
  '[{"description":"Orange Space rental (3 hours)","quantity":3,"unit_price":150,"total":450},{"description":"Conference Chair × 120","quantity":120,"unit_price":0.5,"total":60}]'::jsonb,
  510.00, 91.80, 601.80, 'EUR',
  NOW() + INTERVAL '7 days'
FROM events e
WHERE e.reference_code = 'PB-2026-003'
  AND NOT EXISTS (SELECT 1 FROM quotes q WHERE q.event_id = e.id);

-- ─────────────────────────────────────────────────────────────────────────────
-- TASKS for Tech Summit (auto-generated operational checklist)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO tasks (event_id, title, team, due_at, status)
SELECT e.id, 'Stage assembly — Blue Space',     'logistics',
  NOW() + INTERVAL '1 day' - INTERVAL '2 hours', 'pending'
FROM events e WHERE e.reference_code = 'PB-2026-001'
  AND NOT EXISTS (SELECT 1 FROM tasks t WHERE t.event_id = e.id AND t.title = 'Stage assembly — Blue Space');

INSERT INTO tasks (event_id, title, team, due_at, status)
SELECT e.id, 'AV system calibration',           'av',
  NOW() + INTERVAL '1 day' - INTERVAL '90 minutes', 'pending'
FROM events e WHERE e.reference_code = 'PB-2026-001'
  AND NOT EXISTS (SELECT 1 FROM tasks t WHERE t.event_id = e.id AND t.title = 'AV system calibration');

INSERT INTO tasks (event_id, title, team, due_at, status)
SELECT e.id, 'Chair placement (250 seats)',      'logistics',
  NOW() + INTERVAL '1 day' - INTERVAL '1 hour', 'pending'
FROM events e WHERE e.reference_code = 'PB-2026-001'
  AND NOT EXISTS (SELECT 1 FROM tasks t WHERE t.event_id = e.id AND t.title = 'Chair placement (250 seats)');

INSERT INTO tasks (event_id, title, team, due_at, status)
SELECT e.id, 'Reception desk setup',             'reception',
  NOW() + INTERVAL '1 day' - INTERVAL '30 minutes', 'pending'
FROM events e WHERE e.reference_code = 'PB-2026-001'
  AND NOT EXISTS (SELECT 1 FROM tasks t WHERE t.event_id = e.id AND t.title = 'Reception desk setup');

INSERT INTO tasks (event_id, title, team, due_at, status)
SELECT e.id, 'Post-event teardown',              'logistics',
  NOW() + INTERVAL '1 day' + INTERVAL '5 hours', 'pending'
FROM events e WHERE e.reference_code = 'PB-2026-001'
  AND NOT EXISTS (SELECT 1 FROM tasks t WHERE t.event_id = e.id AND t.title = 'Post-event teardown');

INSERT INTO tasks (event_id, title, team, due_at, status)
SELECT e.id, 'AV equipment return to booth',     'av',
  NOW() + INTERVAL '1 day' + INTERVAL '5 hours 30 minutes', 'pending'
FROM events e WHERE e.reference_code = 'PB-2026-001'
  AND NOT EXISTS (SELECT 1 FROM tasks t WHERE t.event_id = e.id AND t.title = 'AV equipment return to booth');

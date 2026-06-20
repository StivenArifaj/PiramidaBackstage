/**
 * In-memory mock store for Phase 4 development.
 * Replace each query with a real Supabase call once .env.local is populated.
 * All shapes match the types in /types/api.ts exactly.
 */
import type { SpaceWithAvailability, Asset, Event, Quote, Task, Conflict, AvailabilityState } from '@/types/api'

// ─── Image pools ──────────────────────────────────────────────────────────────

// High-quality 3D isometric renders — use for extension/generic spaces
const ISO = [
  '/sketches/iso-6-final.jpeg',
  '/sketches/iso-4-programme.jpeg',
  '/sketches/iso-1-existing.jpeg',
] as const

// Real MVRDV photography
const INTERIOR = [
  '/pyramid/mvrdv-10.jpg', '/pyramid/mvrdv-11.jpg', '/pyramid/mvrdv-12.jpg',
  '/pyramid/mvrdv-13.jpg', '/pyramid/mvrdv-14.jpg', '/pyramid/mvrdv-15.jpg',
  '/pyramid/mvrdv-16.jpg', '/pyramid/mvrdv-17.jpg', '/pyramid/mvrdv-18.jpg',
] as const

const EXTERIOR = [
  '/pyramid/mvrdv-1.jpg',  '/pyramid/mvrdv-2.jpg',  '/pyramid/mvrdv-3.jpg',
  '/pyramid/mvrdv-4.jpg',  '/pyramid/mvrdv-5.jpg',  '/pyramid/mvrdv-6.jpg',
  '/pyramid/mvrdv-7.jpg',  '/pyramid/mvrdv-8.jpg',  '/pyramid/mvrdv-9.jpg',
] as const

const AERIAL = [
  '/pyramid/mvrdv-21.jpg', '/pyramid/mvrdv-22.jpg', '/pyramid/mvrdv-23.jpg',
  '/pyramid/mvrdv-26.jpg', '/pyramid/mvrdv-27.jpg', '/pyramid/mvrdv-28.jpg',
  '/pyramid/mvrdv-29.jpg', '/pyramid/mvrdv-30.jpg',
] as const

function pick<T extends readonly string[]>(arr: T, i: number): string {
  return arr[i % arr.length]
}

// ─── Spaces ──────────────────────────────────────────────────────────────────

export const MOCK_SPACES: SpaceWithAvailability[] = [
  // ── HERO SPACES ──────────────────────────────────────────────────────────
  {
    id: 'hero-blue', code: 'BLUE', name: 'Blue Space', name_sq: 'Hapësira Blu',
    floor: 'l0', category: 'hero', color: 'blue',
    area_sqm: 240, capacity_pax: 300, ceiling_m: 6.5,
    hourly_rate_eur: 180,
    setup_types: ['theater', 'roundtable', 'standing', 'exhibition', 'flex'],
    features: ['projector', 'mixer', 'av_booth', 'natural_light', 'stage'],
    description: 'The flagship event volume — a striking blue cube suspended inside the central atrium, fully equipped with integrated AV and panoramic views across all floors. At 240 m² and 6.5 m ceiling height, this is the Pyramid\'s premier venue for conferences, product launches, and immersive exhibitions.',
    photo_urls: ['/pyramid/mvrdv-15.jpg', '/pyramid/mvrdv-10.jpg', '/sketches/iso-6-final.jpeg'],
    availability: 'available',
  },
  {
    id: 'hero-orange', code: 'ORANGE', name: 'Orange Space', name_sq: 'Hapësira Portokalli',
    floor: 'l0', category: 'hero', color: 'orange',
    area_sqm: 180, capacity_pax: 220, ceiling_m: 5.8,
    hourly_rate_eur: 150,
    setup_types: ['theater', 'roundtable', 'standing', 'flex'],
    features: ['projector', 'speaker', 'natural_light'],
    description: 'Warm-toned creative volume at ground level, ideally suited for product launches, design workshops, and panel discussions up to 220 guests. Its 5.8 m clear-span ceiling and flexible layout options make it the most versatile mid-size space in the building.',
    photo_urls: ['/pyramid/mvrdv-16.jpg', '/pyramid/mvrdv-11.jpg', '/sketches/iso-4-programme.jpeg'],
    availability: 'reserved',
    next_available_at: new Date(Date.now() + 86400000 * 2).toISOString(),
  },
  {
    id: 'hero-green', code: 'GREEN', name: 'Green Space', name_sq: 'Hapësira Gjelbër',
    floor: 'l_minus_1', category: 'hero', color: 'green',
    area_sqm: 150, capacity_pax: 160, ceiling_m: 5.2,
    hourly_rate_eur: 130,
    setup_types: ['theater', 'roundtable', 'exhibition'],
    features: ['projector', 'screen', 'natural_light'],
    description: 'Basement-level hero space with dramatic 5.2 m ceiling and raw concrete aesthetic — the preferred venue for immersive exhibitions and intimate showcases. Natural light enters through the building\'s signature clerestory openings, creating a unique ambience for 160 guests.',
    photo_urls: ['/pyramid/mvrdv-13.jpg', '/pyramid/mvrdv-17.jpg', '/sketches/iso-6-final.jpeg'],
    availability: 'available',
  },
  {
    id: 'hero-yellow', code: 'YELLOW', name: 'Yellow Space', name_sq: 'Hapësira Verdhë',
    floor: 'l_minus_1', category: 'hero', color: 'yellow',
    area_sqm: 120, capacity_pax: 140, ceiling_m: 4.8,
    hourly_rate_eur: 110,
    setup_types: ['theater', 'standing', 'flex'],
    features: ['projector', 'speaker'],
    description: 'Golden cube on the lower level with a focused, intimate character perfect for workshops, meetups, and small performances up to 140 guests. The 4.8 m ceiling and warm colour palette create a distinct energy that makes every event memorable.',
    photo_urls: ['/pyramid/mvrdv-14.jpg', '/pyramid/mvrdv-12.jpg', '/sketches/iso-1-existing.jpeg'],
    availability: 'available',
  },

  // ── GROUND FLOOR EXTENSION (A1–A19) ──────────────────────────────────────
  ...[
    { code: 'A1',  name: 'Exhibition Room A1',  name_sq: 'Salla Ekspozite A1',  area_sqm: 85,  cap: 90,  rate: 120 },
    { code: 'A2',  name: 'Exhibition Room A2',  name_sq: 'Salla Ekspozite A2',  area_sqm: 92,  cap: 100, rate: 130 },
    { code: 'A3',  name: 'Exhibition Room A3',  name_sq: 'Salla Ekspozite A3',  area_sqm: 88,  cap: 95,  rate: 125 },
    { code: 'A4',  name: 'Exhibition Room A4',  name_sq: 'Salla Ekspozite A4',  area_sqm: 95,  cap: 110, rate: 135 },
    { code: 'A5',  name: 'Exhibition Room A5',  name_sq: 'Salla Ekspozite A5',  area_sqm: 105, cap: 120, rate: 145 },
    { code: 'A6',  name: 'Exhibition Room A6',  name_sq: 'Salla Ekspozite A6',  area_sqm: 98,  cap: 108, rate: 138 },
    { code: 'A7',  name: 'Exhibition Room A7',  name_sq: 'Salla Ekspozite A7',  area_sqm: 90,  cap: 98,  rate: 128 },
    { code: 'A8',  name: 'Exhibition Room A8',  name_sq: 'Salla Ekspozite A8',  area_sqm: 87,  cap: 94,  rate: 122 },
    { code: 'A9',  name: 'Exhibition Room A9',  name_sq: 'Salla Ekspozite A9',  area_sqm: 88,  cap: 96,  rate: 124 },
    { code: 'A10', name: 'Exhibition Room A10', name_sq: 'Salla Ekspozite A10', area_sqm: 92,  cap: 100, rate: 130 },
    { code: 'A11', name: 'Exhibition Room A11', name_sq: 'Salla Ekspozite A11', area_sqm: 95,  cap: 105, rate: 135 },
    { code: 'A12', name: 'Exhibition Room A12', name_sq: 'Salla Ekspozite A12', area_sqm: 100, cap: 112, rate: 140 },
    { code: 'A13', name: 'Exhibition Room A13', name_sq: 'Salla Ekspozite A13', area_sqm: 96,  cap: 106, rate: 136 },
    { code: 'A14', name: 'Exhibition Room A14', name_sq: 'Salla Ekspozite A14', area_sqm: 90,  cap: 98,  rate: 128 },
    { code: 'A15', name: 'Exhibition Room A15', name_sq: 'Salla Ekspozite A15', area_sqm: 87,  cap: 93,  rate: 122 },
    { code: 'A16', name: 'Exhibition Room A16', name_sq: 'Salla Ekspozite A16', area_sqm: 84,  cap: 90,  rate: 120 },
    { code: 'A17', name: 'Entrance Node A17',   name_sq: 'Nyja e Hyrjes A17',  area_sqm: 42,  cap: 38,  rate: 75  },
    { code: 'A18', name: 'Entrance Node A18',   name_sq: 'Nyja e Hyrjes A18',  area_sqm: 42,  cap: 38,  rate: 75  },
    { code: 'A19', name: 'Entrance Node A19',   name_sq: 'Nyja e Hyrjes A19',  area_sqm: 40,  cap: 35,  rate: 70  },
  ].map(({ name, name_sq, area_sqm, cap, rate, code }, i) => {
    const states: AvailabilityState[] = ['available', 'available', 'available', 'reserved', 'pending', 'available', 'available', 'blocked', 'available', 'available', 'reserved', 'available', 'available', 'pending', 'available', 'reserved', 'available', 'available', 'pending']
    const descriptions = [
      'Premium modular space on the octagonal perimeter ring of the newly revitalized Pyramid of Tirana, perfect for workshops and tech events. Its radial geometry and exposed concrete finish create a distinctive backdrop for up to {cap} guests.',
      'Contemporary exhibition room located within the Pyramid\'s ground-floor radial extension, designed for flexible event programming. Natural light and open sightlines accommodate {cap} guests in theater, roundtable, or standing configurations.',
      'Versatile event space forming part of the Pyramid\'s iconic perimeter arcade — a space that blends MVRDV\'s architectural vision with practical functionality for {cap} guests. Ideal for networking events, product showcases, and creative workshops.',
    ]
    const desc = descriptions[i % 3].replace('{cap}', String(cap))
    return {
      id: `ext-${code.toLowerCase()}`, code, name, name_sq,
      floor: 'l0' as const, category: 'extension' as const,
      area_sqm, capacity_pax: cap,
      ceiling_m: 3.6,
      hourly_rate_eur: rate,
      setup_types: ['roundtable', 'standing', 'flex'],
      features: i % 3 === 0 ? ['projector', 'natural_light'] : ['natural_light'],
      description: desc,
      // Rotate through the 3 isometrics — never a flat blueprint
      photo_urls: [pick(ISO, i)],
      availability: states[i],
    }
  }),

  // ── EXTERIOR BOXES (BE1–BE16) ──────────────────────────────────────────
  ...Array.from({ length: 16 }, (_, i) => {
    const code = `BE${i + 1}`
    const colors = ['blue', 'orange', 'green', 'yellow', 'red', 'purple', 'teal', 'coral', 'blue', 'orange', 'green', 'yellow', 'red', 'purple', 'teal', 'coral'] as const
    const states: AvailabilityState[] = ['available', 'available', 'reserved', 'available', 'pending', 'available', 'available', 'available', 'reserved', 'available', 'available', 'blocked', 'available', 'available', 'pending', 'available']
    const categoryDescriptions = [
      'technology', 'food and beverage', 'services', 'retail',
    ]
    const cat = categoryDescriptions[i % 4]
    const area = 86 + (i % 6) * 18
    const cap  = 40 + (i % 4) * 25
    return {
      id: `ext-box-${i + 1}`, code, name: `Exterior Box ${i + 1}`, name_sq: `Kuti Eksteriore ${i + 1}`,
      floor: 'exterior' as const, category: 'exterior_box' as const, color: colors[i],
      area_sqm: area, capacity_pax: cap,
      ceiling_m: 3.0,
      hourly_rate_eur: 65 + (i % 4) * 12,
      setup_types: ['standing', 'flex', 'roundtable'],
      features: ['natural_light'],
      description: `One of 16 MVRDV-designed coloured volumes scattered around the Pyramid's base, this ${area} m² ${cat} box brings bold architectural identity to every activation. Purpose-built for pop-ups, brand experiences, and social events accommodating ${cap} guests on the city's most iconic façade.`,
      // Real exterior photography — never empty
      photo_urls: [pick(EXTERIOR, i), pick(AERIAL, i)],
      availability: states[i],
    }
  }),

  // ── L3 COLOURED BOXES ─────────────────────────────────────────────────
  {
    id: 'l3-red', code: 'L3-RED', name: 'Red Box · L+3', name_sq: 'Kuti e Kuqe · K+3',
    floor: 'l3', category: 'hero', color: 'red',
    area_sqm: 86, capacity_pax: 80, ceiling_m: 4.2, hourly_rate_eur: 120,
    setup_types: ['theater', 'standing'],
    features: ['projector', 'natural_light'],
    description: 'Bold red volume suspended on the third level with panoramic views across the Pyramid\'s central atrium — a dramatic setting for brand events and private gatherings. At 86 m² with 4.2 m ceilings, it seats 80 guests in theater or 80 standing for cocktail receptions.',
    photo_urls: [pick(INTERIOR, 0), pick(ISO, 0)],
    availability: 'available',
  },
  {
    id: 'l3-purple', code: 'L3-PURPLE', name: 'Purple Box · L+3', name_sq: 'Kuti Vjollce · K+3',
    floor: 'l3', category: 'hero', color: 'purple',
    area_sqm: 72, capacity_pax: 60, ceiling_m: 4.0, hourly_rate_eur: 100,
    setup_types: ['roundtable', 'flex'],
    features: ['natural_light'],
    description: 'Intimate purple cube on the upper ring of the Pyramid, offering a secluded atmosphere ideal for board meetings, private dining, and creative sessions for up to 60 guests. The 4.0 m ceiling and jewel-toned interior make this one of the most sought-after spaces in the building.',
    photo_urls: [pick(INTERIOR, 1), pick(ISO, 1)],
    availability: 'reserved',
  },
  {
    id: 'l3-blue', code: 'L3-BLUE', name: 'Blue Box · L+3', name_sq: 'Kuti Blu · K+3',
    floor: 'l3', category: 'hero', color: 'blue',
    area_sqm: 98, capacity_pax: 90, ceiling_m: 4.5, hourly_rate_eur: 130,
    setup_types: ['theater', 'roundtable'],
    features: ['projector', 'natural_light'],
    description: 'Upper-level blue box with suspended atrium views and integrated projection — an elevated platform for conferences, press events, and roundtables for up to 90 guests. At 98 m² and 4.5 m height, it is the largest of the L+3 coloured volumes.',
    photo_urls: [pick(INTERIOR, 2), pick(ISO, 2)],
    availability: 'available',
  },
  {
    id: 'l3-yellow', code: 'L3-YELLOW', name: 'Yellow Box · L+3', name_sq: 'Kuti Verdhë · K+3',
    floor: 'l3', category: 'hero', color: 'yellow',
    area_sqm: 64, capacity_pax: 50, ceiling_m: 3.8, hourly_rate_eur: 90,
    setup_types: ['flex', 'standing'],
    features: ['natural_light'],
    description: 'Compact yellow volume on the third level — the perfect venue for focused workshops, private dinners, and intimate creative sessions for up to 50 guests. Its warm palette and compact footprint (64 m²) create a cosy, focused atmosphere unlike anything else in the building.',
    photo_urls: [pick(INTERIOR, 3), pick(ISO, 0)],
    availability: 'available',
  },
  {
    id: 'l3-green', code: 'L3-GREEN', name: 'Green Box · L+3', name_sq: 'Kuti Gjelbër · K+3',
    floor: 'l3', category: 'hero', color: 'green',
    area_sqm: 80, capacity_pax: 70, ceiling_m: 4.0, hourly_rate_eur: 110,
    setup_types: ['theater', 'flex'],
    features: ['natural_light'],
    description: 'Green cube suspended mid-atrium on Level 3, offering unobstructed views of the Pyramid\'s extraordinary interior landscape and flexible configuration for 70 guests. Ideal for tech demos, workshop series, and cross-disciplinary events.',
    photo_urls: [pick(INTERIOR, 4), pick(ISO, 1)],
    availability: 'pending',
  },
  {
    id: 'l3-orange', code: 'L3-ORANGE', name: 'Orange Box · L+3', name_sq: 'Kuti Portokalli · K+3',
    floor: 'l3', category: 'hero', color: 'orange',
    area_sqm: 76, capacity_pax: 65, ceiling_m: 4.0, hourly_rate_eur: 105,
    setup_types: ['standing', 'roundtable'],
    features: ['natural_light'],
    description: 'Vibrant orange volume perched on the upper atrium ring with striking visual presence from every floor of the Pyramid. At 76 m², it accommodates 65 guests and is particularly suited for networking receptions and design-led brand activations.',
    photo_urls: [pick(INTERIOR, 5), pick(ISO, 2)],
    availability: 'available',
  },

  // ── ROOFTOP BOXES ─────────────────────────────────────────────────────
  {
    id: 'roof-yellow', code: 'ROOF-YELLOW', name: 'Yellow Roof Box', name_sq: 'Kuti Verdhë e Çatisë',
    floor: 'roof', category: 'exterior_box', color: 'yellow',
    area_sqm: 112, capacity_pax: 80, ceiling_m: 3.2, hourly_rate_eur: 140,
    setup_types: ['standing', 'flex', 'roundtable'],
    features: ['natural_light'],
    description: 'Rooftop yellow volume with panoramic views of Tirana and Mount Dajti — the most photographed space in the Pyramid and the city\'s most coveted venue for sunset receptions. At 112 m², it accommodates 80 guests with the whole Albanian capital as backdrop.',
    photo_urls: ['/pyramid/mvrdv-26.jpg', pick(AERIAL, 0), pick(ISO, 0)],
    availability: 'available',
  },
  {
    id: 'roof-red', code: 'ROOF-RED', name: 'Red Roof Box', name_sq: 'Kuti e Kuqe e Çatisë',
    floor: 'roof', category: 'exterior_box', color: 'red',
    area_sqm: 96, capacity_pax: 65, ceiling_m: 3.2, hourly_rate_eur: 135,
    setup_types: ['standing', 'flex'],
    features: ['natural_light'],
    description: 'Bold red rooftop volume — an iconic presence in Tirana\'s skyline, visible from across the city and ideal for launches and receptions with maximum visual impact for 65 guests. Its elevated position and crimson exterior make every event photographed from afar.',
    photo_urls: ['/pyramid/mvrdv-27.jpg', pick(AERIAL, 1), pick(ISO, 1)],
    availability: 'reserved',
  },
  {
    id: 'roof-orange', code: 'ROOF-ORANGE', name: 'Orange Roof Box', name_sq: 'Kuti Portokalli e Çatisë',
    floor: 'roof', category: 'exterior_box', color: 'orange',
    area_sqm: 104, capacity_pax: 75, ceiling_m: 3.2, hourly_rate_eur: 138,
    setup_types: ['standing', 'flex', 'roundtable'],
    features: ['natural_light'],
    description: 'Orange rooftop space with uninterrupted views of the city and Mount Dajti beyond — a premium outdoor-adjacent venue for 75 guests at the very peak of Tirana\'s architectural landmark. Perfect for corporate gatherings, brand events, and celebratory dinners under the open sky.',
    photo_urls: ['/pyramid/mvrdv-28.jpg', pick(AERIAL, 2), pick(ISO, 2)],
    availability: 'available',
  },
  {
    id: 'roof-purple', code: 'ROOF-PURPLE', name: 'Purple Roof Box', name_sq: 'Kuti Vjollce e Çatisë',
    floor: 'roof', category: 'exterior_box', color: 'purple',
    area_sqm: 88, capacity_pax: 55, ceiling_m: 3.2, hourly_rate_eur: 125,
    setup_types: ['standing', 'flex'],
    features: ['natural_light'],
    description: 'Intimate purple rooftop cube overlooking the whole of Tirana — a refined setting for exclusive private receptions, board dinners, and VIP activations for up to 55 guests. Its restrained scale and jewel-toned exterior make it the most exclusive rooftop address in the country.',
    photo_urls: ['/pyramid/mvrdv-29.jpg', pick(AERIAL, 3), pick(ISO, 0)],
    availability: 'available',
  },

  // ── BASEMENT L-1 ───────────────────────────────────────────────────────
  ...Array.from({ length: 6 }, (_, i) => {
    const code = `B${i + 1}`
    const area = 110 + i * 20
    const cap  = 80 + i * 15
    return {
      id: `basement-${i + 1}`, code, name: `Basement ${code}`, name_sq: `Bodrum ${code}`,
      floor: 'l_minus_1' as const, category: 'extension' as const,
      area_sqm: area, capacity_pax: cap,
      ceiling_m: 3.8,
      hourly_rate_eur: 85 + i * 10,
      setup_types: ['theater', 'roundtable', 'exhibition'],
      features: ['projector'],
      description: `Premium basement-level space at L-1 of the Pyramid of Tirana — its ${area} m² floor plate and 3.8 m ceiling create an intimate, focused atmosphere for conferences, film screenings, and immersive performances. Accommodates ${cap} guests with full blackout capability and direct access from the central atrium.`,
      // Isometric renders — appropriate for underground spaces with no exterior views
      photo_urls: [pick(ISO, i), pick(INTERIOR, i + 3)],
      availability: (i % 3 === 0 ? 'reserved' : 'available') as AvailabilityState,
    }
  }),
]

// ─── Assets ──────────────────────────────────────────────────────────────────

export const MOCK_ASSETS: Asset[] = [
  { id: 'a1',  type: 'chair',      name: 'Conference Chair',         total_qty: 600, available_qty: 520, storage_location: 'storage-l-1-a',  unit_rate_eur: 0.5 },
  { id: 'a2',  type: 'table_round',name: 'Round Table 180cm',        total_qty: 80,  available_qty: 68,  storage_location: 'storage-l-1-b',  unit_rate_eur: 5   },
  { id: 'a3',  type: 'table_rect', name: 'Rectangular Table 200cm',  total_qty: 60,  available_qty: 55,  storage_location: 'storage-l-1-b',  unit_rate_eur: 4   },
  { id: 'a4',  type: 'microphone', name: 'Wireless Handheld Mic',    total_qty: 30,  available_qty: 22,  storage_location: 'av-booth-l3',     unit_rate_eur: 8   },
  { id: 'a5',  type: 'projector',  name: '4K Laser Projector',       total_qty: 12,  available_qty: 10,  storage_location: 'av-booth-l3',     unit_rate_eur: 45  },
  { id: 'a6',  type: 'screen',     name: 'Motorised Screen 3m',      total_qty: 18,  available_qty: 16,  storage_location: 'av-booth-l3',     unit_rate_eur: 20  },
  { id: 'a7',  type: 'speaker',    name: 'Line Array Speaker Pair',  total_qty: 24,  available_qty: 18,  storage_location: 'av-booth-l3',     unit_rate_eur: 35  },
  { id: 'a8',  type: 'lighting',   name: 'LED Par Can (set of 6)',   total_qty: 12,  available_qty: 9,   storage_location: 'storage-l-1-c',  unit_rate_eur: 60  },
  { id: 'a9',  type: 'stage',      name: 'Stage Platform 2×1m',      total_qty: 6,   available_qty: 5,   storage_location: 'storage-l-1-a',  unit_rate_eur: 80  },
  { id: 'a10', type: 'barrier',    name: 'Crowd Barrier 2m',         total_qty: 40,  available_qty: 40,  storage_location: 'storage-l-1-a',  unit_rate_eur: 3   },
  { id: 'a11', type: 'cable',      name: 'XLR Cable 10m',            total_qty: 200, available_qty: 180, storage_location: 'av-booth-l3',     unit_rate_eur: 1   },
]

// ─── In-memory event store (mutable) ─────────────────────────────────────────

export const MOCK_EVENTS: Event[] = [
  {
    id: 'evt-001', reference_code: 'PB-2026-001',
    title: 'Tech Summit Tirana', event_type: 'conference',
    organizer_name: 'Ardi Mëhilli', organizer_email: 'ardi@techsummit.al', organizer_org: 'Tech Summit ALB',
    attendees_count: 250, status: 'confirmed',
    start_at: new Date(Date.now() + 86400000).toISOString(),
    end_at: new Date(Date.now() + 86400000 + 14400000).toISOString(),
    setup_start_at: new Date(Date.now() + 86400000 - 7200000).toISOString(),
    teardown_end_at: new Date(Date.now() + 86400000 + 18000000).toISOString(),
    spaces: [MOCK_SPACES[0]],
    assets: [
      { asset: MOCK_ASSETS[0], quantity: 250 },
      { asset: MOCK_ASSETS[4], quantity: 2 },
      { asset: MOCK_ASSETS[6], quantity: 2 },
    ],
    notes: 'Bilingual simultaneous translation required.',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'evt-002', reference_code: 'PB-2026-002',
    title: 'MVRDV Architecture Talk', event_type: 'workshop',
    organizer_name: 'Elona Berisha', organizer_email: 'elona@architecture.al', organizer_org: 'AKPT',
    attendees_count: 80, status: 'confirmed',
    start_at: new Date(Date.now() + 86400000 * 2).toISOString(),
    end_at: new Date(Date.now() + 86400000 * 2 + 10800000).toISOString(),
    spaces: [MOCK_SPACES[5]],
    assets: [
      { asset: MOCK_ASSETS[0], quantity: 80 },
      { asset: MOCK_ASSETS[4], quantity: 1 },
    ],
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'evt-003', reference_code: 'PB-2026-003',
    title: 'Startup Albania Launch Night', event_type: 'reception',
    organizer_name: 'Gent Shllaku', organizer_email: 'gent@startup.al', organizer_org: 'Startup Albania',
    attendees_count: 120, status: 'quoted',
    start_at: new Date(Date.now() + 86400000 * 3).toISOString(),
    end_at: new Date(Date.now() + 86400000 * 3 + 10800000).toISOString(),
    spaces: [MOCK_SPACES[1]],
    assets: [
      { asset: MOCK_ASSETS[0], quantity: 120 },
    ],
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const MOCK_TASKS: Task[] = [
  { id: 't1', event_id: 'evt-001', title: 'Stage assembly — Blue Space',  team: 'logistics', due_at: new Date(Date.now() + 86400000 - 7200000).toISOString(),              status: 'pending' },
  { id: 't2', event_id: 'evt-001', title: 'AV system calibration',         team: 'av',        due_at: new Date(Date.now() + 86400000 - 5400000).toISOString(),              status: 'pending', depends_on_task_id: 't1' },
  { id: 't3', event_id: 'evt-001', title: 'Chair placement (250 seats)',    team: 'logistics', due_at: new Date(Date.now() + 86400000 - 3600000).toISOString(),              status: 'pending' },
  { id: 't4', event_id: 'evt-001', title: 'Reception desk setup',           team: 'reception', due_at: new Date(Date.now() + 86400000 - 1800000).toISOString(),              status: 'pending' },
  { id: 't5', event_id: 'evt-001', title: 'Post-event teardown',            team: 'logistics', due_at: new Date(Date.now() + 86400000 + 18000000).toISOString(),             status: 'pending' },
  { id: 't6', event_id: 'evt-001', title: 'AV equipment return',            team: 'av',        due_at: new Date(Date.now() + 86400000 + 18000000 + 1800000).toISOString(),  status: 'pending' },
]

export const MOCK_QUOTES: Quote[] = [
  {
    id: 'q1', event_id: 'evt-003',
    line_items: [
      { description: 'Orange Space rental (3 hours)', quantity: 3, unit_price: 150, total: 450 },
      { description: 'Conference Chair × 120',        quantity: 120, unit_price: 0.5, total: 60  },
    ],
    subtotal: 510, tax: 91.8, total: 601.8, currency: 'EUR',
    generated_at: new Date(Date.now() - 3600000).toISOString(),
    valid_until:  new Date(Date.now() + 86400000 * 7).toISOString(),
  },
]

export const MOCK_CONFLICTS: Conflict[] = [
  {
    id: 'c1',
    type: 'space_double_booked',
    severity: 'high',
    description: 'Orange Space has overlapping requests from PB-2026-003 and an unconfirmed inquiry on the same day.',
    related_event_ids: ['evt-003'],
    related_space_ids: ['hero-orange'],
  },
]

// ─── Helper: get availability for a space at a given time ────────────────────

export function getAvailability(spaceId: string, from?: string, to?: string): AvailabilityState {
  if (!from || !to) return MOCK_SPACES.find(s => s.id === spaceId)?.availability ?? 'available'
  const start = new Date(from).getTime()
  const end   = new Date(to).getTime()
  const conflict = MOCK_EVENTS.find(e =>
    e.spaces.some(s => s.id === spaceId) &&
    ['confirmed', 'in_progress', 'quoted'].includes(e.status) &&
    new Date(e.start_at).getTime() < end &&
    new Date(e.end_at).getTime() > start
  )
  return conflict ? 'reserved' : 'available'
}

// ─── Counter for new reference codes ─────────────────────────────────────────

let _refCounter = MOCK_EVENTS.length + 1
export function nextRefCode(): string {
  return `PB-2026-${String(++_refCounter).padStart(3, '0')}`
}

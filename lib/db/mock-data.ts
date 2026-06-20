/**
 * In-memory mock store for Phase 4 development.
 * Replace each query with a real Supabase call once .env.local is populated.
 * All shapes match the types in /types/api.ts exactly.
 */
import type { SpaceWithAvailability, Asset, Event, Quote, Task, Conflict, AvailabilityState } from '@/types/api'

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
    description: 'The flagship event volume — a striking blue cube suspended inside the central atrium. Full AV integration, panoramic internal views, access from all floors.',
    photo_urls: ['/pyramid/mvrdv-15.jpg', '/pyramid/mvrdv-10.jpg'],
    availability: 'available',
  },
  {
    id: 'hero-orange', code: 'ORANGE', name: 'Orange Space', name_sq: 'Hapësira Portokalli',
    floor: 'l0', category: 'hero', color: 'orange',
    area_sqm: 180, capacity_pax: 220, ceiling_m: 5.8,
    hourly_rate_eur: 150,
    setup_types: ['theater', 'roundtable', 'standing', 'flex'],
    features: ['projector', 'speaker', 'natural_light'],
    description: 'Warm-toned creative volume. Ideal for product launches, design workshops, and panel discussions.',
    photo_urls: ['/pyramid/mvrdv-10.jpg'],
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
    description: 'Basement-level hero space with dramatic low ceiling. Favoured for immersive exhibitions and intimate showcases.',
    photo_urls: ['/pyramid/mvrdv-13.jpg'],
    availability: 'available',
  },
  {
    id: 'hero-yellow', code: 'YELLOW', name: 'Yellow Space', name_sq: 'Hapësira Verdhë',
    floor: 'l_minus_1', category: 'hero', color: 'yellow',
    area_sqm: 120, capacity_pax: 140, ceiling_m: 4.8,
    hourly_rate_eur: 110,
    setup_types: ['theater', 'standing', 'flex'],
    features: ['projector', 'speaker'],
    description: 'Golden cube on the lower level. Perfect for workshops, meetups, and small performances.',
    photo_urls: ['/pyramid/mvrdv-11.jpg'],
    availability: 'available',
  },

  // ── GROUND FLOOR EXTENSION (A1–A15) ──────────────────────────────────────
  ...Array.from({ length: 15 }, (_, i) => {
    const code = `A${i + 1}`
    const states: AvailabilityState[] = ['available', 'available', 'available', 'reserved', 'pending', 'available', 'available', 'blocked', 'available', 'available', 'reserved', 'available', 'available', 'pending', 'available']
    return {
      id: `ext-${code.toLowerCase()}`, code, name: `Space ${code}`, name_sq: `Hapësira ${code}`,
      floor: 'l0' as const, category: 'extension' as const,
      area_sqm: 85 + (i % 4) * 8, capacity_pax: 90 + (i % 5) * 8,
      ceiling_m: 3.6,
      hourly_rate_eur: 95 + (i % 3) * 15,
      setup_types: ['roundtable', 'standing', 'flex'],
      features: i % 3 === 0 ? ['projector', 'natural_light'] : ['natural_light'],
      description: `Extension room on the ground-floor radial ring. Flexible layout with 2px concrete borders visible on three sides.`,
      photo_urls: [],
      availability: states[i],
    }
  }),

  // ── EXTERIOR BOXES (BE1–BE16) ──────────────────────────────────────────
  ...Array.from({ length: 16 }, (_, i) => {
    const code = `BE${i + 1}`
    const colors = ['blue', 'orange', 'green', 'yellow', 'red', 'purple', 'teal', 'coral', 'blue', 'orange', 'green', 'yellow', 'red', 'purple', 'teal', 'coral'] as const
    const states: AvailabilityState[] = ['available', 'available', 'reserved', 'available', 'pending', 'available', 'available', 'available', 'reserved', 'available', 'available', 'blocked', 'available', 'available', 'pending', 'available']
    return {
      id: `ext-box-${i + 1}`, code, name: `Exterior Box ${i + 1}`, name_sq: `Kuti Eksteriore ${i + 1}`,
      floor: 'exterior' as const, category: 'exterior_box' as const, color: colors[i],
      area_sqm: 86 + (i % 6) * 18, capacity_pax: 40 + (i % 4) * 25,
      ceiling_m: 3.0,
      hourly_rate_eur: 65 + (i % 4) * 12,
      setup_types: ['standing', 'flex', 'roundtable'],
      features: ['natural_light'],
      description: `MVRDV coloured exterior box — one of 16 scattered volumes around the Pyramid's base. Ideal for pop-ups, retail, and social events.`,
      photo_urls: [],
      availability: states[i],
    }
  }),

  // ── L3 COLOURED BOXES ─────────────────────────────────────────────────
  { id: 'l3-red', code: 'L3-RED', name: 'Red Box · L+3', name_sq: 'Kuti e Kuqe · K+3', floor: 'l3', category: 'hero', color: 'red', area_sqm: 86, capacity_pax: 80, ceiling_m: 4.2, hourly_rate_eur: 120, setup_types: ['theater', 'standing'], features: ['projector', 'natural_light'], description: 'Red volume on the third level with views across the atrium.', photo_urls: ['/pyramid/mvrdv-13.jpg'], availability: 'available' },
  { id: 'l3-purple', code: 'L3-PURPLE', name: 'Purple Box · L+3', name_sq: 'Kuti Vjollce · K+3', floor: 'l3', category: 'hero', color: 'purple', area_sqm: 72, capacity_pax: 60, ceiling_m: 4.0, hourly_rate_eur: 100, setup_types: ['roundtable', 'flex'], features: ['natural_light'], description: 'Intimate purple cube on the upper ring.', photo_urls: [], availability: 'reserved' },
  { id: 'l3-blue', code: 'L3-BLUE', name: 'Blue Box · L+3', name_sq: 'Kuti Blu · K+3', floor: 'l3', category: 'hero', color: 'blue', area_sqm: 98, capacity_pax: 90, ceiling_m: 4.5, hourly_rate_eur: 130, setup_types: ['theater', 'roundtable'], features: ['projector', 'natural_light'], description: 'Upper-level blue box with suspended atrium views.', photo_urls: [], availability: 'available' },
  { id: 'l3-yellow', code: 'L3-YELLOW', name: 'Yellow Box · L+3', name_sq: 'Kuti Verdhë · K+3', floor: 'l3', category: 'hero', color: 'yellow', area_sqm: 64, capacity_pax: 50, ceiling_m: 3.8, hourly_rate_eur: 90, setup_types: ['flex', 'standing'], features: ['natural_light'], description: 'Compact yellow volume, great for workshops and private dinners.', photo_urls: [], availability: 'available' },
  { id: 'l3-green', code: 'L3-GREEN', name: 'Green Box · L+3', name_sq: 'Kuti Gjelbër · K+3', floor: 'l3', category: 'hero', color: 'green', area_sqm: 80, capacity_pax: 70, ceiling_m: 4.0, hourly_rate_eur: 110, setup_types: ['theater', 'flex'], features: ['natural_light'], description: 'Green cube suspended mid-atrium.', photo_urls: [], availability: 'pending' },
  { id: 'l3-orange', code: 'L3-ORANGE', name: 'Orange Box · L+3', name_sq: 'Kuti Portokalli · K+3', floor: 'l3', category: 'hero', color: 'orange', area_sqm: 76, capacity_pax: 65, ceiling_m: 4.0, hourly_rate_eur: 105, setup_types: ['standing', 'roundtable'], features: ['natural_light'], description: 'Vibrant orange volume on the upper atrium ring.', photo_urls: [], availability: 'available' },

  // ── ROOFTOP BOXES ─────────────────────────────────────────────────────
  { id: 'roof-yellow', code: 'ROOF-YELLOW', name: 'Yellow Roof Box', name_sq: 'Kuti Verdhë e Çatisë', floor: 'roof', category: 'exterior_box', color: 'yellow', area_sqm: 112, capacity_pax: 80, ceiling_m: 3.2, hourly_rate_eur: 140, setup_types: ['standing', 'flex', 'roundtable'], features: ['natural_light'], description: 'Rooftop yellow volume with panoramic views of Tirana and Mount Dajti. The most photographed space in the building.', photo_urls: ['/pyramid/mvrdv-26.jpg'], availability: 'available' },
  { id: 'roof-red', code: 'ROOF-RED', name: 'Red Roof Box', name_sq: 'Kuti e Kuqe e Çatisë', floor: 'roof', category: 'exterior_box', color: 'red', area_sqm: 96, capacity_pax: 65, ceiling_m: 3.2, hourly_rate_eur: 135, setup_types: ['standing', 'flex'], features: ['natural_light'], description: 'Bold red rooftop volume — iconic in Tirana\'s skyline.', photo_urls: ['/pyramid/mvrdv-26.jpg'], availability: 'reserved' },
  { id: 'roof-orange', code: 'ROOF-ORANGE', name: 'Orange Roof Box', name_sq: 'Kuti Portokalli e Çatisë', floor: 'roof', category: 'exterior_box', color: 'orange', area_sqm: 104, capacity_pax: 75, ceiling_m: 3.2, hourly_rate_eur: 138, setup_types: ['standing', 'flex', 'roundtable'], features: ['natural_light'], description: 'Orange rooftop space with city and mountain panorama.', photo_urls: [], availability: 'available' },
  { id: 'roof-purple', code: 'ROOF-PURPLE', name: 'Purple Roof Box', name_sq: 'Kuti Vjollce e Çatisë', floor: 'roof', category: 'exterior_box', color: 'purple', area_sqm: 88, capacity_pax: 55, ceiling_m: 3.2, hourly_rate_eur: 125, setup_types: ['standing', 'flex'], features: ['natural_light'], description: 'Intimate purple rooftop cube. Ideal for private receptions.', photo_urls: [], availability: 'available' },

  // ── BASEMENT L-1 ───────────────────────────────────────────────────────
  ...Array.from({ length: 6 }, (_, i) => {
    const code = `B${i + 1}`
    return {
      id: `basement-${i + 1}`, code, name: `Basement ${code}`, name_sq: `Bodrum ${code}`,
      floor: 'l_minus_1' as const, category: 'extension' as const,
      area_sqm: 110 + i * 20, capacity_pax: 80 + i * 15,
      ceiling_m: 3.8,
      hourly_rate_eur: 85 + i * 10,
      setup_types: ['theater', 'roundtable', 'exhibition'],
      features: ['projector'],
      description: `Basement-level room. Lower ceiling height creates intimate atmosphere for focused events.`,
      photo_urls: [],
      availability: (i % 3 === 0 ? 'reserved' : 'available') as AvailabilityState,
    }
  }),
]

// ─── Assets ──────────────────────────────────────────────────────────────────

export const MOCK_ASSETS: Asset[] = [
  { id: 'a1', type: 'chair', name: 'Conference Chair', total_qty: 600, available_qty: 520, storage_location: 'storage-l-1-a', unit_rate_eur: 0.5 },
  { id: 'a2', type: 'table_round', name: 'Round Table 180cm', total_qty: 80, available_qty: 68, storage_location: 'storage-l-1-b', unit_rate_eur: 5 },
  { id: 'a3', type: 'table_rect', name: 'Rectangular Table 200cm', total_qty: 60, available_qty: 55, storage_location: 'storage-l-1-b', unit_rate_eur: 4 },
  { id: 'a4', type: 'microphone', name: 'Wireless Handheld Mic', total_qty: 30, available_qty: 22, storage_location: 'av-booth-l3', unit_rate_eur: 8 },
  { id: 'a5', type: 'projector', name: '4K Laser Projector', total_qty: 12, available_qty: 10, storage_location: 'av-booth-l3', unit_rate_eur: 45 },
  { id: 'a6', type: 'screen', name: 'Motorised Screen 3m', total_qty: 18, available_qty: 16, storage_location: 'av-booth-l3', unit_rate_eur: 20 },
  { id: 'a7', type: 'speaker', name: 'Line Array Speaker Pair', total_qty: 24, available_qty: 18, storage_location: 'av-booth-l3', unit_rate_eur: 35 },
  { id: 'a8', type: 'lighting', name: 'LED Par Can (set of 6)', total_qty: 12, available_qty: 9, storage_location: 'storage-l-1-c', unit_rate_eur: 60 },
  { id: 'a9', type: 'stage', name: 'Stage Platform 2×1m', total_qty: 6, available_qty: 5, storage_location: 'storage-l-1-a', unit_rate_eur: 80 },
  { id: 'a10', type: 'barrier', name: 'Crowd Barrier 2m', total_qty: 40, available_qty: 40, storage_location: 'storage-l-1-a', unit_rate_eur: 3 },
  { id: 'a11', type: 'cable', name: 'XLR Cable 10m', total_qty: 200, available_qty: 180, storage_location: 'av-booth-l3', unit_rate_eur: 1 },
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
  { id: 't1', event_id: 'evt-001', title: 'Stage assembly — Blue Space', team: 'logistics', due_at: new Date(Date.now() + 86400000 - 7200000).toISOString(), status: 'pending' },
  { id: 't2', event_id: 'evt-001', title: 'AV system calibration', team: 'av', due_at: new Date(Date.now() + 86400000 - 5400000).toISOString(), status: 'pending', depends_on_task_id: 't1' },
  { id: 't3', event_id: 'evt-001', title: 'Chair placement (250 seats)', team: 'logistics', due_at: new Date(Date.now() + 86400000 - 3600000).toISOString(), status: 'pending' },
  { id: 't4', event_id: 'evt-001', title: 'Reception desk setup', team: 'reception', due_at: new Date(Date.now() + 86400000 - 1800000).toISOString(), status: 'pending' },
  { id: 't5', event_id: 'evt-001', title: 'Post-event teardown', team: 'logistics', due_at: new Date(Date.now() + 86400000 + 18000000).toISOString(), status: 'pending' },
  { id: 't6', event_id: 'evt-001', title: 'AV equipment return', team: 'av', due_at: new Date(Date.now() + 86400000 + 18000000 + 1800000).toISOString(), status: 'pending' },
]

export const MOCK_QUOTES: Quote[] = [
  {
    id: 'q1', event_id: 'evt-003',
    line_items: [
      { description: 'Orange Space rental (3 hours)', quantity: 3, unit_price: 150, total: 450 },
      { description: 'Conference Chair × 120', quantity: 120, unit_price: 0.5, total: 60 },
    ],
    subtotal: 510, tax: 91.8, total: 601.8, currency: 'EUR',
    generated_at: new Date(Date.now() - 3600000).toISOString(),
    valid_until: new Date(Date.now() + 86400000 * 7).toISOString(),
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
  const end = new Date(to).getTime()
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

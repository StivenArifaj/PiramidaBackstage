# Piramida Backstage — Master Plan
**JunctionX Tirana 2026 · Pyramid Backstage Challenge · AADF**

> The single source of truth for this 48-hour build. Read top-to-bottom once. Then reference sections individually. Gemini uses this file to generate Claude Code prompts; Claude Code uses it as authoritative context.

---

## 0. What to attach (READ THIS FIRST)

Put these files in `/docs/references/` in the repo and **always attach the relevant ones to every Gemini prompt and every Claude Code prompt**, plus the **full master plan file itself** as context.

### Files to save in `/docs/references/` (rename exactly as listed)

| Filename | Source | Used for |
|---|---|---|
| `aerial-top-down.jpg` | uploaded Image 4 (windmill aerial at night) | Landing hero, radial floor plan geometry reference |
| `aerial-three-quarter-a.jpg` | uploaded Image 5 | Detail-page video frames, floor selector elevation |
| `aerial-three-quarter-b.jpg` | uploaded Image 6 | Rooftop box visualization, atrium reference |
| `wide-context.jpg` | uploaded Image 7 | Landing hero alternate, "Pyramid in the city" framing |
| `entrance-view.jpg` | uploaded Image 8 | Ground-floor entrance card, breadcrumb anchor |
| `front-elevation.jpg` | uploaded Image 9 | Floor selector elevation (the 5 lime pills overlay) |
| `interior-atrium.jpg` | uploaded Image 10 | Interior box space cards, atrium-facing rooms |
| `interior-boxes-detail.jpg` | uploaded Image 11 | Box detail-page background, color references |
| `current-site-floor-selector.png` | uploaded Image 1 (piramida.edu.al hero) | UX reference for floor selector pattern |
| `current-site-plan-exterior.png` | uploaded Image 2 (BE1–BE16 plan) | SVG recreation source for Exterior Boxes floor |
| `current-site-plan-ground.png` | uploaded Image 3 (A1–A19 plan) | SVG recreation source for Ground Floor |
| `challenge-brief.md` | the Pyramid Backstage challenge text | Every prompt — keeps focus on the actual ask |
| `master-plan.md` | this file | Every prompt — the bible |

### Per-task attachment guide (which images go with which kind of prompt)

- **Landing/hero work** → `aerial-top-down.jpg`, `aerial-three-quarter-a.jpg`, `wide-context.jpg`, `front-elevation.jpg`
- **Floor selector / elevation overlay** → `front-elevation.jpg`, `current-site-floor-selector.png`
- **Floor plan SVG creation** → `current-site-plan-ground.png`, `current-site-plan-exterior.png`, `aerial-top-down.jpg`, plus interior photos for the 3 missing floors
- **Space detail page** → `interior-atrium.jpg`, `interior-boxes-detail.jpg`, `entrance-view.jpg`
- **Dashboard / organizer views** → no images needed beyond design tokens
- **Chatbot work** → no images needed
- **Database / API work** → no images needed

---

## 1. The project in one breath

A web app that turns the Pyramid of Tirana's fragmented event-coordination (emails, Excel, phone calls) into a single operational system. A user lands on a cinematic flythrough of the actual building, picks a floor from the elevation view, sees a top-down radial architectural plan with every space color-coded by availability, clicks a colored box to open a detail page with a video background and inline booking, and either reserves it directly or asks the AI assistant to do the whole thing in one sentence. On the back end, the system tracks 80+ spaces, ~200+ shared assets, auto-generates quotes and operational task lists, detects conflicts, and gives organizers a dashboard that visualizes the whole building's state in real time.

**Demo goal:** show a judge submitting an event request, watch the system match a space, generate a quote, reserve assets, produce a setup/teardown task list, all in under 90 seconds — then show the organizer's dashboard reflecting the change instantly. Then ask the chatbot to book a second event with a single sentence.

---

## 2. Scope (what's real vs. mocked)

**Must work end-to-end live:**
- Submitting an event request (form OR chatbot)
- Space matching by capacity/date/features
- Quote generation with line items
- Asset reservation (decrement inventory)
- Conflict detection
- Task list auto-generation
- Organizer dashboard reflecting all of the above
- The 5 floor plans rendered as interactive SVGs
- The detail page with scroll-scrubbed video background
- The Gemini chatbot with real function calls

**Acceptable to mock:**
- Real payments (Stripe etc.) — show a fake "payment received" toast
- Real email sending — log to console / show a fake "email sent" UI
- QR code scanning for asset tracking — show QR codes but don't actually scan
- SMS notifications
- Real-time websocket pushes (poll-on-focus is fine)
- User authentication (single-tenant; show role switcher in nav: "Organizer" vs "Customer")

---

## 3. Tech stack (locked — do not deviate)

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | Single repo, single deploy, shared types as the contract |
| Database / Auth / Storage | **Supabase (Postgres + Auth + Storage)** | Hackathon meta — everything in one place, free tier |
| Styling | **Tailwind CSS + tailwind-merge + clsx** | Custom design tokens, no shadcn defaults |
| Animation | **Framer Motion + GSAP (ScrollTrigger)** | Framer for UI, GSAP for the scroll-scrubbed video |
| LLM | **Gemini 2.0 Flash** via `@google/generative-ai` | Free tier, 1500 req/day, native function calling |
| Fonts | **Space Grotesk + Inter + JetBrains Mono** | Self-host via `next/font/google` |
| Deployment | **Vercel** (frontend) + Supabase (DB) | Free, instant, one git push |
| Env management | `.env.local` (gitignored) | Standard |

### Required env vars

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
```

---

## 4. Design system (LOCKED — never deviate)

### Five rules

1. **Cubes, not cards.** Hard 2px black borders, no border-radius, no drop shadows. Containers may overlap and stack like MVRDV's boxes.
2. **30° diagonals.** Section dividers cut at 30°. Transitions slide on 30°.
3. **Concrete + lime + jewels.** 70% concrete neutrals · 20% Pyramid lime (`#c8da2b`) for activation/availability only · 10% MVRDV jewel palette to identify spaces.
4. **Architectural typography.** Display in Space Grotesk. Body in Inter. *All numbers in JetBrains Mono* — capacity, dimensions, prices, times, IDs.
5. **The floor plan IS the interface.** Top-down radial SVGs of the actual octagonal building, clickable boxes per floor.

### Color tokens (Tailwind config `colors:` extension)

```ts
export const colors = {
  // Concrete (the matte building)
  concrete: {
    bone: '#f5f5f0',       // primary background
    light: '#fafaf5',      // secondary surface
    mid: '#e8e6dd',        // tertiary surface
    gray: '#6b7280',       // secondary text
    char: '#1a1a1a',       // primary text / hard borders
    black: '#0a0a0a',      // deepest contrast
  },
  // The signature — official Pyramid brand color
  lime: {
    DEFAULT: '#c8da2b',
    ink: '#5a6612',        // text on lime
  },
  // MVRDV box palette — each maps to a real box color in the building
  box: {
    blue: { DEFAULT: '#378ADD', ink: '#042C53', light: '#85B7EB' },
    orange: { DEFAULT: '#f4a261', ink: '#4a1b0c', light: '#FAC775' },
    green: { DEFAULT: '#97C459', ink: '#173404', light: '#C0DD97' },
    yellow: { DEFAULT: '#f9c74f', ink: '#412402', light: '#FAC775' },
    red: { DEFAULT: '#e63946', ink: '#501313', light: '#F09595' },
    pink: { DEFAULT: '#ec4899', ink: '#4B1528', light: '#F4C0D1' },
    purple: { DEFAULT: '#5a4fcf', ink: '#26215C', light: '#AFA9EC' },
    teal: { DEFAULT: '#2a9d8f', ink: '#04342C', light: '#5DCAA5' },
    coral: { DEFAULT: '#e76f51', ink: '#4A1B0C', light: '#F0997B' },
  },
  // Functional
  status: {
    available: '#c8da2b',  // = lime
    reserved: '#e63946',   // = box.red
    blocked: '#6b7280',    // = concrete.gray
    pending: '#f4a261',    // = box.orange
  },
}
```

### Typography scale

```ts
// next/font/google config
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google'
export const display = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '700'] })
export const body = Inter({ subsets: ['latin'], weight: ['400', '500'] })
export const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'] })
```

| Use | Font | Size | Weight | Letter-spacing |
|---|---|---|---|---|
| Hero display | Space Grotesk | 64–96px clamp | 500 | -0.01em |
| Page H1 | Space Grotesk | 32px | 500 | 0.01em |
| Section H2 | Space Grotesk | 22px | 500 | 0.02em |
| Card title | Space Grotesk | 16–18px | 500 | 0.04em |
| UPPERCASE label | Space Grotesk | 10–11px | 500 | 0.14em |
| Body | Inter | 14–16px | 400 | 0 |
| Mono (numbers, IDs, dimensions) | JetBrains Mono | 10–12px | 400/500 | 0.05–0.12em |

### Component primitives (in `/components/ui/`)

These are the ONLY component primitives. Everything else composes them.

- `<Cube>` — hard-edged container with 2px black border. Variants: `default`, `inset`, `floating`, `selected` (lime green outline).
- `<Pill>` — the lime pill from `current-site-floor-selector.png`. Variants: `default`, `active`.
- `<Callout>` — architectural leader line + label. Used for hover info on floor plans and dimension callouts.
- `<MonoTable>` — two-column spec table in JetBrains Mono. Label left, value right, hairline dividers.
- `<StatusDot>` — small filled circle with the status colors above. Used on floor plan boxes.
- `<SectionDivider>` — 30° diagonal slash between sections.
- `<BrandStrip>` — top nav: pyramid logo mark + "PIRAMIDA" + "BACKSTAGE" + nav links.

### What is FORBIDDEN

- Rounded corners on containers (allowed only on form inputs at `2px`)
- Gradients, glass morphism, backdrop-blur, drop shadows
- Lucide icons unless absolutely necessary (prefer text labels, hairlines, leader lines)
- The shadcn aesthetic in any form (soft cards, subtle borders, indigo accents)
- Emojis in production UI
- Title Case (use either lowercase prose or strategic UPPERCASE for labels)
- Any color outside the tokens above

---

## 5. Repo structure and ownership

Single Next.js repo. Strict folder ownership. **You and your friend can both work without ever touching the same file.** TypeScript types in `/types` are the contract.

```
piramida-backstage/
├── app/
│   ├── (marketing)/                    [friend]
│   │   ├── page.tsx                    landing with scroll video
│   │   └── layout.tsx
│   ├── spaces/                         [friend]
│   │   ├── page.tsx                    floor selector elevation view
│   │   └── [code]/page.tsx             detail page with video bg
│   ├── book/                           [friend] uses [you]'s API
│   │   ├── page.tsx                    booking flow
│   │   └── confirmation/page.tsx
│   ├── dashboard/                      [friend] uses [you]'s API
│   │   ├── page.tsx                    organizer overview
│   │   ├── events/page.tsx
│   │   ├── inventory/page.tsx
│   │   └── conflicts/page.tsx
│   ├── api/                            [you] ONLY
│   │   ├── events/route.ts             POST create, GET list
│   │   ├── events/[id]/route.ts
│   │   ├── spaces/route.ts
│   │   ├── spaces/[code]/route.ts
│   │   ├── spaces/availability/route.ts
│   │   ├── assets/route.ts
│   │   ├── quotes/route.ts
│   │   ├── quotes/[id]/route.ts
│   │   ├── conflicts/route.ts
│   │   ├── tasks/route.ts
│   │   ├── tasks/[id]/route.ts
│   │   ├── chatbot/route.ts            Gemini integration
│   │   └── dashboard/overview/route.ts
│   ├── layout.tsx                      [shared]
│   └── globals.css                     [friend] tailwind directives
├── components/
│   ├── ui/                             [friend] design system primitives
│   │   ├── cube.tsx
│   │   ├── pill.tsx
│   │   ├── callout.tsx
│   │   ├── mono-table.tsx
│   │   ├── status-dot.tsx
│   │   ├── section-divider.tsx
│   │   └── brand-strip.tsx
│   ├── pyramid/                        [friend]
│   │   ├── pyramid-logo.tsx            small SVG mark
│   │   ├── floor-selector.tsx          elevation overlay
│   │   ├── floor-plan.tsx              radial SVG with clickable boxes
│   │   ├── floor-plans/                ONE SVG per floor
│   │   │   ├── roof.svg
│   │   │   ├── l3.svg
│   │   │   ├── l0.svg
│   │   │   ├── l-1.svg
│   │   │   └── exterior.svg
│   │   ├── mini-map.tsx                persistent mini-pyramid in corner
│   │   └── scroll-video.tsx            frame-by-frame canvas player
│   ├── booking/                        [friend]
│   │   ├── booking-panel.tsx
│   │   └── quote-summary.tsx
│   ├── dashboard/                      [friend]
│   │   ├── event-row.tsx
│   │   ├── conflict-card.tsx
│   │   └── inventory-bar.tsx
│   └── chatbot/                        [friend]
│       ├── chatbot-cube.tsx            floating colored cube
│       └── chatbot-panel.tsx
├── lib/                                [you] ONLY
│   ├── db/
│   │   ├── client.ts                   supabase client
│   │   ├── server.ts                   supabase server client
│   │   └── queries/                    one file per entity
│   │       ├── spaces.ts
│   │       ├── events.ts
│   │       ├── assets.ts
│   │       └── ...
│   ├── ai/
│   │   ├── gemini.ts                   Gemini client init
│   │   ├── tools.ts                    function-call definitions
│   │   ├── system-prompt.ts            chatbot persona + rules
│   │   └── tool-handlers.ts            actual logic per tool
│   ├── pricing/
│   │   └── quote.ts                    quote generation
│   ├── availability/
│   │   ├── conflict.ts                 conflict detection
│   │   └── search.ts                   space/asset search
│   ├── tasks/
│   │   └── generate.ts                 auto-generate setup/teardown
│   └── utils.ts                        [shared]
├── types/                              [shared] — THE BOUNDARY
│   ├── api.ts                          request/response shapes
│   ├── db.ts                           Supabase row types
│   └── domain.ts                       Space, Event, Asset, etc.
├── supabase/                           [you] ONLY
│   ├── migrations/
│   │   ├── 0001_init.sql
│   │   └── 0002_seed.sql
│   └── seed.ts                         seed script
├── public/
│   ├── frames/                         [friend] scroll-video frames
│   │   ├── 0001.webp ... 0120.webp
│   └── space-photos/                   [friend] interior photos
├── docs/
│   ├── master-plan.md                  this file
│   ├── challenge-brief.md
│   └── references/                     all the photos listed in §0
├── styles/
│   └── tokens.ts                       design tokens (colors, typography)
├── tailwind.config.ts                  [friend]
├── tsconfig.json
├── package.json
└── README.md
```

### Hard rules

- **You** (backend) writes ONLY in `/app/api/`, `/lib/`, `/supabase/`, `/types/`. Never touches `/components/` or page files.
- **Friend** (frontend) writes ONLY in `/app/(marketing)/`, `/app/spaces/`, `/app/book/`, `/app/dashboard/`, `/components/`, `/public/`, `tailwind.config.ts`, `styles/`. Never touches `/lib/` or `/api/` or `/supabase/`.
- **Both** can read `/types/` but neither edits it without the other's awareness. **You** own type definitions; friend reads them. If friend needs a new field, friend opens an issue / pings on Slack and **you** add it.
- Every API endpoint returns a typed response defined in `/types/api.ts`. No untyped JSON.

---

## 6. Database schema (Supabase / Postgres)

Save as `/supabase/migrations/0001_init.sql`. Run with `supabase db push`.

```sql
-- Enable extensions
create extension if not exists "uuid-ossp";

-- =========================
-- ENUMS
-- =========================
create type space_floor as enum ('roof', 'l3', 'l0', 'l_minus_1', 'exterior');
create type space_category as enum ('hero', 'extension', 'exterior_box', 'public_area');
create type space_color as enum ('blue', 'orange', 'green', 'yellow', 'red', 'pink', 'purple', 'teal', 'coral');
create type event_status as enum ('requested', 'quoted', 'confirmed', 'in_progress', 'completed', 'cancelled');
create type asset_type as enum ('chair', 'table_round', 'table_rect', 'microphone', 'projector', 'screen', 'speaker', 'lighting', 'stage', 'barrier', 'cable', 'other');
create type asset_condition as enum ('good', 'fair', 'maintenance');
create type task_team as enum ('logistics', 'av', 'cleaning', 'security', 'catering', 'reception');
create type task_status as enum ('pending', 'in_progress', 'done', 'blocked');
create type actor_type as enum ('user', 'system', 'chatbot');

-- =========================
-- SPACES — the bookable inventory of rooms/boxes
-- =========================
create table spaces (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,                     -- 'BLUE', 'ORANGE', 'BE1', 'A4', etc.
  name text not null,                            -- 'Blue space'
  name_sq text,                                  -- Albanian name
  floor space_floor not null,
  category space_category not null,
  color space_color,                             -- MVRDV box color identity, nullable for non-colored spaces
  area_sqm numeric(6,2) not null,
  capacity_pax int not null,
  ceiling_m numeric(4,2),
  hourly_rate_eur numeric(8,2) not null,
  setup_types text[] not null default '{}',      -- ['theater','roundtable','standing','flex','exhibition']
  features text[] not null default '{}',         -- ['projector','mixer','kitchen','natural_light','av_booth']
  plan_x numeric(6,2),                           -- SVG position on floor plan (0..100 percent)
  plan_y numeric(6,2),
  description text,
  description_sq text,
  photo_urls text[] default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index idx_spaces_floor on spaces(floor);
create index idx_spaces_category on spaces(category);

-- =========================
-- ASSETS — operational equipment
-- =========================
create table assets (
  id uuid primary key default uuid_generate_v4(),
  type asset_type not null,
  name text not null,
  total_qty int not null,
  storage_location text not null,                -- e.g. 'storage-l-1-a', 'av-booth-l3'
  unit_rate_eur numeric(8,2) default 0,
  condition asset_condition not null default 'good',
  notes text,
  created_at timestamptz not null default now()
);
create index idx_assets_type on assets(type);

-- =========================
-- EVENTS — booking lifecycle
-- =========================
create table events (
  id uuid primary key default uuid_generate_v4(),
  reference_code text not null unique,           -- 'PB-2026-001'
  title text not null,
  description text,
  event_type text,                               -- 'conference','workshop','exhibition','reception','launch'
  organizer_name text not null,
  organizer_email text not null,
  organizer_phone text,
  organizer_org text,
  attendees_count int not null,
  status event_status not null default 'requested',
  start_at timestamptz not null,
  end_at timestamptz not null,
  setup_start_at timestamptz,
  teardown_end_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_events_status on events(status);
create index idx_events_dates on events(start_at, end_at);

-- =========================
-- EVENT_SPACES — events can use multiple spaces
-- =========================
create table event_spaces (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  space_id uuid not null references spaces(id),
  setup_type text,
  unique(event_id, space_id)
);

-- =========================
-- EVENT_ASSETS — assets reserved per event
-- =========================
create table event_assets (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  asset_id uuid not null references assets(id),
  quantity int not null check (quantity > 0),
  unique(event_id, asset_id)
);

-- =========================
-- QUOTES — pricing
-- =========================
create table quotes (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  line_items jsonb not null,                     -- [{description, quantity, unit_price, total}]
  subtotal numeric(10,2) not null,
  tax numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  currency text not null default 'EUR',
  generated_at timestamptz not null default now(),
  valid_until timestamptz,
  accepted_at timestamptz
);

-- =========================
-- TASKS — auto-generated operational checklist
-- =========================
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  title text not null,
  description text,
  team task_team not null,
  due_at timestamptz not null,
  status task_status not null default 'pending',
  assigned_to text,
  depends_on_task_id uuid references tasks(id),
  created_at timestamptz not null default now()
);
create index idx_tasks_event on tasks(event_id);
create index idx_tasks_status on tasks(status);

-- =========================
-- CONVERSATIONS — chatbot session logs
-- =========================
create table conversations (
  id uuid primary key default uuid_generate_v4(),
  session_id text not null,
  event_id uuid references events(id),
  messages jsonb not null default '[]',          -- [{role, content, tool_calls?, tool_result?}]
  started_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now()
);
create index idx_conversations_session on conversations(session_id);

-- =========================
-- AUDIT_LOG — complete record of decisions/changes/approvals
-- =========================
create table audit_log (
  id uuid primary key default uuid_generate_v4(),
  entity_type text not null,                     -- 'event','space','asset','quote','task'
  entity_id uuid not null,
  action text not null,                          -- 'created','updated','deleted','status_changed'
  actor text not null,
  actor_type actor_type not null,
  changes jsonb,
  created_at timestamptz not null default now()
);
create index idx_audit_entity on audit_log(entity_type, entity_id);
create index idx_audit_created on audit_log(created_at desc);

-- =========================
-- HELPER VIEW — current space availability
-- =========================
create view space_availability as
select
  s.id as space_id,
  s.code,
  s.name,
  s.floor,
  e.id as event_id,
  e.reference_code,
  e.start_at,
  e.end_at,
  e.status as event_status
from spaces s
left join event_spaces es on es.space_id = s.id
left join events e on e.id = es.event_id and e.status in ('confirmed','in_progress')
where s.is_active = true;
```

### Seed data (`/supabase/migrations/0002_seed.sql`)

Seed must include:

- **4 hero spaces** with the brief's colors: Blue (L 0, 240 m², 300 pax), Orange (L 0, 180 m², 220 pax), Green (L-1, 150 m², 160 pax), Yellow (L-1, 120 m², 140 pax)
- **~15 ground-floor extension spaces** (A1–A19 from current site reference)
- **16 exterior boxes** (BE1–BE16) with sizes from `current-site-plan-exterior.png` (range 86–192 m²) and categories: technology, food and beverage, services, retail
- **~6 third-floor boxes** in MVRDV jewel colors (yellow-green, red, purple, blue, orange — visible in `interior-atrium.jpg`)
- **~4 rooftop boxes** (visible in `aerial-top-down.jpg`: purple, blue, red, orange)
- **~8 basement spaces** on L-1
- **Assets:** 600 chairs, 80 round tables, 60 rectangular tables, 30 microphones, 12 projectors, 18 screens, 24 speakers, 6 stages, 200m cable, 40 barriers, 12 lighting rigs

Total: ~50 spaces, ~12 asset types with quantities.

---

## 7. API contract (TypeScript types)

`/types/api.ts` — **the boundary between backend and frontend**. You define, friend consumes. Never returns untyped JSON.

```ts
// =========================
// Domain types (mirrors DB)
// =========================
export type SpaceFloor = 'roof' | 'l3' | 'l0' | 'l_minus_1' | 'exterior'
export type SpaceCategory = 'hero' | 'extension' | 'exterior_box' | 'public_area'
export type SpaceColor = 'blue' | 'orange' | 'green' | 'yellow' | 'red' | 'pink' | 'purple' | 'teal' | 'coral'
export type EventStatus = 'requested' | 'quoted' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
export type AssetType = 'chair' | 'table_round' | 'table_rect' | 'microphone' | 'projector' | 'screen' | 'speaker' | 'lighting' | 'stage' | 'barrier' | 'cable' | 'other'
export type AvailabilityState = 'available' | 'reserved' | 'blocked' | 'pending'

export interface Space {
  id: string
  code: string
  name: string
  name_sq?: string
  floor: SpaceFloor
  category: SpaceCategory
  color?: SpaceColor
  area_sqm: number
  capacity_pax: number
  ceiling_m?: number
  hourly_rate_eur: number
  setup_types: string[]
  features: string[]
  plan_x?: number
  plan_y?: number
  description?: string
  photo_urls: string[]
}

export interface SpaceWithAvailability extends Space {
  availability: AvailabilityState
  next_available_at?: string  // ISO
}

export interface Asset {
  id: string
  type: AssetType
  name: string
  total_qty: number
  available_qty: number
  storage_location: string
  unit_rate_eur: number
}

export interface Event {
  id: string
  reference_code: string
  title: string
  description?: string
  event_type?: string
  organizer_name: string
  organizer_email: string
  organizer_phone?: string
  organizer_org?: string
  attendees_count: number
  status: EventStatus
  start_at: string  // ISO
  end_at: string
  setup_start_at?: string
  teardown_end_at?: string
  spaces: Space[]
  assets: Array<{ asset: Asset; quantity: number }>
  notes?: string
  created_at: string
  updated_at: string
}

export interface QuoteLineItem {
  description: string
  quantity: number
  unit_price: number
  total: number
}

export interface Quote {
  id: string
  event_id: string
  line_items: QuoteLineItem[]
  subtotal: number
  tax: number
  total: number
  currency: string
  generated_at: string
  valid_until?: string
  accepted_at?: string
}

export interface Task {
  id: string
  event_id: string
  title: string
  description?: string
  team: 'logistics' | 'av' | 'cleaning' | 'security' | 'catering' | 'reception'
  due_at: string
  status: 'pending' | 'in_progress' | 'done' | 'blocked'
  assigned_to?: string
  depends_on_task_id?: string
}

export interface Conflict {
  id: string
  type: 'space_double_booked' | 'asset_oversold' | 'setup_overlap' | 'capacity_exceeded'
  severity: 'low' | 'medium' | 'high'
  description: string
  related_event_ids: string[]
  related_space_ids?: string[]
  related_asset_ids?: string[]
}

// =========================
// Endpoint contracts
// =========================

// GET /api/spaces?floor=...&available_from=...&available_to=...&min_capacity=...
export interface ListSpacesQuery {
  floor?: SpaceFloor
  available_from?: string
  available_to?: string
  min_capacity?: number
  features?: string[]
}
export interface ListSpacesResponse {
  spaces: SpaceWithAvailability[]
}

// GET /api/spaces/[code]
export interface GetSpaceResponse {
  space: SpaceWithAvailability
  upcoming_bookings: Array<{ start_at: string; end_at: string; status: EventStatus }>
}

// GET /api/spaces/availability?from=...&to=...&capacity=...
export interface AvailabilityQuery {
  from: string
  to: string
  capacity?: number
  features?: string[]
}
export interface AvailabilityResponse {
  matches: Array<{ space: Space; availability: AvailabilityState }>
  suggested: Space[]  // top 3 matches
}

// POST /api/events
export interface CreateEventRequest {
  title: string
  description?: string
  event_type?: string
  organizer_name: string
  organizer_email: string
  organizer_phone?: string
  organizer_org?: string
  attendees_count: number
  start_at: string
  end_at: string
  preferred_space_codes?: string[]
  setup_type?: string
  features_required?: string[]
}
export interface CreateEventResponse {
  event: Event
  matched_space?: Space          // null if no match
  alternatives?: Space[]
}

// GET /api/events
export interface ListEventsResponse {
  events: Event[]
}

// GET /api/events/[id]
export interface GetEventResponse {
  event: Event
  quote?: Quote
  tasks: Task[]
  conflicts: Conflict[]
}

// PATCH /api/events/[id]
export interface UpdateEventRequest {
  status?: EventStatus
  notes?: string
  spaces?: string[]  // space codes
}

// POST /api/quotes
export interface GenerateQuoteRequest {
  event_id: string
}
export interface GenerateQuoteResponse {
  quote: Quote
}

// POST /api/quotes/[id]/accept
export interface AcceptQuoteResponse {
  event: Event  // now confirmed
  tasks_generated: Task[]
}

// GET /api/conflicts?from=...&to=...
export interface ListConflictsResponse {
  conflicts: Conflict[]
}

// GET /api/tasks?event_id=...
export interface ListTasksResponse {
  tasks: Task[]
}

// PATCH /api/tasks/[id]
export interface UpdateTaskRequest {
  status?: Task['status']
  assigned_to?: string
}

// POST /api/chatbot
export interface ChatRequest {
  session_id: string
  message: string
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
}
export interface ChatResponse {
  reply: string
  tool_calls?: Array<{ name: string; args: any; result?: any }>
  proposed_action?: {
    type: 'create_event' | 'reserve_space' | 'generate_quote' | 'cancel_event'
    payload: any
    requires_confirmation: boolean
  }
}

// GET /api/dashboard/overview
export interface DashboardOverviewResponse {
  events_today: Event[]
  events_this_week: number
  events_this_month: number
  active_conflicts: Conflict[]
  inventory_low: Array<{ asset: Asset; pct_remaining: number }>
  occupancy_by_floor: Array<{ floor: SpaceFloor; pct: number }>
}
```

---

## 8. Chatbot tool definitions

The Gemini chatbot has these function tools available. Defined in `/lib/ai/tools.ts`.

```ts
export const chatbotTools = [
  {
    name: 'search_spaces',
    description: 'Search for available spaces matching capacity, date/time, and features.',
    parameters: {
      from: 'string (ISO datetime)',
      to: 'string (ISO datetime)',
      capacity: 'number',
      features: 'string[] (optional)',
    },
  },
  {
    name: 'check_space_availability',
    description: 'Check whether a specific space is available in a date range.',
    parameters: { space_code: 'string', from: 'string', to: 'string' },
  },
  {
    name: 'create_event_request',
    description: 'Create an event request. Use only after confirming details with user.',
    parameters: { /* matches CreateEventRequest */ },
  },
  {
    name: 'generate_quote',
    description: 'Generate a quote for an existing event.',
    parameters: { event_id: 'string' },
  },
  {
    name: 'list_assets_needed',
    description: 'Recommend assets (chairs/tables/AV) for an event of given size and setup type.',
    parameters: { attendees: 'number', setup_type: 'string' },
  },
]
```

**System prompt for the bot:** lives in `/lib/ai/system-prompt.ts`. Must include:
- Identity: "I'm the Piramida Backstage assistant. I help organizers reserve spaces, generate quotes, and plan events at the Pyramid of Tirana."
- Bilingual: respond in the user's language (Albanian or English), prefer Albanian if input is Albanian.
- Always confirm destructive actions (creating events, accepting quotes) before calling the tool.
- Tone: warm, brief, professional. Speak like a knowledgeable front-of-house at a cultural venue, not like a chatbot.
- When proposing an action, present it as an "architectural change order": `PROPOSED: Reserve Blue Space, 12 Oct 14:00–18:00, 180 guests. Confirm?`

---

## 9. 48-hour timeline (dual-tracked)

> Already started. Assumes you and friend are working in parallel and check in every ~4 hours. Block any task that depends on the other's completion.

### Hours 0–4 — Foundation
**You:** create Supabase project, run migrations, write seed data with real Pyramid spaces, set up Next.js project with TypeScript and env vars, expose `/types/` from day one.
**Friend:** initialize Next.js with Tailwind + fonts, create design tokens file, build component primitives (Cube, Pill, Callout, MonoTable, StatusDot, BrandStrip), set up base layout, install GSAP and Framer Motion.

**Sync at H4:** types are exported, friend can `import { Space, Event } from '@/types/api'`.

### Hours 4–10 — Vertical slice 1: viewing spaces
**You:** implement `GET /api/spaces`, `GET /api/spaces/[code]`, `GET /api/spaces/availability`. Returns from real Supabase data.
**Friend:** build landing page with scroll-scrubbed video (extract 60–80 frames from `aerial-top-down.jpg` + `aerial-three-quarter-*.jpg` sequence, or one of the photos animated), build floor selector elevation overlay using `front-elevation.jpg` as background.

**Sync at H10:** floor selector clickable, switches to a floor (even if floor plan SVGs aren't ready yet).

### Hours 10–18 — Vertical slice 2: floor plans + detail
**You:** implement `POST /api/events`, `GET /api/events`, `GET /api/events/[id]`. Quote generation logic in `/lib/pricing/quote.ts`.
**Friend:** build the 5 floor plan SVGs (the big one). Use `current-site-plan-ground.png` and `current-site-plan-exterior.png` as exact references for those two floors; design Roof / L+3 / L-1 from the radial geometry + interior photos. Each box is a clickable `<polygon>` or `<rect>` with proper status colors. Build space detail page with video background.

**Sync at H18:** clicking a box on a floor plan navigates to detail page, which shows real space data.

### Hours 18–26 — The magic: booking + chatbot
**You:** implement `POST /api/quotes` and `POST /api/quotes/[id]/accept` (also auto-generates tasks). Implement `/api/chatbot` with Gemini and all the function tools. Implement `/api/dashboard/overview`.
**Friend:** build inline booking panel on detail page (date/time/attendees pickers + live quote calculation), confirmation page, chatbot cube + panel UI.

**Sync at H26:** full end-to-end booking works via UI. Chatbot exchanges messages.

### Hours 26–34 — Dashboard + integration
**You:** implement `/api/conflicts`, `/api/tasks`. Polish task generation (timing, dependencies). Wire chatbot's `create_event_request` tool to actually create events.
**Friend:** build organizer dashboard (events list, conflicts panel, inventory bars), build persistent mini-pyramid floor selector, wire chatbot to backend.

**Sync at H34:** dashboard is live, chatbot can book a real event.

### Hours 34–40 — Polish
**Both:** end-to-end testing, fix bugs, add transitions (Framer Motion between floors, between detail/list), add micro-animations to the lime green elements, empty states, error states, loading states, bilingual labels.

### Hours 40–46 — Demo prep
**Both:** seed beautiful realistic demo data (3 confirmed events for tomorrow, 2 conflicts to demonstrate detection, low inventory on chairs), write demo script (see §10), record backup video, deploy to Vercel, test on multiple devices and browsers.

### Hours 46–48 — Buffer + rehearsal
Rehearse the demo at least 3 times. Have a fallback recorded video in case live demo fails.

---

## 10. Demo script (the 90-second story)

The judge sees this in order. Practice until you can do it without notes.

1. **(0:00) Landing.** "This is the Pyramid of Tirana, Albania's most iconic public venue. Behind every event here is hours of fragmented coordination — emails, spreadsheets, phone calls. We replaced all of it." → scroll the landing flythrough.
2. **(0:15) Floor selector.** "An organizer comes in needing a conference space for 180 people next Wednesday." → click Ground Floor pill → radial plan appears.
3. **(0:25) Available spaces highlight live.** Type in the filter: "180 people, Oct 21, 14:00–18:00" → Blue Space + 2 alternatives glow lime across floors.
4. **(0:35) Click Blue.** Detail page loads with the video background scrubbing as you scroll. Show the specs.
5. **(0:45) Inline booking.** Pick date/time/attendees → quote assembles itself line by line on the right → click RESERVE NOW.
6. **(0:55) Confirmation.** Show the confirmation: event reserved, tasks auto-generated (setup at 12:00, AV check at 13:30, teardown by 19:30), assets locked (chairs, mics, projector reserved).
7. **(1:05) Switch to organizer dashboard.** Show the event appearing instantly. Show a pre-seeded conflict between two events on Saturday — the two related boxes pulse red on the mini-pyramid.
8. **(1:20) Now the chatbot.** Open the chatbot cube. Type: "Book Yellow on the roof for a 50-person reception on Friday night, 8 to 11pm." Bot proposes the booking. Confirm. Show the dashboard update in real-time.
9. **(1:35) Closing line.** "We replaced 30 emails with one sentence. That's Piramida Backstage."

---

## 11. The Gemini prompt-recipe template

Use this format every time you ask Gemini to generate a Claude Code prompt. Gemini fills in the bracketed sections from the master plan.

```
=========================================
# CLAUDE CODE TASK · [TASK NAME]
=========================================

ROLE: [backend | frontend]
OWNS: [exact folder paths this prompt is allowed to write or edit]
READ-ONLY: [folder paths it may reference but not modify]

ATTACH WITH THIS PROMPT:
- /docs/master-plan.md (always)
- /docs/challenge-brief.md (always)
- [list any reference images per §0]
- [any existing files that should be preserved/extended]

GOAL: [one sentence — the specific deliverable]

CONTEXT (extracted from master plan):
- Design system: §4 (cubes, no rounded, lime only for activation)
- Data shape: [paste relevant types from §7]
- API endpoints touched: [list]
- Components touched: [list]

CONSTRAINTS:
- Do NOT touch files outside OWNS.
- Do NOT introduce libraries beyond the locked stack (§3).
- Do NOT use rounded corners, gradients, shadows, glass, or Lucide icons (§4).
- Numbers must be in JetBrains Mono.
- All text supports `en` and `sq` (Albanian) — use the language toggle pattern.
- Validate inputs server-side; never trust client.
- Follow existing patterns from sibling files in OWNS.

ACCEPTANCE CRITERIA:
- [ ] [specific criterion 1, e.g. "Clicking a box on Ground Floor SVG navigates to /spaces/[code]"]
- [ ] [criterion 2]
- [ ] [criterion 3]
- [ ] No TypeScript errors (`pnpm tsc --noEmit` passes)
- [ ] No new dependencies added without explicit mention here

OUTPUT:
- File(s) to create: [list]
- File(s) to edit: [list]
- After completion, run: [test command if any]
```

### Example filled-in prompt

```
=========================================
# CLAUDE CODE TASK · Ground Floor SVG floor plan
=========================================

ROLE: frontend
OWNS: components/pyramid/floor-plans/l0.svg, components/pyramid/floor-plans/l0.tsx
READ-ONLY: types/api.ts, docs/references/*

ATTACH WITH THIS PROMPT:
- /docs/master-plan.md
- /docs/challenge-brief.md
- /docs/references/current-site-plan-ground.png
- /docs/references/aerial-top-down.jpg
- /docs/references/interior-atrium.jpg

GOAL: Recreate the Ground Floor radial architectural plan as a clickable SVG, with each space rendered as a colored box that reports its status (available/reserved/blocked).

CONTEXT:
- Design system: §4. Cubes only, hard 2px black borders, lime for status=available.
- The existing piramida.edu.al has the EXACT layout in current-site-plan-ground.png. Faithfully reproduce the radial geometry (16 segments converging to a central oculus) and the box positions A1–A19. Keep dimensions visible as mono labels.
- Data: each box receives `space: SpaceWithAvailability` as a prop. Box fill = color from the MVRDV palette via `space.color`. Outline = 3px lime if `availability === 'available'`, 1.5px red if 'reserved', etc.

CONSTRAINTS:
- SVG must be responsive (viewBox, no fixed pixel sizes outside).
- Each box is a <g> with onClick → navigate to /spaces/[code].
- On hover, render a <Callout> showing capacity, area, hourly rate.
- All numbers in JetBrains Mono.
- No rounded corners. No drop shadows.

ACCEPTANCE CRITERIA:
- [ ] All 19 ground-floor spaces present and clickable
- [ ] Boxes fill with their MVRDV color from space.color
- [ ] Selected state shows 3px lime outline matching the master-plan spec
- [ ] Hover shows callout with capacity + area
- [ ] Component accepts an array of spaces and renders state for each
- [ ] No TypeScript errors

OUTPUT:
- Create: components/pyramid/floor-plans/l0.tsx (React wrapper)
- Create: components/pyramid/floor-plans/l0.svg.tsx (inline SVG as React)
```

---

## 12. Final acceptance — what we ship

Before declaring done at H46, verify:

- [ ] Landing page with scroll flythrough deployed
- [ ] Floor selector elevation with 5 clickable pills
- [ ] All 5 floor plans rendered as interactive SVGs
- [ ] Real-time availability colors on every box
- [ ] Cross-floor search filter (capacity + date) highlights matches
- [ ] Space detail page with video background
- [ ] Inline booking with live quote calculation
- [ ] Booking confirmation auto-generates task list
- [ ] Organizer dashboard shows events, conflicts, inventory
- [ ] Persistent mini-pyramid floor selector in nav
- [ ] Chatbot can book a complete event from one sentence
- [ ] Bilingual: Albanian default, English toggle works
- [ ] Deployed live on Vercel
- [ ] Demo data seeded (3 events, 2 conflicts, low inventory)
- [ ] Backup recording exists

---

## 13. Risk register (the things that might bite us)

| Risk | Mitigation |
|---|---|
| Scroll-scrubbed video frame extraction takes too long | Fallback: use 3–4 still photos that fade between each other on scroll |
| Floor plan SVG recreation is a big visual lift | Reuse the existing piramida.edu.al PNGs as background and overlay clickable hot zones (Path B from the design discussion) |
| Gemini free tier rate limit hit during demo | Cache common chatbot responses; have a fallback "the assistant is offline, use the form" message ready |
| Supabase free tier query limit | Use service role key server-side; minimize round-trips with joins |
| Vercel build time | Keep dependencies minimal; pre-compute floor plan SVGs as static assets |
| Conflict detection edge cases | Keep it simple: same space + overlapping times = conflict. Don't try to be too clever. |
| Bilingual content for everything | Only translate user-facing labels and CTAs. Spec data (m², pax, EUR) needs no translation. Keep a single `dict.ts` with `{en, sq}`. |

---

## 14. Quick links (for Gemini context)

- Brief: `/docs/challenge-brief.md`
- Master plan: this file (`/docs/master-plan.md`)
- All references: `/docs/references/`
- Real Pyramid site: https://piramida.edu.al
- MVRDV project page: https://www.mvrdv.com/projects/312/the-pyramid-of-tirana
- AADF (sponsor): https://www.aadf.org

---

**End of master plan. Now build.**

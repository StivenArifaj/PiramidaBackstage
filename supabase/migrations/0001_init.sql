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

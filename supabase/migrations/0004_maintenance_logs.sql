-- Maintenance status enum
create type maintenance_status as enum ('clean', 'needs_cleaning', 'maintenance');

-- Facility health & maintenance log
create table maintenance_logs (
  id uuid primary key default uuid_generate_v4(),
  space_code text not null,
  space_name text not null,
  floor text not null,
  status maintenance_status not null default 'clean',
  assigned_worker text,
  next_action_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_maintenance_logs_floor on maintenance_logs(floor);
create index idx_maintenance_logs_status on maintenance_logs(status);

-- Seed with sample facility health data
insert into maintenance_logs (space_code, space_name, floor, status, assigned_worker, next_action_at, notes) values
  ('BLUE',   'Blue Space',          'l0',        'clean',          'Arben Hoxha',  now() + interval '7 days',  null),
  ('ORANGE', 'Orange Space',        'l0',        'needs_cleaning', 'Elsa Koci',    now() + interval '1 day',   'Post-event deep clean required'),
  ('A1',     'Ground Ring A1',      'l0',        'clean',          null,           now() + interval '14 days', null),
  ('B1',     'Basement Studio B1',  'l_minus_1', 'maintenance',    'Drita Leka',   now() + interval '2 days',  'HVAC filter replacement scheduled'),
  ('BE1',    'Basement Box BE1',    'l_minus_1', 'clean',          null,           now() + interval '14 days', null),
  ('GREEN',  'Green Box',           'exterior',  'needs_cleaning', 'Arben Hoxha',  now() + interval '1 day',   'Weather exposure — exterior scrub'),
  ('YELLOW', 'Yellow Roof Box',     'roof',      'clean',          null,           now() + interval '7 days',  null),
  ('L3-A',   'Level 3 Suite A',     'l3',        'clean',          'Elsa Koci',    now() + interval '7 days',  null),
  ('L3-B',   'Level 3 Suite B',     'l3',        'needs_cleaning', null,           now() + interval '3 days',  'Carpet stain — specialist required');

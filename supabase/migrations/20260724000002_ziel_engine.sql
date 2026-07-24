-- Ziel-Engine: Ziele (goals) mit Aufgaben-Backlog (tasks) + interne Einstellungen (settings)

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'aktiv' check (status in ('aktiv', 'pausiert', 'erreicht', 'verworfen')),
  priority integer not null default 3 check (priority between 1 and 5),
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table goals is 'Ziele der Agentur (vom Nutzer vorgegeben); der taegliche Arbeits-Takt arbeitet nur an Zielen mit status=aktiv, priority 1 = hoechste';

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references goals(id) on delete cascade,
  agent text not null,
  title text not null,
  details text,
  status text not null default 'offen' check (status in ('offen', 'in_arbeit', 'erledigt', 'blockiert')),
  result_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table tasks is 'Aufgaben-Backlog pro Ziel; der Manager plant Aufgaben und delegiert offene an den zustaendigen Agent';

create index if not exists tasks_goal_idx on tasks (goal_id);
create index if not exists tasks_offen_idx on tasks (status) where status in ('offen', 'in_arbeit');

create table if not exists settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

comment on table settings is 'Interne Einstellungen der Agentur (z. B. Dashboard-Zugangsschluessel) — nicht ins Git-Repo';

alter table goals enable row level security;
alter table tasks enable row level security;
alter table settings enable row level security;

-- KI-Agenten-Agentur swissROI — Basis-Schema
-- Zugriff ausschliesslich über MCP (Service-Role); RLS aktiv ohne offene Policies,
-- damit anon/authenticated keinen Zugriff haben.

create table if not exists agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent text not null,
  task text not null,
  status text not null default 'running' check (status in ('running', 'done', 'failed')),
  result_summary text,
  input_tokens_est integer,
  output_tokens_est integer,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

comment on table agent_runs is 'Protokoll aller delegierten Agent-Läufe inkl. Token-Schätzungen (vom Manager-Agent gepflegt)';

create index if not exists agent_runs_started_at_idx on agent_runs (started_at desc);
create index if not exists agent_runs_status_idx on agent_runs (status) where status = 'running';

create table if not exists decisions (
  id uuid primary key default gen_random_uuid(),
  agent text not null,
  topic text not null,
  description text not null,
  options text,
  status text not null default 'offen' check (status in ('offen', 'entschieden', 'verworfen')),
  decision text,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

comment on table decisions is 'Eskalierte Entscheidungen: offen = wartet auf Nutzer, entschieden/verworfen = erledigt';

create table if not exists heartbeat_reports (
  id uuid primary key default gen_random_uuid(),
  report_date date not null unique,
  content text not null,
  runs_total integer not null default 0,
  runs_failed integer not null default 0,
  input_tokens_est integer not null default 0,
  output_tokens_est integer not null default 0,
  created_at timestamptz not null default now()
);

comment on table heartbeat_reports is 'Ein Heartbeat-Report pro Tag (Token-Verbrauch und Status); manueller Lauf aktualisiert per Upsert';

create table if not exists content_items (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('blog', 'social', 'landingpage', 'email', 'sonstiges')),
  title text not null,
  body text,
  channel text,
  status text not null default 'entwurf' check (status in ('entwurf', 'review', 'freigegeben', 'publiziert')),
  created_by text not null default 'content-agent',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table content_items is 'Content-Pipeline: entwurf -> review -> freigegeben -> publiziert (publiziert nur nach Nutzer-Freigabe)';

create table if not exists seo_keywords (
  id uuid primary key default gen_random_uuid(),
  keyword text not null,
  database text not null default 'ch',
  volume integer,
  difficulty numeric,
  cpc numeric,
  intent text,
  source text not null default 'semrush',
  collected_at timestamptz not null default now(),
  unique (keyword, database)
);

comment on table seo_keywords is 'Keyword-Daten aus Semrush (vom SEO-Agent gepflegt)';

alter table agent_runs enable row level security;
alter table decisions enable row level security;
alter table heartbeat_reports enable row level security;
alter table content_items enable row level security;
alter table seo_keywords enable row level security;

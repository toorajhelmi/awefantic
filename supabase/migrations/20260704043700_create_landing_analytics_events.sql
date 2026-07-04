create table if not exists public.landing_analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null check (
    event_name in ('page_view', 'waitlist_submission_success')
  ),
  source_path text not null default '/',
  user_agent_hash text,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index if not exists landing_analytics_events_name_created_at_idx
  on public.landing_analytics_events (event_name, created_at desc);

create index if not exists landing_analytics_events_created_at_idx
  on public.landing_analytics_events (created_at desc);

alter table public.landing_analytics_events enable row level security;

comment on table public.landing_analytics_events is
  'Server-recorded Awfantic landing page analytics events for page-view vs waitlist-submission signal.';

comment on column public.landing_analytics_events.event_name is
  'Allowed values: page_view, waitlist_submission_success.';

comment on column public.landing_analytics_events.user_agent_hash is
  'SHA-256 hash captured server-side for coarse analytics and anti-spam review without storing raw user-agent.';

comment on column public.landing_analytics_events.ip_hash is
  'SHA-256 hash captured server-side for coarse analytics and anti-spam review without storing raw IP.';

create extension if not exists pgcrypto;

create table if not exists public.waitlist_submissions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  qualifying_answer text not null,
  source_path text not null default '/',
  user_agent_hash text,
  ip_hash text,
  status text not null default 'active' check (status in ('active')),
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_submissions_active_email_unique
  on public.waitlist_submissions (lower(email))
  where status = 'active';

create index if not exists waitlist_submissions_created_at_idx
  on public.waitlist_submissions (created_at desc);

alter table public.waitlist_submissions enable row level security;

comment on table public.waitlist_submissions is
  'Awfantic landing page waitlist leads captured by the server-side Vercel API route.';

comment on column public.waitlist_submissions.user_agent_hash is
  'SHA-256 hash captured server-side for coarse anti-spam review without storing raw user-agent.';

comment on column public.waitlist_submissions.ip_hash is
  'SHA-256 hash captured server-side for coarse anti-spam review without storing raw IP.';

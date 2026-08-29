-- =========================================================================
-- DevFolio — Supabase schema
-- Run this ONCE in the Supabase SQL Editor (Dashboard > SQL Editor > New query).
-- Paste, then press "Run".
-- =========================================================================

-- extensions
create extension if not exists "pgcrypto";

-- -------------------------------------------------------------------------
-- portfolios
-- -------------------------------------------------------------------------
create table if not exists public.portfolios (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name            text not null,
  title           text,
  username        text,
  avatar_url      text,
  portfolio_url   text not null,
  github_url      text,
  description     text,
  location        text,
  experience_level text not null default 'mid',
  status          text not null default 'pending',
  health          text not null default 'unknown',
  framework       text,
  language        text,
  hosting_provider text,
  screenshot_url  text,
  technologies    text[] not null default '{}',
  categories      text[] not null default '{}',
  tags            text[] not null default '{}',
  featured        boolean not null default false,
  verified        boolean not null default false,
  submitted_at    timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists portfolios_status_idx    on public.portfolios (status);
create index if not exists portfolios_slug_idx      on public.portfolios (slug);
create index if not exists portfolios_featured_idx  on public.portfolios (featured);
create index if not exists portfolios_tech_idx      on public.portfolios using gin (technologies);
create index if not exists portfolios_cat_idx       on public.portfolios using gin (categories);

-- -------------------------------------------------------------------------
-- scores (1:1 with portfolio)
-- -------------------------------------------------------------------------
create table if not exists public.scores (
  id                   uuid primary key default gen_random_uuid(),
  portfolio_id         uuid not null unique references public.portfolios (id) on delete cascade,
  version              text not null default '1.0',
  performance_score    numeric not null default 0,
  accessibility_score  numeric not null default 0,
  seo_score            numeric not null default 0,
  best_practices_score numeric not null default 0,
  design_score         numeric not null default 0,
  content_score        numeric not null default 0,
  overall_score        numeric not null default 0,
  calculated_at        timestamptz not null default now()
);
create index if not exists scores_overall_idx on public.scores (overall_score desc);

-- -------------------------------------------------------------------------
-- health_checks
-- -------------------------------------------------------------------------
create table if not exists public.health_checks (
  id            uuid primary key default gen_random_uuid(),
  portfolio_id  uuid not null references public.portfolios (id) on delete cascade,
  checked_at    timestamptz not null default now(),
  status_code   integer,
  response_time integer,
  ssl_valid     boolean not null default true,
  accessible    boolean not null default true,
  details       text
);
create index if not exists health_checks_pt_idx on public.health_checks (portfolio_id, checked_at desc);

-- -------------------------------------------------------------------------
-- votes
-- -------------------------------------------------------------------------
create table if not exists public.votes (
  id            uuid primary key default gen_random_uuid(),
  portfolio_id  uuid not null references public.portfolios (id) on delete cascade,
  user_id       text not null default 'anonymous',
  value         integer not null default 1,
  created_at    timestamptz not null default now(),
  ip_hash       text
);
create index if not exists votes_pt_idx on public.votes (portfolio_id);

-- -------------------------------------------------------------------------
-- submissions (from the "Submit your portfolio" form)
-- -------------------------------------------------------------------------
create table if not exists public.submissions (
  id              uuid primary key default gen_random_uuid(),
  portfolio_url   text not null,
  submitter_name  text,
  submitter_email text,
  status          text not null default 'pending',
  result          jsonb,
  created_at      timestamptz not null default now(),
  processed_at    timestamptz
);
create index if not exists submissions_status_idx on public.submissions (status);
create index if not exists submissions_url_idx   on public.submissions (portfolio_url);

-- -------------------------------------------------------------------------
-- comparisons (shared compare links)
-- -------------------------------------------------------------------------
create table if not exists public.comparisons (
  id            uuid primary key default gen_random_uuid(),
  portfolio_ids text not null,
  created_at    timestamptz not null default now(),
  viewed_at     timestamptz
);

-- =========================================================================
-- Row Level Security
-- =========================================================================
alter table public.portfolios    enable row level security;
alter table public.scores        enable row level security;
alter table public.health_checks enable row level security;
alter table public.votes         enable row level security;
alter table public.submissions   enable row level security;
alter table public.comparisons   enable row level security;

-- ---- portfolios: public can READ approved; writes only via service_role -----
drop policy if exists "public read approved portfolios" on public.portfolios;
create policy "public read approved portfolios"
  on public.portfolios for select
  using (status = 'approved');

-- ---- scores: public read (joined with portfolios) --------------------------
drop policy if exists "public read scores" on public.scores;
create policy "public read scores"
  on public.scores for select using (true);

-- ---- health_checks: public read --------------------------------------------
drop policy if exists "public read health_checks" on public.health_checks;
create policy "public read health_checks"
  on public.health_checks for select using (true);

-- ---- votes: public can insert (app rate-limits); public read ---------------
drop policy if exists "public read votes" on public.votes;
create policy "public read votes" on public.votes for select using (true);
drop policy if exists "public insert votes" on public.votes;
create policy "public insert votes" on public.votes for insert
  with check (true);

-- ---- submissions: public can INSERT (rate-limited at app layer); -----------
--      read/update only via service_role (no anon select) -------------------
drop policy if exists "public insert submissions" on public.submissions;
create policy "public insert submissions" on public.submissions
  for insert with check (true);

-- ---- comparisons: public read + insert -------------------------------------
drop policy if exists "public read comparisons" on public.comparisons;
create policy "public read comparisons" on public.comparisons for select using (true);
drop policy if exists "public insert comparisons" on public.comparisons;
create policy "public insert comparisons" on public.comparisons for insert
  with check (true);

-- service_role bypasses RLS automatically (it is a superuser role).
-- Reads/writes on non-approved portfolios, submissions & admin ops go through
-- the service_role client in the Next.js server, which ignores RLS.

-- =========================================================================
-- helper: upsert a portfolio by slug
-- =========================================================================
create or replace function public.upsert_portfolio(p jsonb)
returns uuid language plpgsql security definer as $$
declare new_id uuid;
begin
  insert into public.portfolios (
    slug, name, title, username, avatar_url, portfolio_url, github_url,
    description, location, experience_level, status, health, framework,
    language, hosting_provider, screenshot_url, technologies, categories,
    tags, featured, verified, submitted_at, updated_at
  ) values (
    p->>'slug', p->>'name', p->>'title', p->>'username', p->>'avatarUrl',
    coalesce(p->>'portfolioUrl', p->>'url'), p->>'githubUrl', p->>'description',
    p->>'location', coalesce(p->>'experienceLevel','mid'), coalesce(p->>'status','approved'),
    coalesce(p->>'health','healthy'), p->>'framework', p->>'language',
    p->>'hostingProvider', p->>'screenshotUrl',
    coalesce(coalesce(p->'technologies', jsonb_build_array())::text::text[], '{}'),
    coalesce(coalesce(p->'categories', jsonb_build_array())::text::text[], '{}'),
    coalesce(coalesce(p->'tags', jsonb_build_array())::text::text[], '{}'),
    coalesce((p->>'featured')::boolean, false),
    coalesce((p->>'verified')::boolean, false),
    now(), now()
  )
  on conflict (slug) do update set
    name = excluded.name,
    portfolio_url = excluded.portfolio_url,
    description = coalesce(excluded.description, public.portfolios.description),
    updated_at = now()
  returning id into new_id;
  return new_id;
end $$;

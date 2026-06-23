-- ============================================================================
-- HEAPIFY GLOBAL COMMUNITY — SUPABASE SCHEMA
-- Run in order. Designed for Postgres + Supabase Auth + RLS.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- ROLES
-- ----------------------------------------------------------------------------
create type user_role as enum (
  'member',
  'mentor',
  'chapter_admin',
  'core_team',
  'super_admin'
);

-- ----------------------------------------------------------------------------
-- PROFILES (extends auth.users)
-- ----------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text,
  avatar_url text,
  bio text,
  role user_role not null default 'member',
  contribution_score int not null default 0,
  github_url text,
  linkedin_url text,
  twitter_url text,
  website_url text,
  chapter_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- CHAPTERS
-- ----------------------------------------------------------------------------
create table chapters (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null check (type in ('city', 'college', 'regional')),
  city text,
  country text,
  lead_id uuid references profiles(id),
  banner_url text,
  description text,
  member_count int not null default 0,
  status text not null default 'active' check (status in ('active', 'pending', 'inactive')),
  created_at timestamptz not null default now()
);

alter table profiles
  add constraint profiles_chapter_fk foreign key (chapter_id) references chapters(id);

-- ----------------------------------------------------------------------------
-- EVENTS
-- ----------------------------------------------------------------------------
create table events (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  description text,
  category text not null check (category in
    ('web3','blockchain','hackathon','open_source','workshop','internship_session')),
  status text not null default 'upcoming' check (status in ('upcoming','ongoing','completed','cancelled')),
  banner_url text,
  start_at timestamptz not null,
  end_at timestamptz,
  location text,
  is_virtual boolean not null default false,
  meeting_url text,
  agenda jsonb default '[]',
  speakers jsonb default '[]',
  capacity int,
  chapter_id uuid references chapters(id),
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table event_registrations (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'registered' check (status in ('registered','waitlisted','cancelled','attended')),
  registered_at timestamptz not null default now(),
  unique (event_id, user_id)
);

-- ----------------------------------------------------------------------------
-- OPEN SOURCE PROJECTS
-- ----------------------------------------------------------------------------
create table projects (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  difficulty text not null check (difficulty in ('beginner','intermediate','advanced')),
  tech_stack text[] default '{}',
  repo_url text,
  roadmap_url text,
  contribution_guidelines text,
  maintainer_ids uuid[] default '{}',
  contributor_count int not null default 0,
  status text not null default 'active' check (status in ('active','archived')),
  created_at timestamptz not null default now()
);

create table project_contributors (
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

-- ----------------------------------------------------------------------------
-- LEADERBOARD / ACHIEVEMENTS
-- ----------------------------------------------------------------------------
create table badges (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  icon_url text,
  description text
);

create table user_badges (
  user_id uuid not null references profiles(id) on delete cascade,
  badge_id uuid not null references badges(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create table leaderboard_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  category text not null check (category in ('contributors','event_participation','mentors','community_champions')),
  score int not null default 0,
  period text not null default 'all_time',
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- INTERNSHIPS
-- ----------------------------------------------------------------------------
create table internships (
  id uuid primary key default uuid_generate_v4(),
  company_name text not null,
  company_logo_url text,
  role_title text not null,
  location_type text not null check (location_type in ('remote','hybrid','onsite')),
  compensation_type text not null check (compensation_type in ('paid','unpaid')),
  description text,
  application_url text not null,
  posted_at timestamptz not null default now(),
  expires_at timestamptz
);

create table internship_bookmarks (
  internship_id uuid not null references internships(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  primary key (internship_id, user_id)
);

-- ----------------------------------------------------------------------------
-- RESOURCES
-- ----------------------------------------------------------------------------
create table resources (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  category text not null check (category in
    ('roadmaps','blogs','recordings','notes','open_source','blockchain','cybersecurity','ai')),
  url text not null,
  tags text[] default '{}',
  added_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table resource_bookmarks (
  resource_id uuid not null references resources(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  primary key (resource_id, user_id)
);

-- ----------------------------------------------------------------------------
-- CHALLENGES
-- ----------------------------------------------------------------------------
create table challenges (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  status text not null default 'active' check (status in ('active','past')),
  start_at timestamptz,
  end_at timestamptz,
  winner_id uuid references profiles(id)
);

create table challenge_submissions (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  submission_url text,
  submitted_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- TEAM
-- ----------------------------------------------------------------------------
create table team_members (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id),
  display_name text not null,
  title text not null check (title in
    ('founder','co_founder','core_team','junior_core','mentor','advisor')),
  photo_url text,
  bio text,
  sort_order int default 0
);

-- ----------------------------------------------------------------------------
-- SPONSORS & PARTNERS
-- ----------------------------------------------------------------------------
create table sponsors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  logo_url text,
  tier text check (tier in ('platinum','gold','silver','community')),
  website_url text,
  active boolean not null default true
);

-- ----------------------------------------------------------------------------
-- FORMS / APPLICATIONS (generic reusable form submissions)
-- ----------------------------------------------------------------------------
create table form_submissions (
  id uuid primary key default uuid_generate_v4(),
  form_type text not null check (form_type in
    ('volunteer','speaker','mentor','partnership','sponsor',
     'chapter_lead','ambassador','contact')),
  submitted_by uuid references profiles(id),
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending','reviewed','accepted','rejected')),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- SITE CONTENT (admin-editable stats, testimonials, announcements)
-- ----------------------------------------------------------------------------
create table site_stats (
  key text primary key,
  label text not null,
  value int not null default 0
);

create table testimonials (
  id uuid primary key default uuid_generate_v4(),
  author_name text not null,
  author_role text,
  avatar_url text,
  quote text not null,
  sort_order int default 0
);

create table announcements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  body text,
  audience text not null default 'all' check (audience in ('all','chapter','core_team')),
  chapter_id uuid references chapters(id),
  created_at timestamptz not null default now()
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table profiles enable row level security;
alter table events enable row level security;
alter table event_registrations enable row level security;
alter table projects enable row level security;
alter table project_contributors enable row level security;
alter table form_submissions enable row level security;
alter table internships enable row level security;
alter table internship_bookmarks enable row level security;
alter table resources enable row level security;
alter table resource_bookmarks enable row level security;

-- Public read on most content
create policy "public read profiles" on profiles for select using (true);
create policy "public read events" on events for select using (true);
create policy "public read projects" on projects for select using (true);
create policy "public read internships" on internships for select using (true);
create policy "public read resources" on resources for select using (true);

-- Users manage their own rows
create policy "users update own profile" on profiles for update using (auth.uid() = id);
create policy "users manage own registrations" on event_registrations
  for all using (auth.uid() = user_id);
create policy "users manage own bookmarks (internships)" on internship_bookmarks
  for all using (auth.uid() = user_id);
create policy "users manage own bookmarks (resources)" on resource_bookmarks
  for all using (auth.uid() = user_id);
create policy "users join projects" on project_contributors
  for all using (auth.uid() = user_id);
create policy "users submit forms" on form_submissions
  for insert with check (auth.uid() = submitted_by or submitted_by is null);
create policy "users read own form submissions" on form_submissions
  for select using (auth.uid() = submitted_by);

-- Core team / super admin elevated access is handled via a `has_role()`
-- helper function checked in policies on admin-only tables (sponsors,
-- team_members, announcements, site_stats) — add once auth roles are seeded:
--
-- create function has_role(min_role user_role) returns boolean as $$
--   select exists (
--     select 1 from profiles
--     where id = auth.uid()
--     and role >= min_role -- requires enum ordering or a rank table
--   );
-- $$ language sql security definer;

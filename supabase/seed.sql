-- ============================================================================
-- HEAPIFY GLOBAL COMMUNITY — STANDARDIZED SEED DATA (supabase/seed.sql)
-- One-command seed script for local developer onboarding & staging setups.
-- Run in Supabase SQL Editor or via `supabase db reset`.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SITE STATS
-- ----------------------------------------------------------------------------
INSERT INTO site_stats (key, label, value)
VALUES
  ('members_count', 'Community Members', 450),
  ('events_count', 'Events', 6)
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  value = EXCLUDED.value;

-- ----------------------------------------------------------------------------
-- 2. CHAPTERS
-- ----------------------------------------------------------------------------
INSERT INTO chapters (id, name, type, city, country, description, member_count, status)
VALUES
  (
    'c0000000-0000-0000-0000-000000000001',
    'Bengaluru',
    'college',
    'Bengaluru',
    'India',
    'Focusing on AI, Web3 infrastructure, and developer tooling.',
    124,
    'active'
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    'Nairobi',
    'city',
    'Nairobi',
    'Kenya',
    'Building open-source solutions for local businesses and developers.',
    88,
    'active'
  ),
  (
    'c0000000-0000-0000-0000-000000000003',
    'São Paulo',
    'regional',
    'São Paulo',
    'Brazil',
    'Hosting monthly hackathons and design sprints.',
    102,
    'active'
  ),
  (
    'c0000000-0000-0000-0000-000000000004',
    'London',
    'regional',
    'London',
    'United Kingdom',
    'Senior developer meetups and architectural discussions.',
    76,
    'active'
  ),
  (
    'c0000000-0000-0000-0000-000000000005',
    'San Francisco',
    'city',
    'San Francisco',
    'United States',
    'AI, agents, and frontier tech study groups.',
    210,
    'active'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  city = EXCLUDED.city,
  country = EXCLUDED.country,
  description = EXCLUDED.description,
  member_count = EXCLUDED.member_count,
  status = EXCLUDED.status;

-- ----------------------------------------------------------------------------
-- 3. BADGES CATALOG
-- ----------------------------------------------------------------------------
INSERT INTO badges (id, name, icon_url, description)
VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    'Flagship Hacker',
    '/badges/flagship.png',
    'Participated in a Heapify flagship AI sprint or hackathon.'
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'Open Source Contributor',
    '/badges/contributor.png',
    'Merged a pull request in a Heapify community project.'
  ),
  (
    'b0000000-0000-0000-0000-000000000003',
    'Community Champion',
    '/badges/champion.png',
    'Recognized for exceptional community assistance and leadership.'
  ),
  (
    'b0000000-0000-0000-0000-000000000004',
    'Speaker & Mentor',
    '/badges/mentor.png',
    'Hosted a technical session or workshop for Heapify.'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ----------------------------------------------------------------------------
-- 4. OPEN SOURCE PROJECTS
-- ----------------------------------------------------------------------------
INSERT INTO projects (id, slug, name, description, difficulty, tech_stack, repo_url, contributor_count, status)
VALUES
  (
    'p0000000-0000-0000-0000-000000000001',
    'heapify-platform',
    'Heapify Platform',
    'The core open-source web platform for Heapify Global Community built with Next.js 15, Supabase, and TailwindCSS.',
    'beginner',
    ARRAY['Next.js', 'TypeScript', 'Supabase', 'TailwindCSS'],
    'https://github.com/HeapifyGlobalCommunityy/Heapify-platform',
    18,
    'active'
  ),
  (
    'p0000000-0000-0000-0000-000000000002',
    'gemma-ai-toolkit',
    'Gemma AI Developer Toolkit',
    'Open-source starter templates, fine-tuning utilities, and agent workflows for Google Gemma models.',
    'intermediate',
    ARRAY['Python', 'PyTorch', 'Gemma', 'FastAPI'],
    'https://github.com/HeapifyGlobalCommunityy',
    12,
    'active'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  difficulty = EXCLUDED.difficulty,
  tech_stack = EXCLUDED.tech_stack,
  repo_url = EXCLUDED.repo_url,
  contributor_count = EXCLUDED.contributor_count;

-- ----------------------------------------------------------------------------
-- 5. EVENTS CATALOG
-- ----------------------------------------------------------------------------
INSERT INTO events (id, slug, title, category, status, start_at, end_at, is_virtual, location, description, capacity, chapter_id)
VALUES
  (
    '3a3b3c3d-0001-4000-8000-000000000001',
    'web3-gsoc27-session-1',
    'Web3 to GSoC''27 Initiative — Session 01',
    'open_source',
    'completed',
    '2026-06-07 14:00:00+05:30',
    '2026-06-07 15:30:00+05:30',
    true,
    'Google Meet',
    'Initiative session on open source contributions, GSoC preparation, and building a contributor profile. Speaker: Suryansh Maurya.',
    0,
    'c0000000-0000-0000-0000-000000000001'
  ),
  (
    '3a3b3c3d-0002-4000-8000-000000000002',
    'web3-gsoc27-session-2',
    'Web3 to GSoC''27 — Session 02: From First Issue to First Merge',
    'open_source',
    'completed',
    '2026-06-14 15:00:00+05:30',
    '2026-06-14 16:30:00+05:30',
    true,
    'Google Meet',
    'Understanding open-source workflows, navigating GitHub projects, and building a strong contributor profile. Speaker: Priyanshu Yadav.',
    0,
    'c0000000-0000-0000-0000-000000000001'
  ),
  (
    '3a3b3c3d-0003-4000-8000-000000000003',
    'mission-bah-2026',
    'Mission BAH''26: From Earth to Orbit',
    'hackathon',
    'completed',
    '2026-06-21 15:00:00+05:30',
    '2026-06-21 16:30:00+05:30',
    true,
    'Google Meet',
    'A complete roadmap to the Bhartiya Antariksh Hackathon 2026 with insights from national winners.',
    0,
    'c0000000-0000-0000-0000-000000000001'
  ),
  (
    '3a3b3c3d-0004-4000-8000-000000000004',
    'builder-talks-01',
    'Builder Talks #01 — Freelancing & Developer Career Building',
    'workshop',
    'completed',
    '2026-07-05 16:00:00+05:30',
    '2026-07-05 17:30:00+05:30',
    true,
    'Google Meet',
    'Collaborative session with Nexus Spring of Code (NSoC) focusing on freelancing and developer profile building.',
    0,
    'c0000000-0000-0000-0000-000000000001'
  ),
  (
    '3a3b3c3d-0005-4000-8000-000000000005',
    'build-with-gemma-briefing',
    'Build with Gemma: Official Briefing Session',
    'workshop',
    'completed',
    '2026-07-12 15:30:00+05:30',
    '2026-07-12 17:00:00+05:30',
    true,
    'Online',
    'Official briefing and orientation session for the Build with Gemma hackathon.',
    0,
    'c0000000-0000-0000-0000-000000000001'
  ),
  (
    '3a3b3c3d-0006-4000-8000-000000000006',
    'build-with-gemma',
    'Build with Gemma: Bengaluru AI Sprint',
    'hackathon',
    'completed',
    '2026-07-18 09:00:00+05:30',
    '2026-07-18 18:00:00+05:30',
    false,
    'MSRIT, Bengaluru',
    'Heapify flagship offline AI hackathon sprint at Ramaiah Institute of Technology where builders developed innovative solutions using Google Gemma.',
    250,
    'c0000000-0000-0000-0000-000000000001'
  )
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  status = EXCLUDED.status,
  start_at = EXCLUDED.start_at,
  end_at = EXCLUDED.end_at,
  is_virtual = EXCLUDED.is_virtual,
  location = EXCLUDED.location,
  description = EXCLUDED.description,
  capacity = EXCLUDED.capacity;

-- ----------------------------------------------------------------------------
-- 6. ANNOUNCEMENTS
-- ----------------------------------------------------------------------------
INSERT INTO announcements (id, title, body, audience)
VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'Build with Gemma Hackathon Concluded Successfully!',
    'Over 200+ builders joined us at MSRIT Bengaluru for our flagship Gemma AI Sprint. Check out the project highlights on our retrospective page.',
    'all'
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    'Web3 to GSoC''27 Mentorship Ring Open',
    'Weekly sessions on open-source contributions, pull request reviews, and GSoC preparation are now active across all city chapters.',
    'all'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  body = EXCLUDED.body;

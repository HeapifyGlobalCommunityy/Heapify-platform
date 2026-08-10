-- seed_events.sql
-- Run this SQL in your Supabase Dashboard SQL Editor to insert the 6 actual events into the database.

INSERT INTO events (id, slug, title, category, status, start_at, end_at, is_virtual, location, description, capacity)
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
    'Initiative session on open source contributions, GSoC preparation, and building a contributor profile. Speaker: Suryansh Maurya (GSoC Contributor). Host: Madhusudhan LS (NHCE).', 
    0
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
    'Understanding open-source workflows, navigating GitHub projects, and building a strong contributor profile. Speaker: Priyanshu Yadav (GSoC ''26 @ OSIPI, GSoC ''25 @ DBpedia). Host: Madhusudhan LS.', 
    0
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
    'A complete roadmap to the Bhartiya Antariksh Hackathon 2026 with insights from national winners and space tech researchers.', 
    0
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
    'Collaborative session with Nexus Spring of Code (NSoC) focusing on freelancing, developer profile building, and ecosystem growth. Speakers: Harsha Nandi & Aman Singh.', 
    0
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
    'Official briefing and orientation session for the Build with Gemma hackathon with speaker Atharva Patwardhan.', 
    0
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
    'Heapify''s flagship offline AI hackathon sprint at Ramaiah Institute of Technology where builders developed innovative solutions using Google''s Gemma ecosystem.', 
    250
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

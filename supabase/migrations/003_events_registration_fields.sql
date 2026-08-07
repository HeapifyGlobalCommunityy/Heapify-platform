-- ============================================================================
-- Migration: 003_events_registration_fields
-- Adds fields needed to drive the registration UI (team config, custom
-- questions, hackathon flag). Sourced from lib/registration-configs.ts
-- requirements in feature/events-phase-0.
-- ============================================================================

alter table events
  add column if not exists is_hackathon boolean not null default false,
  add column if not exists team_config jsonb,
  add column if not exists custom_questions jsonb not null default '[]'::jsonb;

comment on column events.team_config is
  'Shape: { solo_allowed: boolean, team_min: int, team_max: int }. Null when event is not team-based.';

comment on column events.custom_questions is
  'Array of { id: string, label: string, type: string, required: boolean, options?: string[] }';

-- registered_count is intentionally NOT a stored column.
-- Compute live: select count(*) from event_registrations
--   where event_id = $1 and status in ('registered','attended')
-- Avoids drift between a cached counter and the source of truth.

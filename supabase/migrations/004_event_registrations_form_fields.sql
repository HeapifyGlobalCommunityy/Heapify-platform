-- ============================================================================
-- Migration: 004_event_registrations_form_fields
-- Extends event_registrations to hold the actual data collected by
-- PersonalInfoSection, TeamSection, and CustomQuestionsSection.
-- ============================================================================

alter table event_registrations
  add column if not exists full_name text,
  add column if not exists email text,
  add column if not exists github_url text,
  add column if not exists linkedin_url text,
  add column if not exists team_name text,
  add column if not exists team_members jsonb not null default '[]'::jsonb,
  add column if not exists answers jsonb not null default '{}'::jsonb;

comment on column event_registrations.team_members is
  'Array of { full_name: string, email: string, github_url?: string }, one entry per teammate excluding the registrant.';

comment on column event_registrations.answers is
  'Map of custom_question.id -> answer value, keyed against events.custom_questions.';

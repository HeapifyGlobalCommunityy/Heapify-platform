-- ============================================================
-- MIGRATION 012 — Challenges & Leaderboard: RLS + privileges + submission RPC
-- Slice: CL-P1 (docs/challenges-leaderboard/EXECUTION_PLAN.md)
-- Project: hfdymlfamjyonzasxwvc
--
-- Scope of this file:
--   * Recreate has_role() on the hardened definer path (review F7 / 2nd-review defect 2)
--   * Preflight dedupe of (challenge_id, user_id) before the unique index (review F9)
--   * Extend challenge_submissions with the review lifecycle columns
--   * Fix challenges.winner_id FK delete behaviour (review F8)
--   * Unique indexes required by the RPC upserts
--   * Enable RLS + scoped SELECT policies on challenges / challenge_submissions /
--     leaderboard_entries, revoke ALL client-role DML (review F1/F5/F8)
--   * submit_challenge_entry()  — the ONLY member write path
--   * get_approved_submission_counts() — anon-safe aggregate (review F10)
--
-- The ledger table and the reviewer RPCs live in 013 (they depend on point_awards).
--
-- !! APPROVAL GATE !! The preflight DELETE below is destructive. The plan
-- (PROJECT_INSTRUCTIONS "Change rules") requires md's explicit approval before
-- destructive operations run against the live project. Review it, then run.
-- ============================================================

-- ---------------------------------------------------------------------------
-- 0. Hardened role helper
--    Originally created in 001 with `set search_path = public`. Every definer
--    function in this slice calls has_role(), so re-create it on the same
--    hardened path so privileged callers never invoke a weakly-pathed helper.
-- ---------------------------------------------------------------------------
create or replace function public.has_role(min_role public.user_role)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role >= min_role
  );
$$;

revoke all on function public.has_role(public.user_role) from public;
grant execute on function public.has_role(public.user_role) to authenticated;

-- ---------------------------------------------------------------------------
-- 1. Preflight — dedupe historical (challenge_id, user_id) duplicates
--    Keeps the most recent submission per pair. Idempotent: re-running deletes
--    nothing. MUST run before the unique index is created.
-- ---------------------------------------------------------------------------
delete from public.challenge_submissions cs
using (
  select id
  from (
    select
      id,
      row_number() over (
        partition by challenge_id, user_id
        order by submitted_at desc, id desc
      ) as rn
    from public.challenge_submissions
  ) ranked
  where rn > 1
) dup
where cs.id = dup.id;

-- ---------------------------------------------------------------------------
-- 2. Extend challenge_submissions with the review lifecycle
-- ---------------------------------------------------------------------------
alter table public.challenge_submissions
  add column if not exists status text not null default 'pending',
  add column if not exists reviewed_by uuid
    references public.profiles(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_note text;

alter table public.challenge_submissions
  drop constraint if exists challenge_submissions_status_check;

alter table public.challenge_submissions
  add constraint challenge_submissions_status_check
  check (status in ('pending', 'approved', 'rejected'));

-- ---------------------------------------------------------------------------
-- 3. FK delete-behaviour fixes (review F8)
--    queries.ts joins with the explicit hint `profiles!challenges_winner_id_fkey`,
--    so the constraint name MUST stay `challenges_winner_id_fkey`.
-- ---------------------------------------------------------------------------
alter table public.challenges
  drop constraint if exists challenges_winner_id_fkey;

alter table public.challenges
  add constraint challenges_winner_id_fkey
  foreign key (winner_id) references public.profiles(id) on delete set null;

-- ---------------------------------------------------------------------------
-- 4. Unique indexes backing the RPC upserts
-- ---------------------------------------------------------------------------
create unique index if not exists challenge_submissions_challenge_user_key
  on public.challenge_submissions (challenge_id, user_id);

create unique index if not exists leaderboard_entries_user_category_period_key
  on public.leaderboard_entries (user_id, category, period);

-- ---------------------------------------------------------------------------
-- 5. RLS enablement + scoped SELECT policies
-- ---------------------------------------------------------------------------
alter table public.challenges enable row level security;
alter table public.challenge_submissions enable row level security;
alter table public.leaderboard_entries enable row level security;

-- challenges: fully public read (core_team authoring is SQL/admin tooling only)
drop policy if exists "public read challenges" on public.challenges;
create policy "public read challenges"
on public.challenges for select
using (true);

-- challenge_submissions: owners read their own; reviewers read everything.
-- Proof URLs / review notes are never exposed to anyone else.
drop policy if exists "users read own challenge submissions" on public.challenge_submissions;
create policy "users read own challenge submissions"
on public.challenge_submissions for select to authenticated
using (user_id = auth.uid());

drop policy if exists "reviewers read all challenge submissions" on public.challenge_submissions;
create policy "reviewers read all challenge submissions"
on public.challenge_submissions for select to authenticated
using ((select public.has_role('core_team'::public.user_role)));

-- leaderboard_entries: fully public read
drop policy if exists "public read leaderboard entries" on public.leaderboard_entries;
create policy "public read leaderboard entries"
on public.leaderboard_entries for select
using (true);

-- ---------------------------------------------------------------------------
-- 6. Privilege revocation — no client role holds DML on any of these tables
--    (all writes flow through the RPCs). SELECT is scoped by RLS above.
-- ---------------------------------------------------------------------------
grant select on public.challenges to anon, authenticated;
grant select on public.leaderboard_entries to anon, authenticated;
grant select on public.challenge_submissions to authenticated;

revoke all on public.challenge_submissions from anon;

revoke insert, update, delete, truncate, references, trigger
  on public.challenges from anon, authenticated, service_role;
revoke insert, update, delete, truncate, references, trigger
  on public.challenge_submissions from anon, authenticated, service_role;
revoke insert, update, delete, truncate, references, trigger
  on public.leaderboard_entries from anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 7. submit_challenge_entry — the ONLY member write path (R1)
--    Identity is derived from auth.uid() inside Postgres. A single atomic
--    INSERT ... ON CONFLICT makes concurrent submits safe and keeps exactly
--    one row per (challenge_id, user_id).
-- ---------------------------------------------------------------------------
create or replace function public.submit_challenge_entry(
  p_challenge_id uuid,
  p_url text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_url text := btrim(p_url);
  v_end_at timestamptz;
  v_status text;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  if v_url is null or v_url = '' then
    raise exception 'Submission URL cannot be empty';
  end if;

  -- http(s) only — closes the javascript: / data: scheme vector (review F6)
  if v_url !~* '^https?://' then
    raise exception 'Submission URL must start with http:// or https://';
  end if;

  select end_at into v_end_at
  from public.challenges
  where id = p_challenge_id;

  if not found then
    raise exception 'Challenge not found';
  end if;

  if v_end_at is not null and v_end_at <= now() then
    raise exception 'Submissions are closed for this challenge';
  end if;

  insert into public.challenge_submissions
    (challenge_id, user_id, submission_url, status, submitted_at)
  values
    (p_challenge_id, v_uid, v_url, 'pending', now())
  on conflict (challenge_id, user_id) do update
    set submission_url = excluded.submission_url,
        submitted_at    = excluded.submitted_at,
        status          = 'pending',
        reviewed_by     = null,
        reviewed_at     = null,
        review_note     = null
    -- Approved rows are immutable; the conflict update is skipped for them.
    where challenge_submissions.status <> 'approved'
  returning status into v_status;

  if v_status is null then
    -- Row exists and is approved: structured no-op, never an exception.
    select status into v_status
    from public.challenge_submissions
    where challenge_id = p_challenge_id and user_id = v_uid;

    return jsonb_build_object('status', v_status, 'changed', false);
  end if;

  return jsonb_build_object('status', 'pending', 'changed', true);
end;
$$;

revoke all on function public.submit_challenge_entry(uuid, text) from public;
grant execute on function public.submit_challenge_entry(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 8. get_approved_submission_counts — anon-safe aggregate (R7 / review F10)
--    Returns counts only: no URLs, identities, or notes.
-- ---------------------------------------------------------------------------
create or replace function public.get_approved_submission_counts()
returns table (challenge_id uuid, approved_count bigint)
language sql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
  select cs.challenge_id,
         count(*)::bigint as approved_count
  from public.challenge_submissions cs
  where cs.status = 'approved'
  group by cs.challenge_id;
$$;

revoke all on function public.get_approved_submission_counts() from public;
grant execute on function public.get_approved_submission_counts() to anon, authenticated;

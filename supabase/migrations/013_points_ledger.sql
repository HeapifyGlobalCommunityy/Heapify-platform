-- ============================================================
-- MIGRATION 013 — Challenges & Leaderboard: points ledger + reviewer RPCs
-- Slice: CL-P1 (docs/challenges-leaderboard/EXECUTION_PLAN.md)
-- Project: hfdymlfamjyonzasxwvc
-- Depends on: 012_challenges_rls.sql (hardened has_role, challenge_submissions
--             lifecycle columns, leaderboard_entries unique index).
--
-- Scope of this file:
--   * point_awards — immutable audit ledger (R2)
--   * RLS + full client-role DML revocation on point_awards
--   * review_challenge_submission() — atomic review + award + board upsert (R3)
--   * set_challenge_winner()         — approved-submission precondition (R8)
--   * recompute_leaderboard_category() — ledger-derived repair (R11 / F11)
--
-- Point constants (D1): base completion 100, winner bonus 250. Tune here only.
-- ============================================================

-- ---------------------------------------------------------------------------
-- 1. point_awards — the ledger IS the audit log
-- ---------------------------------------------------------------------------
create table if not exists public.point_awards (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  source_type text not null
    check (source_type in ('challenge_completion', 'challenge_winner')),
  source_id   uuid not null,
  points      int  not null check (points > 0),
  awarded_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  -- one award per source per user — blocks double awards even under races
  unique (source_type, source_id, user_id)
);

comment on table public.point_awards is
  'Immutable points ledger for the Challenges & Leaderboard slice (CL). '
  'Rows are inserted ONLY inside security-definer RPC bodies (see 012/013). '
  'source_id = challenge_submissions.id for challenge_completion, '
  'challenges.id for challenge_winner.';

comment on column public.point_awards.points is
  'CL scoring constants (D1): 100 = approved challenge completion, '
  '250 = challenge winner bonus. Retune at migration head only.';

alter table public.point_awards enable row level security;

-- Users read their own awards; reviewers read all. No write policy at all.
drop policy if exists "users read own point awards" on public.point_awards;
create policy "users read own point awards"
on public.point_awards for select to authenticated
using (user_id = auth.uid());

drop policy if exists "reviewers read all point awards" on public.point_awards;
create policy "reviewers read all point awards"
on public.point_awards for select to authenticated
using ((select public.has_role('core_team'::public.user_role)));

-- Read-only table for every client-facing role, including service_role.
grant select on public.point_awards to authenticated;
revoke all on public.point_awards from anon;
revoke insert, update, delete, truncate, references, trigger
  on public.point_awards from anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 2. review_challenge_submission — atomic review + award + board upsert (R3)
--    Approved rows: stamp + ledger insert + leaderboard increment commit or
--    roll back together. Non-pending input returns a structured no-op.
-- ---------------------------------------------------------------------------
create or replace function public.review_challenge_submission(
  p_submission_id uuid,
  p_decision text,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_reviewer     uuid := auth.uid();
  v_status       text;
  v_challenge_id uuid;
  v_user_id      uuid;
  v_points constant int := 100;   -- D1: base completion
begin
  if v_reviewer is null then
    raise exception 'Authentication required';
  end if;

  if not public.has_role('core_team'::public.user_role) then
    raise exception 'Insufficient permissions to review submissions';
  end if;

  if p_decision is null or p_decision not in ('approved', 'rejected') then
    raise exception 'Decision must be approved or rejected';
  end if;

  -- Lock the row so two reviewers cannot both act on a pending submission.
  select status, challenge_id, user_id
    into v_status, v_challenge_id, v_user_id
  from public.challenge_submissions
  where id = p_submission_id
  for update;

  if not found then
    raise exception 'Submission not found';
  end if;

  -- Stale page / double click: report the real state, change nothing.
  if v_status <> 'pending' then
    return jsonb_build_object('status', v_status, 'changed', false);
  end if;

  update public.challenge_submissions
  set status       = p_decision,
      reviewed_by  = v_reviewer,
      reviewed_at  = now(),
      review_note  = p_note
  where id = p_submission_id;

  if p_decision = 'approved' then
    insert into public.point_awards
      (user_id, source_type, source_id, points, awarded_by)
    values
      (v_user_id, 'challenge_completion', p_submission_id, v_points, v_reviewer)
    on conflict (source_type, source_id, user_id) do nothing;

    -- Same advisory lock every derived-row writer takes.
    perform pg_advisory_xact_lock(hashtext('contributors:all_time'));

    insert into public.leaderboard_entries
      (user_id, category, period, score, updated_at)
    values
      (v_user_id, 'contributors', 'all_time', v_points, now())
    on conflict (user_id, category, period)
    do update set score      = leaderboard_entries.score + v_points,
                  updated_at = now();

    return jsonb_build_object(
      'status', 'approved',
      'changed', true,
      'points_awarded', v_points
    );
  end if;

  return jsonb_build_object('status', 'rejected', 'changed', true);
end;
$$;

revoke all on function public.review_challenge_submission(uuid, text, text) from public;
grant execute on function public.review_challenge_submission(uuid, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. set_challenge_winner — explicit winner RPC with precondition (R8 / D2)
--    Idempotent on an unchanged winner; awards 250 only when the winner moves.
-- ---------------------------------------------------------------------------
create or replace function public.set_challenge_winner(
  p_challenge_id uuid,
  p_winner_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_actor            uuid := auth.uid();
  v_current_winner   uuid;
  v_points constant int := 250;   -- D1: winner bonus
begin
  if v_actor is null then
    raise exception 'Authentication required';
  end if;

  if not public.has_role('core_team'::public.user_role) then
    raise exception 'Insufficient permissions to set a winner';
  end if;

  perform 1 from public.challenges where id = p_challenge_id for update;
  if not found then
    raise exception 'Challenge not found';
  end if;

  -- Precondition (F3 strengthening): winner must hold an approved submission.
  if not exists (
    select 1
    from public.challenge_submissions
    where challenge_id = p_challenge_id
      and user_id = p_winner_id
      and status = 'approved'
  ) then
    raise exception 'Winner must have an approved submission for this challenge';
  end if;

  select winner_id into v_current_winner
  from public.challenges
  where id = p_challenge_id;

  if v_current_winner is not distinct from p_winner_id then
    return jsonb_build_object('winner_id', p_winner_id, 'changed', false);
  end if;

  update public.challenges
  set winner_id = p_winner_id
  where id = p_challenge_id;

  insert into public.point_awards
    (user_id, source_type, source_id, points, awarded_by)
  values
    (p_winner_id, 'challenge_winner', p_challenge_id, v_points, v_actor)
  on conflict (source_type, source_id, user_id) do nothing;

  perform pg_advisory_xact_lock(hashtext('contributors:all_time'));

  insert into public.leaderboard_entries
    (user_id, category, period, score, updated_at)
  values
    (p_winner_id, 'contributors', 'all_time', v_points, now())
  on conflict (user_id, category, period)
  do update set score      = leaderboard_entries.score + v_points,
                updated_at = now();

  return jsonb_build_object('winner_id', p_winner_id, 'changed', true);
end;
$$;

revoke all on function public.set_challenge_winner(uuid, uuid) from public;
grant execute on function public.set_challenge_winner(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. recompute_leaderboard_category — repair from the ledger (R11 / F11)
--    Parameterless by contract: it ONLY ever rebuilds ('contributors','all_time'),
--    so no other partition can be blanked. Callable by super_admin, or with no
--    session (SQL editor / owner context, where auth.uid() is null).
-- ---------------------------------------------------------------------------
create or replace function public.recompute_leaderboard_category()
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_actor uuid := auth.uid();
  v_rows  int;
begin
  if v_actor is not null and not public.has_role('super_admin'::public.user_role) then
    raise exception 'Only super_admin may recompute the leaderboard';
  end if;

  perform pg_advisory_xact_lock(hashtext('contributors:all_time'));

  delete from public.leaderboard_entries
  where category = 'contributors'
    and period = 'all_time';

  insert into public.leaderboard_entries
    (user_id, category, period, score, updated_at)
  select user_id,
         'contributors',
         'all_time',
         sum(points)::int,
         now()
  from public.point_awards
  group by user_id;

  get diagnostics v_rows = row_count;

  return jsonb_build_object('rebuilt_rows', v_rows);
end;
$$;

revoke all on function public.recompute_leaderboard_category() from public;
grant execute on function public.recompute_leaderboard_category() to authenticated;

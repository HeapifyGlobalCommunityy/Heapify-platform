-- ============================================================
-- MIGRATION 014 — harden RPC EXECUTE grants against Supabase default privileges
-- Slice: CL-P1 (docs/challenges-leaderboard/EXECUTION_PLAN.md)
-- Project: hfdymlfamjyonzasxwvc
-- Depends on: 012_challenges_rls.sql, 013_points_ledger.sql
--
-- Why this exists (CL-P1 live-verification finding):
--   Supabase sets ALTER DEFAULT PRIVILEGES so that every new function in the
--   public schema gets EXECUTE granted explicitly to anon, authenticated and
--   service_role. `revoke all on function ... from public` in 012/013 removes
--   only the PUBLIC pseudo-role grant, so anon could still invoke the RPCs.
--   submit/review/winner were saved by their internal auth.uid() check, but
--   recompute_leaderboard_category() intentionally allows a null actor (SQL
--   editor / owner context), so anon could trigger a rebuild. Measured live:
--   anon POST /rest/v1/rpc/recompute_leaderboard_category -> 200 rebuilt_rows 0.
--
-- Fix: revoke EXECUTE from the concrete roles, then grant to exactly the
-- intended caller(s).
-- ============================================================

-- Members may submit; nobody else (server actions carry the user session).
revoke execute on function public.submit_challenge_entry(uuid, text)
  from public, anon, service_role;
grant execute on function public.submit_challenge_entry(uuid, text)
  to authenticated;

-- Reviewers act with a session-derived identity.
revoke execute on function public.review_challenge_submission(uuid, text, text)
  from public, anon, service_role;
grant execute on function public.review_challenge_submission(uuid, text, text)
  to authenticated;

revoke execute on function public.set_challenge_winner(uuid, uuid)
  from public, anon, service_role;
grant execute on function public.set_challenge_winner(uuid, uuid)
  to authenticated;

-- Repair is super_admin (session) or owner/SQL-editor (auth.uid() is null).
-- anon must NOT reach the null-actor path.
revoke execute on function public.recompute_leaderboard_category()
  from public, anon;
grant execute on function public.recompute_leaderboard_category()
  to authenticated;

-- Public aggregate stays executable by anon (R7 / F10) — grant explicitly.
revoke execute on function public.get_approved_submission_counts()
  from public;
grant execute on function public.get_approved_submission_counts()
  to anon, authenticated;

-- has_role is evaluated by RLS policies that also apply to anon; it is
-- security-definer and returns false without a session, so anon keeps EXECUTE.
grant execute on function public.has_role(public.user_role)
  to anon, authenticated;

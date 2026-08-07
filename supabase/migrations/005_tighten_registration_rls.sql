-- ============================================================================
-- Migration: 005_tighten_registration_rls
-- Splits the blanket "for all using (auth.uid() = user_id)" policy into
-- explicit per-action policies. The original `for all` implicitly reused
-- `using` for insert's check, but an explicit `with check` is the correct,
-- unambiguous way to gate inserts -- relying on `using` alone for inserts
-- is a known Postgres RLS footgun (using is not guaranteed to be evaluated
-- the same way as an explicit with check on INSERT).
-- ============================================================================

drop policy if exists "users manage own registrations" on event_registrations;

create policy "users select own registrations" on event_registrations
  for select using (auth.uid() = user_id);

create policy "users insert own registrations" on event_registrations
  for insert with check (auth.uid() = user_id);

create policy "users update own registrations" on event_registrations
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users delete own registrations" on event_registrations
  for delete using (auth.uid() = user_id);

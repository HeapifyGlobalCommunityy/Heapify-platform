-- Allow core team members and super admins to review and update submissions.
-- The drops make this safe to run after the policies were created manually.

drop policy if exists "core team read all submissions" on public.form_submissions;
create policy "core team read all submissions"
  on public.form_submissions
  for select
  to authenticated
  using ((select has_role('core_team'::user_role)));

drop policy if exists "core team update submissions" on public.form_submissions;
create policy "core team update submissions"
  on public.form_submissions
  for update
  to authenticated
  using ((select has_role('core_team'::user_role)))
  with check ((select has_role('core_team'::user_role)));

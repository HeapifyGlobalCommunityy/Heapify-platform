-- Allow authorized chapter staff to read registrations for exports.
-- The export route also performs the same resource-level check before querying.
drop policy if exists "authorized staff read event registrations" on public.event_registrations;

create policy "authorized staff read event registrations"
on public.event_registrations
for select
to authenticated
using (
  exists (
    select 1
    from public.events
    left join public.chapters on chapters.id = events.chapter_id
    where events.id = event_registrations.event_id
      and (
        (select has_role('core_team'::user_role))
        or chapters.lead_id = (select auth.uid())
        or exists (
          select 1
          from public.profiles
          where profiles.id = (select auth.uid())
            and profiles.role = 'chapter_admin'::user_role
            and profiles.chapter_id = events.chapter_id
        )
      )
  )
);

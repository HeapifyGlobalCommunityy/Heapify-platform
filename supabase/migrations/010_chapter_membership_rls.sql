-- Allow chapter leads to review only membership requests for their own chapter.

revoke update on public.form_submissions from authenticated;
grant update (status) on public.form_submissions to authenticated;

drop policy if exists "chapter leads read membership requests" on public.form_submissions;
create policy "chapter leads read membership requests"
on public.form_submissions
for select
to authenticated
using (
  form_type = 'chapter_member'
  and exists (
    select 1
    from public.chapters
    where chapters.id::text = form_submissions.payload->>'chapter_id'
      and chapters.lead_id = (select auth.uid())
  )
);

drop policy if exists "chapter leads update membership requests" on public.form_submissions;
create policy "chapter leads update membership requests"
on public.form_submissions
for update
to authenticated
using (
  form_type = 'chapter_member'
  and exists (
    select 1
    from public.chapters
    where chapters.id::text = form_submissions.payload->>'chapter_id'
      and chapters.lead_id = (select auth.uid())
  )
)
with check (
  form_type = 'chapter_member'
  and exists (
    select 1
    from public.chapters
    where chapters.id::text = form_submissions.payload->>'chapter_id'
      and chapters.lead_id = (select auth.uid())
  )
);

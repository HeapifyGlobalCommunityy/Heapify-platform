-- ============================================================
-- MIGRATION: storage policies for public avatars and event banners
-- ============================================================

-- The buckets should be configured as public in Supabase Storage so the
-- existing avatar_url and banner_url values can be rendered directly.
-- Upload, update, and delete access remains protected by these policies.

drop policy if exists "users upload own avatars" on storage.objects;
create policy "users upload own avatars"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "users update own avatars" on storage.objects;
create policy "users update own avatars"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "users delete own avatars" on storage.objects;
create policy "users delete own avatars"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "chapter leads upload event banners" on storage.objects;
create policy "chapter leads upload event banners"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'event-banners'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and (
    exists (
      select 1
      from public.chapters
      where lead_id = (select auth.uid())
    )
    or (select has_role('core_team'::user_role))
  )
);

drop policy if exists "chapter leads update event banners" on storage.objects;
create policy "chapter leads update event banners"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'event-banners'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and (
    exists (
      select 1
      from public.chapters
      where lead_id = (select auth.uid())
    )
    or (select has_role('core_team'::user_role))
  )
)
with check (
  bucket_id = 'event-banners'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and (
    exists (
      select 1
      from public.chapters
      where lead_id = (select auth.uid())
    )
    or (select has_role('core_team'::user_role))
  )
);

drop policy if exists "chapter leads delete event banners" on storage.objects;
create policy "chapter leads delete event banners"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'event-banners'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and (
    exists (
      select 1
      from public.chapters
      where lead_id = (select auth.uid())
    )
    or (select has_role('core_team'::user_role))
  )
);

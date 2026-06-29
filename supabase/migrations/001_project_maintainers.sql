-- ============================================================
-- MIGRATION: replace projects.maintainer_ids with a real join table
-- (safe to run on existing data — pre-launch, but written carefully anyway)
-- ============================================================

-- 1. Role helper — needed by the policies below, doesn't exist yet
create or replace function has_role(min_role user_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
    and role >= min_role
  );
$$;

revoke all on function has_role(user_role) from public;
grant execute on function has_role(user_role) to authenticated;

-- 2. New join table
create table project_maintainers (
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

alter table project_maintainers enable row level security;

create policy "public read maintainers" on project_maintainers
  for select using (true);
create policy "core team assign maintainers" on project_maintainers
  for all using ((select has_role('core_team')))
  with check ((select has_role('core_team')));

-- 3. Migrate any existing maintainer_ids data into the join table —
--    skips any UUID that doesn't match a real profile (the exact risk you caught)
insert into project_maintainers (project_id, user_id)
select p.id, m
from projects p, unnest(p.maintainer_ids) as m
where p.maintainer_ids is not null
  and array_length(p.maintainer_ids, 1) > 0
  and m in (select id from profiles)
on conflict do nothing;

-- 4. Drop the old unsafe column
alter table projects drop column maintainer_ids;

-- 5. Close the open write gap on projects we found earlier
create policy "core team manage projects" on projects for all
  using ((select has_role('core_team')))
  with check ((select has_role('core_team')));

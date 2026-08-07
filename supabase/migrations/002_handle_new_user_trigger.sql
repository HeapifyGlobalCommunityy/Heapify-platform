-- ============================================================
-- 1. Function: create a profiles row whenever a new auth.users row appears
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
begin
  -- derive a starting username from the email (no username field exists
  -- in your sign-up form, so this has to be generated)
  base_username := split_part(new.email, '@', 1);
  final_username := base_username;

  -- profiles.username is unique — guard against collisions
  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, full_name, avatar_url, role)
  values (
    new.id,
    final_username,
    new.raw_user_meta_data->>'full_name',   -- populated automatically for Google sign-ins
    new.raw_user_meta_data->>'avatar_url',  -- same
    'member'
  );

  return new;
end;
$$;

-- ============================================================
-- 2. Trigger: fire the function after every signup
-- ============================================================
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 3. Backfill: fix the rows he already created while testing
-- ============================================================
insert into public.profiles (id, username, full_name, avatar_url, role)
select
  u.id,
  split_part(u.email, '@', 1) || '_' || substr(u.id::text, 1, 4),
  u.raw_user_meta_data->>'full_name',
  u.raw_user_meta_data->>'avatar_url',
  'member'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

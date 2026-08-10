-- ============================================================
-- MIGRATION: protect profile roles and sensitive profile fields
-- ============================================================

-- Users should not create profile rows directly. The auth trigger owns
-- profile creation and always assigns the default member role.
revoke insert on public.profiles from authenticated;

-- Users may edit only their own non-privileged profile fields.
revoke update on public.profiles from authenticated;

grant update (
  username,
  full_name,
  avatar_url,
  bio,
  github_url,
  linkedin_url,
  twitter_url,
  website_url,
  updated_at
) on public.profiles to authenticated;

drop policy if exists "users update own profile" on public.profiles;

create policy "users update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Defense in depth: even if a future grant accidentally exposes role,
-- an authenticated user cannot promote their own profile.
create or replace function public.prevent_self_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() = old.id then
    raise exception 'Users cannot change their own role';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_self_role_change on public.profiles;

create trigger prevent_self_role_change
before update on public.profiles
for each row
execute function public.prevent_self_role_change();

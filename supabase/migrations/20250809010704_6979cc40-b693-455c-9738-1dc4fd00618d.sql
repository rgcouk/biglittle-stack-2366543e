
-- 1) Ensure api schema exists
create schema if not exists api;

-- 2) Make role resolution reliable (never NULL) and independent of existing profiles
--    Order of precedence:
--    a) profiles.role
--    b) auth.users.raw_user_meta_data->>'role'
--    c) fallback 'customer'
create or replace function public.get_current_user_role()
returns text
language sql
stable
security definer
set search_path to 'public'
as $$
  select coalesce(
    (
      select p.role
      from public.profiles p
      where p.user_id = auth.uid()
      limit 1
    ),
    (
      select nullif(u.raw_user_meta_data->>'role','')
      from auth.users u
      where u.id = auth.uid()
      limit 1
    ),
    'customer'
  );
$$;

-- 3) Create an API wrapper so existing frontend calls to api.get_current_user_role work
create or replace function api.get_current_user_role()
returns text
language sql
stable
security definer
set search_path to 'public'
as $$
  select public.get_current_user_role();
$$;

-- 4) Backfill profiles for existing users (idempotent)
insert into public.profiles (user_id, display_name, role)
select
  u.id as user_id,
  coalesce(u.raw_user_meta_data->>'display_name', u.email) as display_name,
  coalesce(nullif(u.raw_user_meta_data->>'role',''), 'customer') as role
from auth.users u
where not exists (
  select 1 from public.profiles p where p.user_id = u.id
);

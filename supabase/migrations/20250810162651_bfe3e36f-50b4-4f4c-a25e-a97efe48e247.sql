
-- 1) Ensure `api` schema and wrapper function exist so the app's `api.get_current_user_role` calls succeed
create schema if not exists api;

create or replace function api.get_current_user_role()
returns text
language sql
stable
security definer
set search_path to 'public'
as $$
  select public.get_current_user_role();
$$;

-- 2) Backfill profiles for any existing users missing a profile row
insert into public.profiles (user_id, display_name, role)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'display_name', u.email),
  coalesce(nullif(u.raw_user_meta_data->>'role',''), 'customer')
from auth.users u
left join public.profiles p on p.user_id = u.id
where p.user_id is null;

-- 3) Sync provider roles from user metadata into profiles (so the trigger can validate provider ownership)
update public.profiles p
set role = 'provider'
where role <> 'provider'
  and exists (
    select 1
    from auth.users u
    where u.id = p.user_id
      and coalesce(u.raw_user_meta_data->>'role','') = 'provider'
  );

-- 4) Create the missing triggers for facilities

-- Auto-set provider_id on insert from the current user's provider profile
drop trigger if exists set_facility_provider_id_before_insert on public.facilities;
create trigger set_facility_provider_id_before_insert
  before insert on public.facilities
  for each row
  execute function public.set_facility_provider_id();

-- Keep updated_at fresh on updates
drop trigger if exists update_facilities_updated_at on public.facilities;
create trigger update_facilities_updated_at
  before update on public.facilities
  for each row
  execute function public.update_updated_at_column();

-- 5) Ensure RLS is enabled on facilities (idempotent)
alter table public.facilities enable row level security;

-- 6) Fix misconfigured profiles policy that referenced api.profiles (use public.profiles instead)
alter policy "Users cannot change their own role"
on public.profiles
using (user_id = auth.uid())
with check (
  (user_id = auth.uid())
  and (role = (
    select p.role
    from public.profiles p
    where p.user_id = auth.uid()
  ))
);

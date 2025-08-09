
-- 1) Prefer a non-"customer" profile role first, otherwise honor metadata role,
-- then fall back to profile (even if "customer"), then default "customer".
create or replace function public.get_current_user_role()
returns text
language sql
stable
security definer
set search_path to 'public'
as $$
  select coalesce(
    -- If profile role is set to something other than "customer", trust it
    (
      select case when p.role is not null and p.role <> 'customer' then p.role end
      from public.profiles p
      where p.user_id = auth.uid()
      limit 1
    ),
    -- Otherwise, use the role from auth.users metadata if present
    (
      select nullif(u.raw_user_meta_data->>'role','')
      from auth.users u
      where u.id = auth.uid()
      limit 1
    ),
    -- Finally, fall back to profile role (could be "customer")
    (
      select p.role
      from public.profiles p
      where p.user_id = auth.uid()
      limit 1
    ),
    'customer'
  );
$$;

-- 2) One-time sync: if metadata says "provider" but profile isn't "provider", update it.
update public.profiles p
set role = 'provider'
from auth.users u
where p.user_id = u.id
  and coalesce(nullif(u.raw_user_meta_data->>'role',''),'customer') = 'provider'
  and p.role <> 'provider';

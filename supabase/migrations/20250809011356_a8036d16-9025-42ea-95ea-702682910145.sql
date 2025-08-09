-- Enable RLS and ownership on facilities; auto-link provider and keep updated_at fresh

-- 1) Enable Row Level Security on facilities
alter table public.facilities enable row level security;

-- 2) Triggers: set provider_id from current provider profile on insert, and keep updated_at on update
-- Drop if they already exist to be idempotent
drop trigger if exists set_facility_provider_id_before_insert on public.facilities;
create trigger set_facility_provider_id_before_insert
before insert on public.facilities
for each row
execute function public.set_facility_provider_id();

drop trigger if exists update_facilities_updated_at on public.facilities;
create trigger update_facilities_updated_at
before update on public.facilities
for each row
execute function public.update_updated_at_column();

-- 3) RLS policies: providers can manage only their own facilities
-- SELECT
drop policy if exists "Providers can view their own facilities" on public.facilities;
create policy "Providers can view their own facilities"
on public.facilities
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = facilities.provider_id
      and p.user_id = auth.uid()
      and p.role = 'provider'
  )
);

-- INSERT
-- Trigger sets provider_id; WITH CHECK ensures the final row belongs to the current provider
drop policy if exists "Providers can insert their own facilities" on public.facilities;
create policy "Providers can insert their own facilities"
on public.facilities
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'provider'
      and p.id = facilities.provider_id
  )
);

-- UPDATE
drop policy if exists "Providers can update their own facilities" on public.facilities;
create policy "Providers can update their own facilities"
on public.facilities
for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = facilities.provider_id
      and p.user_id = auth.uid()
      and p.role = 'provider'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = facilities.provider_id
      and p.user_id = auth.uid()
      and p.role = 'provider'
  )
);

-- DELETE
drop policy if exists "Providers can delete their own facilities" on public.facilities;
create policy "Providers can delete their own facilities"
on public.facilities
for delete
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = facilities.provider_id
      and p.user_id = auth.uid()
      and p.role = 'provider'
  )
);

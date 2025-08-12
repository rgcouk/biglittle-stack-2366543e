-- Consolidated reset migration (retry 4): global trigger cleanup for dependent functions, then full reset
DO $$
DECLARE
  rec record;
BEGIN
  -- 1) Drop any triggers in ANY schema that reference our helper functions
  FOR rec IN
    SELECT n_tbl.nspname AS sch, c.relname AS tbl, tg.tgname AS tgn
    FROM pg_trigger tg
    JOIN pg_class c ON c.oid = tg.tgrelid
    JOIN pg_namespace n_tbl ON n_tbl.oid = c.relnamespace
    JOIN pg_proc p ON p.oid = tg.tgfoid
    WHERE p.proname IN ('set_facility_provider_id', 'set_facility_provider_id_from_providers', 'update_updated_at_column', 'prevent_role_change')
  LOOP
    EXECUTE format('DROP TRIGGER %I ON %I.%I', rec.tgn, rec.sch, rec.tbl);
  END LOOP;

  -- 2) Drop API wrapper if exists
  IF EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'api' AND p.proname = 'get_current_user_role'
  ) THEN
    EXECUTE 'DROP FUNCTION api.get_current_user_role()';
  END IF;

  -- 3) Drop functions in public after removing dependent triggers
  PERFORM 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname='public' AND p.proname='get_current_user_role';
  IF FOUND THEN EXECUTE 'DROP FUNCTION public.get_current_user_role()'; END IF;

  PERFORM 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname='public' AND p.proname='set_facility_provider_id';
  IF FOUND THEN EXECUTE 'DROP FUNCTION public.set_facility_provider_id()'; END IF;

  PERFORM 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname='public' AND p.proname='set_facility_provider_id_from_providers';
  IF FOUND THEN EXECUTE 'DROP FUNCTION public.set_facility_provider_id_from_providers()'; END IF;

  PERFORM 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname='public' AND p.proname='update_updated_at_column';
  IF FOUND THEN EXECUTE 'DROP FUNCTION public.update_updated_at_column()'; END IF;

  PERFORM 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname='public' AND p.proname='handle_new_user';
  IF FOUND THEN EXECUTE 'DROP FUNCTION public.handle_new_user()'; END IF;

  PERFORM 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname='public' AND p.proname='prevent_role_change';
  IF FOUND THEN EXECUTE 'DROP FUNCTION public.prevent_role_change()'; END IF;

  -- 4) Drop tables with CASCADE (order by dependency)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='payments') THEN EXECUTE 'DROP TABLE public.payments CASCADE'; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='bookings') THEN EXECUTE 'DROP TABLE public.bookings CASCADE'; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='units') THEN EXECUTE 'DROP TABLE public.units CASCADE'; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='facilities') THEN EXECUTE 'DROP TABLE public.facilities CASCADE'; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='providers') THEN EXECUTE 'DROP TABLE public.providers CASCADE'; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='profiles') THEN EXECUTE 'DROP TABLE public.profiles CASCADE'; END IF;
END $$;

-- Recreate schema (tables, RLS, functions, triggers)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  display_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'customer',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.providers (
  id bigserial PRIMARY KEY,
  uuid uuid NOT NULL UNIQUE
);

CREATE TABLE public.facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  name text NOT NULL,
  address text NOT NULL,
  postcode text NOT NULL,
  phone text,
  email text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  unit_number text NOT NULL,
  size_category text NOT NULL,
  width_metres numeric,
  length_metres numeric,
  height_metres numeric,
  floor_level integer DEFAULT 0,
  monthly_price_pence integer NOT NULL,
  status text NOT NULL DEFAULT 'available',
  features text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE RESTRICT,
  start_date date NOT NULL,
  end_date date,
  status text NOT NULL DEFAULT 'active',
  monthly_rate_pence integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount_pence integer NOT NULL,
  payment_date timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',
  stripe_payment_id text,
  payment_method text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Providers can view their own facilities" ON public.facilities;
CREATE POLICY "Providers can view their own facilities" ON public.facilities FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = facilities.provider_id AND p.user_id = auth.uid() AND p.role = 'provider')
);

DROP POLICY IF EXISTS "Providers can insert their own facilities" ON public.facilities;
CREATE POLICY "Providers can insert their own facilities" ON public.facilities FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'provider' AND p.id = provider_id)
);

DROP POLICY IF EXISTS "Providers can update their own facilities" ON public.facilities;
CREATE POLICY "Providers can update their own facilities" ON public.facilities FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = facilities.provider_id AND p.user_id = auth.uid() AND p.role = 'provider')
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = facilities.provider_id AND p.user_id = auth.uid() AND p.role = 'provider')
);

DROP POLICY IF EXISTS "Providers can delete their own facilities" ON public.facilities;
CREATE POLICY "Providers can delete their own facilities" ON public.facilities FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = facilities.provider_id AND p.user_id = auth.uid() AND p.role = 'provider')
);

DROP POLICY IF EXISTS "Providers can view units for their facilities" ON public.units;
CREATE POLICY "Providers can view units for their facilities" ON public.units FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.facilities f JOIN public.profiles p ON p.id = f.provider_id
          WHERE f.id = units.facility_id AND p.user_id = auth.uid() AND p.role = 'provider')
);

DROP POLICY IF EXISTS "Providers can insert units for their facilities" ON public.units;
CREATE POLICY "Providers can insert units for their facilities" ON public.units FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.facilities f JOIN public.profiles p ON p.id = f.provider_id
          WHERE f.id = facility_id AND p.user_id = auth.uid() AND p.role = 'provider')
);

DROP POLICY IF EXISTS "Providers can update units for their facilities" ON public.units;
CREATE POLICY "Providers can update units for their facilities" ON public.units FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.facilities f JOIN public.profiles p ON p.id = f.provider_id
          WHERE f.id = units.facility_id AND p.user_id = auth.uid() AND p.role = 'provider')
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.facilities f JOIN public.profiles p ON p.id = f.provider_id
          WHERE f.id = units.facility_id AND p.user_id = auth.uid() AND p.role = 'provider')
);

DROP POLICY IF EXISTS "Providers can delete units for their facilities" ON public.units;
CREATE POLICY "Providers can delete units for their facilities" ON public.units FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.facilities f JOIN public.profiles p ON p.id = f.provider_id
          WHERE f.id = units.facility_id AND p.user_id = auth.uid() AND p.role = 'provider')
);

DROP POLICY IF EXISTS "Customers can view their bookings" ON public.bookings;
CREATE POLICY "Customers can view their bookings" ON public.bookings FOR SELECT USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "Customers can create their bookings" ON public.bookings;
CREATE POLICY "Customers can create their bookings" ON public.bookings FOR INSERT WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "Customers can update their bookings" ON public.bookings;
CREATE POLICY "Customers can update their bookings" ON public.bookings FOR UPDATE USING (customer_id = auth.uid()) WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "Customers can delete their bookings" ON public.bookings;
CREATE POLICY "Customers can delete their bookings" ON public.bookings FOR DELETE USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "Customers can view their payments" ON public.payments;
CREATE POLICY "Customers can view their payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = payments.booking_id AND b.customer_id = auth.uid())
);

DROP POLICY IF EXISTS "Providers can view own provider row" ON public.providers;
CREATE POLICY "Providers can view own provider row" ON public.providers FOR SELECT USING (uuid = auth.uid());

-- Functions and triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON public.facilities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON public.units FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Changing role directly is not allowed';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_role_change BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.prevent_role_change();

CREATE OR REPLACE FUNCTION public.set_facility_provider_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  SELECT id INTO NEW.provider_id FROM public.profiles WHERE user_id = auth.uid() AND role = 'provider';
  IF NEW.provider_id IS NULL THEN
    RAISE EXCEPTION 'Only providers can create facilities';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER before_insert_facilities_set_provider BEFORE INSERT ON public.facilities FOR EACH ROW EXECUTE FUNCTION public.set_facility_provider_id();

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  select coalesce(
    (select case when p.role is not null and p.role <> 'customer' then p.role end
       from public.profiles p where p.user_id = auth.uid() limit 1),
    (select nullif(u.raw_user_meta_data->>'role','') from auth.users u where u.id = auth.uid() limit 1),
    (select p.role from public.profiles p where p.user_id = auth.uid() limit 1),
    'customer'
  );
$$;

CREATE SCHEMA IF NOT EXISTS api;
CREATE OR REPLACE FUNCTION api.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$ SELECT public.get_current_user_role(); $$;

-- Backfill profiles
INSERT INTO public.profiles (user_id, display_name, role)
SELECT u.id,
       COALESCE(u.raw_user_meta_data->>'display_name', u.email),
       COALESCE(NULLIF(u.raw_user_meta_data->>'role',''), 'customer')
FROM auth.users u
ON CONFLICT (user_id) DO NOTHING;
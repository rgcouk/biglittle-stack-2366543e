-- Security hardening migration (with profiles creation)
-- 0) Create profiles table if missing
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Trigger to auto-update updated_at on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to create profile when a user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 1) Ensure api schema exists
CREATE SCHEMA IF NOT EXISTS api;

-- 2) Create a stable, security-definer function to get current user role (api + public for compatibility)
CREATE OR REPLACE FUNCTION api.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

REVOKE ALL ON FUNCTION api.get_current_user_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION api.get_current_user_role() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.get_current_user_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;

-- 3) Updated_at triggers for key tables
DROP TRIGGER IF EXISTS update_facilities_updated_at ON public.facilities;
CREATE TRIGGER update_facilities_updated_at
BEFORE UPDATE ON public.facilities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_units_updated_at ON public.units;
CREATE TRIGGER update_units_updated_at
BEFORE UPDATE ON public.units
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Facilities: server-side ownership enforcement (set provider_id from providers.uuid)
CREATE OR REPLACE FUNCTION public.set_facility_provider_id_from_providers()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT id INTO NEW.provider_id FROM public.providers WHERE uuid = auth.uid();
  IF NEW.provider_id IS NULL THEN
    RAISE EXCEPTION 'Only providers can create facilities';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS facilities_set_provider_id ON public.facilities;
CREATE TRIGGER facilities_set_provider_id
BEFORE INSERT ON public.facilities
FOR EACH ROW
EXECUTE FUNCTION public.set_facility_provider_id_from_providers();

-- 5) Enable Row Level Security for domain tables
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

-- 6) Policies
-- Facilities policies
DROP POLICY IF EXISTS "Users can view their own facilities" ON public.facilities;
DROP POLICY IF EXISTS "Providers can view their facilities" ON public.facilities;
DROP POLICY IF EXISTS "Providers can insert their facilities" ON public.facilities;
DROP POLICY IF EXISTS "Providers can update their facilities" ON public.facilities;
DROP POLICY IF EXISTS "Providers can delete their facilities" ON public.facilities;

CREATE POLICY "Providers can view their facilities"
ON public.facilities
FOR SELECT
TO authenticated
USING (
  provider_id IN (
    SELECT id FROM public.providers WHERE uuid = auth.uid()
  )
);

CREATE POLICY "Providers can insert their facilities"
ON public.facilities
FOR INSERT
TO authenticated
WITH CHECK (
  provider_id = (SELECT id FROM public.providers WHERE uuid = auth.uid())
);

CREATE POLICY "Providers can update their facilities"
ON public.facilities
FOR UPDATE
TO authenticated
USING (
  provider_id IN (
    SELECT id FROM public.providers WHERE uuid = auth.uid()
  )
)
WITH CHECK (
  provider_id IN (
    SELECT id FROM public.providers WHERE uuid = auth.uid()
  )
);

CREATE POLICY "Providers can delete their facilities"
ON public.facilities
FOR DELETE
TO authenticated
USING (
  provider_id IN (
    SELECT id FROM public.providers WHERE uuid = auth.uid()
  )
);

-- Units policies
DROP POLICY IF EXISTS "Providers can view units of their facilities" ON public.units;
DROP POLICY IF EXISTS "Providers can insert units for their facilities" ON public.units;
DROP POLICY IF EXISTS "Providers can update units for their facilities" ON public.units;
DROP POLICY IF EXISTS "Providers can delete units for their facilities" ON public.units;

CREATE POLICY "Providers can view units of their facilities"
ON public.units
FOR SELECT
TO authenticated
USING (
  facility_id IN (
    SELECT f.id
    FROM public.facilities f
    JOIN public.providers p ON p.id = f.provider_id
    WHERE p.uuid = auth.uid()
  )
);

CREATE POLICY "Providers can insert units for their facilities"
ON public.units
FOR INSERT
TO authenticated
WITH CHECK (
  facility_id IN (
    SELECT f.id
    FROM public.facilities f
    JOIN public.providers p ON p.id = f.provider_id
    WHERE p.uuid = auth.uid()
  )
);

CREATE POLICY "Providers can update units for their facilities"
ON public.units
FOR UPDATE
TO authenticated
USING (
  facility_id IN (
    SELECT f.id
    FROM public.facilities f
    JOIN public.providers p ON p.id = f.provider_id
    WHERE p.uuid = auth.uid()
  )
)
WITH CHECK (
  facility_id IN (
    SELECT f.id
    FROM public.facilities f
    JOIN public.providers p ON p.id = f.provider_id
    WHERE p.uuid = auth.uid()
  )
);

CREATE POLICY "Providers can delete units for their facilities"
ON public.units
FOR DELETE
TO authenticated
USING (
  facility_id IN (
    SELECT f.id
    FROM public.facilities f
    JOIN public.providers p ON p.id = f.provider_id
    WHERE p.uuid = auth.uid()
  )
);

-- Bookings policies
DROP POLICY IF EXISTS "Customers can view their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Providers can view bookings for their units" ON public.bookings;
DROP POLICY IF EXISTS "Customers can create their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Customers can update their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Providers can update bookings for their units" ON public.bookings;
DROP POLICY IF EXISTS "Customers can delete their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Providers can delete bookings for their units" ON public.bookings;

CREATE POLICY "Customers can view their bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  customer_id = auth.uid()
);

CREATE POLICY "Providers can view bookings for their units"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.units u
    JOIN public.facilities f ON f.id = u.facility_id
    JOIN public.providers p ON p.id = f.provider_id
    WHERE u.id = bookings.unit_id AND p.uuid = auth.uid()
  )
);

CREATE POLICY "Customers can create their bookings"
ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (
  customer_id = auth.uid()
);

CREATE POLICY "Customers can update their bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (
  customer_id = auth.uid()
)
WITH CHECK (
  customer_id = auth.uid()
);

CREATE POLICY "Providers can update bookings for their units"
ON public.bookings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.units u
    JOIN public.facilities f ON f.id = u.facility_id
    JOIN public.providers p ON p.id = f.provider_id
    WHERE u.id = bookings.unit_id AND p.uuid = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.units u
    JOIN public.facilities f ON f.id = u.facility_id
    JOIN public.providers p ON p.id = f.provider_id
    WHERE u.id = bookings.unit_id AND p.uuid = auth.uid()
  )
);

CREATE POLICY "Customers can delete their bookings"
ON public.bookings
FOR DELETE
TO authenticated
USING (
  customer_id = auth.uid()
);

CREATE POLICY "Providers can delete bookings for their units"
ON public.bookings
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.units u
    JOIN public.facilities f ON f.id = u.facility_id
    JOIN public.providers p ON p.id = f.provider_id
    WHERE u.id = bookings.unit_id AND p.uuid = auth.uid()
  )
);

-- Payments policies (read-only from client)
DROP POLICY IF EXISTS "Customers can view their payments" ON public.payments;
DROP POLICY IF EXISTS "Providers can view payments for their bookings" ON public.payments;

CREATE POLICY "Customers can view their payments"
ON public.payments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.bookings b
    WHERE b.id = payments.booking_id
      AND b.customer_id = auth.uid()
  )
);

CREATE POLICY "Providers can view payments for their bookings"
ON public.payments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.bookings b
    JOIN public.units u ON u.id = b.unit_id
    JOIN public.facilities f ON f.id = u.facility_id
    JOIN public.providers p ON p.id = f.provider_id
    WHERE b.id = payments.booking_id AND p.uuid = auth.uid()
  )
);

-- Providers table policy (read-only for providers)
DROP POLICY IF EXISTS "Providers can view own provider row" ON public.providers;
CREATE POLICY "Providers can view own provider row"
ON public.providers
FOR SELECT
TO authenticated
USING (uuid = auth.uid());
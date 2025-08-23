-- Fix infinite recursion in facilities RLS policies
-- The issue is caused by policies referencing the facilities table within their own definitions

-- First, let's drop the problematic policies
DROP POLICY IF EXISTS "Providers can view their own facilities" ON public.facilities;
DROP POLICY IF EXISTS "Facility owners can view their own facilities" ON public.facilities;
DROP POLICY IF EXISTS "Restricted facility contact access" ON public.facilities;
DROP POLICY IF EXISTS "Providers can insert their own facilities" ON public.facilities;
DROP POLICY IF EXISTS "Providers can update their own facilities" ON public.facilities;
DROP POLICY IF EXISTS "Providers can delete their own facilities" ON public.facilities;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.get_user_provider_profile_id()
RETURNS UUID 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
AS $$
  SELECT p.id FROM public.profiles p 
  WHERE p.user_id = auth.uid() AND p.role = 'provider'
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.user_has_active_booking_in_facility(facility_uuid uuid)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.units u ON u.id = b.unit_id
    WHERE u.facility_id = facility_uuid 
    AND b.customer_id = auth.uid() 
    AND b.status = 'active'
  );
$$;

-- Recreate the policies using the security definer functions
CREATE POLICY "Providers can view their own facilities"
ON public.facilities
FOR SELECT
TO authenticated
USING (provider_id = public.get_user_provider_profile_id());

CREATE POLICY "Providers can insert their own facilities"
ON public.facilities
FOR INSERT
TO authenticated
WITH CHECK (provider_id = public.get_user_provider_profile_id());

CREATE POLICY "Providers can update their own facilities"
ON public.facilities
FOR UPDATE
TO authenticated
USING (provider_id = public.get_user_provider_profile_id())
WITH CHECK (provider_id = public.get_user_provider_profile_id());

CREATE POLICY "Providers can delete their own facilities"
ON public.facilities
FOR DELETE
TO authenticated
USING (provider_id = public.get_user_provider_profile_id());

-- Policy for restricted facility contact access (customers with active bookings + facility owners)
CREATE POLICY "Restricted facility contact access"
ON public.facilities
FOR SELECT
TO authenticated
USING (
  provider_id = public.get_user_provider_profile_id()
  OR 
  public.user_has_active_booking_in_facility(id)
);
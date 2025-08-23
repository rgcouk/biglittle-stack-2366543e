-- Fix search path security warnings for the functions
CREATE OR REPLACE FUNCTION public.get_user_provider_profile_id()
RETURNS UUID 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = public
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
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.units u ON u.id = b.unit_id
    WHERE u.facility_id = facility_uuid 
    AND b.customer_id = auth.uid() 
    AND b.status = 'active'
  );
$$;
-- First create the new function
CREATE OR REPLACE FUNCTION public.get_current_user_provider_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT p.id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'provider'::text
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Update the integrations policy to use the new function
DROP POLICY IF EXISTS "providers_manage_own_integrations_secure" ON public.integrations;
CREATE POLICY "providers_manage_own_integrations_secure" 
ON public.integrations 
FOR ALL 
TO authenticated 
USING (
  provider_id = public.get_current_user_provider_id()
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'provider'
  )
)
WITH CHECK (
  provider_id = public.get_current_user_provider_id()
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'provider'
  )
);

-- Update functions that use the old function name
CREATE OR REPLACE FUNCTION public.validate_user_facility_access(facility_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is provider of the facility
  IF get_current_user_provider_id() IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM public.facilities f
      WHERE f.id = facility_uuid
      AND f.provider_id = get_current_user_provider_id()
    );
  END IF;
  
  -- Check if user has active booking in facility
  RETURN user_has_active_booking_in_facility(facility_uuid);
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_integration_access(integration_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.integrations i
    WHERE i.id = integration_uuid
    AND i.provider_id = get_current_user_provider_id()
  );
END;
$function$;

-- Now drop the old problematic policies on facilities
DROP POLICY IF EXISTS "providers_manage_own_facilities_fixed" ON public.facilities;
DROP POLICY IF EXISTS "customers_view_facility_with_active_booking" ON public.facilities;

-- Drop the old function
DROP FUNCTION IF EXISTS public.get_user_provider_profile_id();

-- Create simple RLS policies for facilities without recursion
CREATE POLICY "providers_can_manage_their_facilities" 
ON public.facilities 
FOR ALL 
TO authenticated 
USING (provider_id = public.get_current_user_provider_id())
WITH CHECK (provider_id = public.get_current_user_provider_id());

-- Create policy for customers to view facilities where they have active bookings
CREATE POLICY "customers_view_facilities_with_bookings" 
ON public.facilities 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 
    FROM public.bookings b
    JOIN public.units u ON u.id = b.unit_id
    WHERE u.facility_id = facilities.id 
    AND b.customer_id = auth.uid()
    AND b.status = 'active'
    AND (b.end_date IS NULL OR b.end_date > CURRENT_DATE)
  )
);
-- Drop the problematic function and policies, then recreate them properly
DROP POLICY IF EXISTS "providers_manage_own_facilities_fixed" ON public.facilities;
DROP FUNCTION IF EXISTS public.get_user_provider_profile_id();

-- Create a simple, non-recursive security definer function
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

-- Create simple RLS policies without recursion
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
-- Step 1: Drop all existing problematic policies on facilities table
DROP POLICY IF EXISTS "providers_can_manage_their_facilities" ON public.facilities;
DROP POLICY IF EXISTS "customers_view_facilities_with_bookings" ON public.facilities;
DROP POLICY IF EXISTS "providers_manage_own_facilities" ON public.facilities;
DROP POLICY IF EXISTS "customers_view_facilities_with_bookings" ON public.facilities;

-- Step 2: Create a very simple, direct policy for providers
-- This avoids the security definer function entirely and uses direct profile lookup
CREATE POLICY "providers_manage_own_facilities_simple" 
ON public.facilities 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND p.role = 'provider'
    AND p.id = facilities.provider_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND p.role = 'provider'
    AND p.id = facilities.provider_id
  )
);

-- Step 3: Create simple customer policy
CREATE POLICY "customers_view_facilities_simple" 
ON public.facilities 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.bookings b ON b.customer_id = p.user_id
    JOIN public.units u ON u.id = b.unit_id
    WHERE p.user_id = auth.uid() 
    AND p.role = 'customer'
    AND u.facility_id = facilities.id
    AND b.status = 'active'
  )
);

-- Step 4: Ensure the function works correctly for other uses
CREATE OR REPLACE FUNCTION public.get_current_user_provider_id()
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER 
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT p.id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'provider'
    LIMIT 1
  );
END;
$$;
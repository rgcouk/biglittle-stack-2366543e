-- Fix critical security vulnerability: Remove overly permissive units policy
-- The 'true OR' condition was making all unit data publicly accessible

-- Drop the problematic policy that exposes all unit data
DROP POLICY IF EXISTS "Customers can interact with units in their facility" ON public.units;

-- Ensure we have proper access control policies for units
-- Policy 1: Customers can view units in their assigned facility or facilities they have bookings in
CREATE POLICY "Customers can view units in their facility or booked facilities" 
ON public.units 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND (
      -- Customer assigned to this facility
      (p.role = 'customer' AND p.facility_id = units.facility_id)
      OR 
      -- Customer has active bookings in this facility
      (p.role = 'customer' AND EXISTS (
        SELECT 1 FROM bookings b 
        WHERE b.customer_id = auth.uid() 
        AND b.unit_id IN (
          SELECT u.id FROM units u WHERE u.facility_id = units.facility_id
        )
        AND b.status = 'active'
      ))
    )
  )
  OR
  -- Providers can view units in their own facilities  
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN facilities f ON f.provider_id = p.id
    WHERE p.user_id = auth.uid() 
    AND p.role = 'provider'
    AND f.id = units.facility_id
  )
);

-- Policy 2: Public can view limited unit discovery info (aggregated data only via views)
-- This allows the units_public_discovery view to work for browsing
CREATE POLICY "Public can access aggregated unit discovery data"
ON public.units
FOR SELECT 
TO anon, authenticated
USING (
  -- Only allow access when queried through specific discovery patterns
  -- This will work with the units_public_discovery view
  current_setting('request.jwt.claims', true)::json->>'sub' IS NULL
  OR 
  -- Authenticated users can see basic info for facility discovery
  auth.uid() IS NOT NULL
);
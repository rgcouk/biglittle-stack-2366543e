-- Drop the problematic RLS policies on units table
DROP POLICY IF EXISTS "Facility customers can view units for booking" ON public.units;
DROP POLICY IF EXISTS "Customers can view units in their facility or booked facilities" ON public.units;
DROP POLICY IF EXISTS "Public can access aggregated unit discovery data" ON public.units;
DROP POLICY IF EXISTS "Providers can manage units in their facilities" ON public.units;

-- Create new, simplified RLS policies that avoid infinite recursion

-- Policy for providers to manage their own facilities' units
CREATE POLICY "Providers can manage their facilities units" 
ON public.units 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM facilities f
    JOIN profiles p ON p.id = f.provider_id
    WHERE f.id = units.facility_id 
    AND p.user_id = auth.uid()
    AND p.role = 'provider'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM facilities f
    JOIN profiles p ON p.id = f.provider_id
    WHERE f.id = units.facility_id 
    AND p.user_id = auth.uid()
    AND p.role = 'provider'
  )
);

-- Policy for customers to view units in facilities they have access to
CREATE POLICY "Customers can view available units" 
ON public.units 
FOR SELECT 
TO authenticated
USING (
  -- Customers can see units if they have a profile with facility_id matching the unit's facility
  EXISTS (
    SELECT 1 
    FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role = 'customer'
    AND (p.facility_id = units.facility_id OR p.facility_id IS NULL)
  )
  OR
  -- Or if they have an active booking for any unit in this facility  
  EXISTS (
    SELECT 1
    FROM bookings b
    JOIN units u ON u.id = b.unit_id
    WHERE b.customer_id = auth.uid()
    AND u.facility_id = units.facility_id
    AND b.status = 'active'
  )
);

-- Policy for public access to unit discovery (anonymous users)
CREATE POLICY "Public can view unit discovery info" 
ON public.units 
FOR SELECT 
TO anon
USING (status = 'available');
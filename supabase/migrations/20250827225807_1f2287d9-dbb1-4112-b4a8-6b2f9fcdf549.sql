-- Fix infinite recursion in units policies by using a simpler approach
-- Drop the problematic policy
DROP POLICY IF EXISTS "Providers can manage their facility units" ON public.units;

-- Create a much simpler policy that avoids recursion
-- This policy directly checks against the user's profile without complex joins
CREATE POLICY "Providers can manage units" ON public.units
FOR ALL USING (
  facility_id IN (
    SELECT f.id FROM public.facilities f
    WHERE f.provider_id = (
      SELECT p.id FROM public.profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.role = 'provider'
      LIMIT 1
    )
  )
);

-- Also update bookings policies to avoid recursion
DROP POLICY IF EXISTS "Providers can view bookings for their facilities" ON public.bookings;

CREATE POLICY "Providers can view facility bookings" ON public.bookings
FOR SELECT USING (
  unit_id IN (
    SELECT u.id FROM public.units u
    JOIN public.facilities f ON f.id = u.facility_id
    WHERE f.provider_id = (
      SELECT p.id FROM public.profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.role = 'provider'
      LIMIT 1
    )
  )
);
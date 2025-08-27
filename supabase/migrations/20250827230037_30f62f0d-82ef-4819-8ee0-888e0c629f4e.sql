-- Drop all existing unit policies and recreate them properly
DROP POLICY IF EXISTS "Providers can manage units" ON public.units;
DROP POLICY IF EXISTS "Customers can view available units" ON public.units;
DROP POLICY IF EXISTS "Public can view unit discovery info" ON public.units;

-- Create comprehensive RLS policies for units
-- 1. Public can view all available units (for storefront)
CREATE POLICY "Public can view available units" ON public.units
FOR SELECT USING (status = 'available');

-- 2. Providers can manage their facility units
CREATE POLICY "Providers can manage their units" ON public.units
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.facilities f
    JOIN public.profiles p ON p.id = f.provider_id
    WHERE f.id = units.facility_id
    AND p.user_id = auth.uid()
    AND p.role = 'provider'
  )
);

-- 3. Customers can view units in their assigned facility or units they have bookings for
CREATE POLICY "Customers can view facility units" ON public.units
FOR SELECT USING (
  -- Customer can see units in their assigned facility
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
    AND p.role = 'customer'
    AND (p.facility_id = units.facility_id OR p.facility_id IS NULL)
  )
  OR
  -- Customer can see units they have active bookings for
  EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.unit_id = units.id
    AND b.customer_id = auth.uid()
    AND b.status = 'active'
  )
);
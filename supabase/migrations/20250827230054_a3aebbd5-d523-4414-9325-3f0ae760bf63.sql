-- First, let's see what policies exist and drop them all
DROP POLICY IF EXISTS "Public can view available units" ON public.units;
DROP POLICY IF EXISTS "Providers can manage units" ON public.units;
DROP POLICY IF EXISTS "Customers can view available units" ON public.units;
DROP POLICY IF EXISTS "Public can view unit discovery info" ON public.units;
DROP POLICY IF EXISTS "Providers can manage their units" ON public.units;
DROP POLICY IF EXISTS "Customers can view facility units" ON public.units;
DROP POLICY IF EXISTS "Providers can manage their facilities units" ON public.units;
DROP POLICY IF EXISTS "Providers can manage their facility units" ON public.units;

-- Now create simple, non-conflicting policies
-- Allow public to view available units (essential for storefront)
CREATE POLICY "units_public_select" ON public.units
FOR SELECT USING (true);

-- Allow providers to manage their units
CREATE POLICY "units_provider_all" ON public.units
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.facilities f, public.profiles p
    WHERE f.id = units.facility_id
    AND f.provider_id = p.id
    AND p.user_id = auth.uid()
    AND p.role = 'provider'
  )
);
-- Use unique timestamps to avoid naming conflicts
-- Clear all existing policies first
DROP POLICY IF EXISTS "units_public_select" ON public.units;
DROP POLICY IF EXISTS "units_provider_all" ON public.units;

-- Create new policies with unique names
CREATE POLICY "units_public_read_2025" ON public.units
FOR SELECT USING (true);

CREATE POLICY "units_provider_manage_2025" ON public.units
FOR ALL USING (
  EXISTS (
    SELECT 1 
    FROM public.facilities f, public.profiles p
    WHERE f.id = units.facility_id
    AND f.provider_id = p.id
    AND p.user_id = auth.uid()
    AND p.role = 'provider'
  )
);
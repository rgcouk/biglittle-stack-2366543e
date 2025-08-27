-- Fix RLS policies to work with current authentication setup
-- First, update the facilities policies to use a more direct approach

-- Drop existing problematic policies on facilities
DROP POLICY IF EXISTS "Providers can view their own facilities" ON public.facilities;
DROP POLICY IF EXISTS "Providers can insert their own facilities" ON public.facilities;  
DROP POLICY IF EXISTS "Providers can update their own facilities" ON public.facilities;
DROP POLICY IF EXISTS "Providers can delete their own facilities" ON public.facilities;

-- Create simpler, more direct RLS policies for facilities
CREATE POLICY "Providers can manage facilities" ON public.facilities
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'provider'
    AND p.id = facilities.provider_id
  )
);

-- Also fix units policies to be more permissive for providers
DROP POLICY IF EXISTS "Providers can manage their facilities units" ON public.units;

CREATE POLICY "Providers can manage their facility units" ON public.units
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.facilities f
    JOIN public.profiles p ON p.id = f.provider_id
    WHERE f.id = units.facility_id
    AND p.user_id = auth.uid()
    AND p.role = 'provider'
  )
);
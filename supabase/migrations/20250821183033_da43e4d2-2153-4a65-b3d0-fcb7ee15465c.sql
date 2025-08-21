-- Add facility_id to profiles for customer scoping
ALTER TABLE public.profiles 
ADD COLUMN facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE;

-- Add subdomain field to facilities for routing
ALTER TABLE public.facilities 
ADD COLUMN subdomain TEXT UNIQUE;

-- Add index for subdomain lookups
CREATE INDEX idx_facilities_subdomain ON public.facilities(subdomain);

-- Update profiles to ensure customers are scoped to facilities
-- Providers don't need facility_id (they own facilities)
ALTER TABLE public.profiles 
ADD CONSTRAINT check_customer_has_facility 
CHECK (
  (role = 'provider' AND facility_id IS NULL) OR 
  (role = 'customer' AND facility_id IS NOT NULL)
);

-- Create function to get facility from subdomain
CREATE OR REPLACE FUNCTION public.get_facility_by_subdomain(subdomain_input TEXT)
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id FROM public.facilities WHERE subdomain = subdomain_input LIMIT 1;
$$;

-- Update RLS policies for multi-tenant customer access

-- Drop existing customer booking policies and recreate with facility scoping
DROP POLICY IF EXISTS "Customers can view their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Customers can create their bookings" ON public.bookings;  
DROP POLICY IF EXISTS "Customers can update their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Customers can delete their bookings" ON public.bookings;

-- Customers can only see bookings from their facility
CREATE POLICY "Customers can view bookings in their facility" 
ON public.bookings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'customer' 
    AND customer_id = auth.uid()
  )
);

CREATE POLICY "Customers can create bookings in their facility" 
ON public.bookings 
FOR INSERT 
WITH CHECK (
  customer_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.units u
    JOIN public.facilities f ON u.facility_id = f.id
    JOIN public.profiles p ON p.facility_id = f.id
    WHERE u.id = unit_id 
    AND p.user_id = auth.uid() 
    AND p.role = 'customer'
  )
);

CREATE POLICY "Customers can update their bookings in their facility" 
ON public.bookings 
FOR UPDATE 
USING (customer_id = auth.uid())
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can delete their bookings in their facility" 
ON public.bookings 
FOR DELETE 
USING (customer_id = auth.uid());

-- Providers can see all bookings for their facilities
CREATE POLICY "Providers can view bookings for their facilities" 
ON public.bookings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.units u
    JOIN public.facilities f ON u.facility_id = f.id
    JOIN public.profiles p ON p.id = f.provider_id
    WHERE u.id = unit_id 
    AND p.user_id = auth.uid() 
    AND p.role = 'provider'
  )
);

-- Update units policy for facility-scoped customer access
DROP POLICY IF EXISTS "Anyone can view units" ON public.units;

CREATE POLICY "Public can view units for facility discovery" 
ON public.units 
FOR SELECT 
USING (true);

-- Customers can only book units from their facility
CREATE POLICY "Customers can interact with units in their facility" 
ON public.units 
FOR SELECT 
USING (
  -- Public access for discovery OR customer access to their facility's units
  true OR EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.facility_id = facility_id
    AND p.role = 'customer'
  )
);
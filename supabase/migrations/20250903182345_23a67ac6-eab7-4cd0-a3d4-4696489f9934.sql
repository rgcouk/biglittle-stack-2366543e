-- Fix infinite recursion in facilities table RLS policies
-- The issue is likely caused by circular references in policy conditions

-- Drop existing policies that may be causing recursion
DROP POLICY IF EXISTS "restricted_facility_contact_access" ON public.facilities;
DROP POLICY IF EXISTS "Providers can manage facilities" ON public.facilities;

-- Create new, non-recursive policies for facilities table
-- Policy 1: Providers can manage their own facilities
CREATE POLICY "providers_manage_own_facilities_fixed" 
ON public.facilities 
FOR ALL 
USING (
  provider_id = get_user_provider_profile_id()
);

-- Policy 2: Customers can view basic facility info only if they have active bookings
CREATE POLICY "customers_view_facility_with_active_booking" 
ON public.facilities 
FOR SELECT 
USING (
  -- Allow if user has active booking in this facility
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.units u ON u.id = b.unit_id
    WHERE u.facility_id = facilities.id 
    AND b.customer_id = auth.uid() 
    AND b.status = 'active'
    AND (b.end_date IS NULL OR b.end_date > CURRENT_DATE)
  )
);

-- Policy 3: Public can view facilities for discovery (limited fields only)
-- This will be handled by the facilities_public_marketing table instead
-- to avoid exposing sensitive contact information

-- Update the marketing sync function to ensure it works properly
CREATE OR REPLACE FUNCTION public.sync_facility_marketing_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert or update marketing data when facility is created/updated
  INSERT INTO public.facilities_public_marketing (
    id, name, address, postcode, description, created_at, updated_at
  )
  VALUES (
    NEW.id, NEW.name, NEW.address, NEW.postcode, NEW.description, NEW.created_at, NEW.updated_at
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    address = EXCLUDED.address, 
    postcode = EXCLUDED.postcode,
    description = EXCLUDED.description,
    updated_at = EXCLUDED.updated_at;
    
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists for facilities
DROP TRIGGER IF EXISTS sync_facility_marketing ON public.facilities;
CREATE TRIGGER sync_facility_marketing
    AFTER INSERT OR UPDATE ON public.facilities
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_facility_marketing_data();
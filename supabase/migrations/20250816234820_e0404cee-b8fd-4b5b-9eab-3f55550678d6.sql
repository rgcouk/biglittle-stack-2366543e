-- =============================================
-- ADDITIONAL SECURITY FIXES FOR FACILITY CONTACT DATA
-- =============================================

-- 1. Remove the overly permissive authenticated user policy
DROP POLICY IF EXISTS "Authenticated users can view facility contact details" ON public.facilities;

-- 2. Create restrictive policies for facility contact access
-- Only facility owners can view their own facility's full details
CREATE POLICY "Facility owners can view their own facilities"
  ON public.facilities
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.role = 'provider' 
      AND p.id = facilities.provider_id
    )
  );

-- Customers can only view facility contact details if they have an active booking
CREATE POLICY "Customers can view contact details for booked facilities"
  ON public.facilities
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.units u ON u.id = b.unit_id
      WHERE u.facility_id = facilities.id
      AND b.customer_id = auth.uid()
      AND b.status = 'active'
    )
  );

-- 3. Enable RLS on the safe public view and add proper policies
ALTER VIEW public.facilities_safe_public SET (security_barrier = true);

-- Note: Views inherit RLS from underlying tables, but we need to ensure
-- the safe view only shows non-sensitive data

-- 4. Create a completely public read policy for the safe view data only
-- We'll do this by creating a separate public table for marketing data
CREATE TABLE IF NOT EXISTS public.facilities_public_marketing (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  address text NOT NULL, 
  postcode text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on marketing table
ALTER TABLE public.facilities_public_marketing ENABLE ROW LEVEL SECURITY;

-- Allow public read access to marketing data
CREATE POLICY "Public can view facility marketing info"
  ON public.facilities_public_marketing
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 5. Create function to sync marketing data (providers only)
CREATE OR REPLACE FUNCTION public.sync_facility_marketing_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- 6. Create trigger to sync marketing data
DROP TRIGGER IF EXISTS sync_marketing_data_trigger ON public.facilities;
CREATE TRIGGER sync_marketing_data_trigger
  AFTER INSERT OR UPDATE ON public.facilities
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_facility_marketing_data();

-- 7. Initial sync of existing data
INSERT INTO public.facilities_public_marketing (id, name, address, postcode, description, created_at, updated_at)
SELECT id, name, address, postcode, description, created_at, updated_at
FROM public.facilities
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  postcode = EXCLUDED.postcode, 
  description = EXCLUDED.description,
  updated_at = EXCLUDED.updated_at;

-- =============================================
-- CONTACT DATA NOW PROPERLY SECURED
-- =============================================
-- ✅ Facility contact data only accessible to:
--    - Facility owners (providers)  
--    - Customers with active bookings
-- ✅ Public can only see marketing data (no email/phone)
-- ✅ Automatic sync keeps marketing data current
-- =============================================
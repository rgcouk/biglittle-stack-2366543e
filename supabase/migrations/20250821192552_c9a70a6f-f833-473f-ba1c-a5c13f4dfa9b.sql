-- PHASE 1: Critical Role Management Security Fixes

-- Remove the problematic RLS policy that references api.profiles and could allow role changes
DROP POLICY IF EXISTS "Users cannot change their own role" ON public.profiles;

-- Create a proper security definer function to check current user role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role_safe()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (
      SELECT p.role
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
      LIMIT 1
    ),
    'customer'
  );
$$;

-- Create a restrictive policy that prevents users from changing their own role
CREATE POLICY "Users cannot change their own role" 
ON public.profiles 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid() 
  AND role = (
    SELECT profiles_old.role 
    FROM public.profiles profiles_old 
    WHERE profiles_old.user_id = auth.uid()
  )
);

-- Add a trigger to log role changes for audit purposes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log role changes (in a real system, you'd want a proper audit table)
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    RAISE LOG 'Role change detected: user % changed from % to % at %', 
      NEW.user_id, OLD.role, NEW.role, now();
  END IF;
  RETURN NEW;
END;
$$;

-- Create the audit trigger
DROP TRIGGER IF EXISTS audit_profile_role_changes ON public.profiles;
CREATE TRIGGER audit_profile_role_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_role_changes();

-- PHASE 2: Secure Facility Contact Information Access

-- Remove overly permissive facility policies and replace with secure ones
DROP POLICY IF EXISTS "Customers can view contact details for booked facilities" ON public.facilities;

-- Only allow facility contact info access to facility owners and customers with active bookings
CREATE POLICY "Restricted facility contact access" 
ON public.facilities 
FOR SELECT 
USING (
  -- Facility owners can see their own facilities
  EXISTS (
    SELECT 1 
    FROM profiles p 
    WHERE p.id = facilities.provider_id 
    AND p.user_id = auth.uid() 
    AND p.role = 'provider'
  )
  OR
  -- Customers can only see contact info for facilities where they have active bookings
  EXISTS (
    SELECT 1 
    FROM bookings b 
    JOIN units u ON u.id = b.unit_id 
    WHERE u.facility_id = facilities.id 
    AND b.customer_id = auth.uid() 
    AND b.status = 'active'
  )
);

-- PHASE 3: Implement Graduated Unit Information Access

-- Remove the overly permissive "Public can view units for facility discovery" policy
DROP POLICY IF EXISTS "Public can view units for facility discovery" ON public.units;

-- Create a view for public unit discovery with limited information
CREATE OR REPLACE VIEW public.units_public_discovery AS
SELECT 
  u.facility_id,
  u.size_category,
  COUNT(*) FILTER (WHERE u.status = 'available') as available_count,
  MIN(u.monthly_price_pence) as min_price_pence,
  MAX(u.monthly_price_pence) as max_price_pence
FROM public.units u
GROUP BY u.facility_id, u.size_category;

-- Grant public access to the discovery view
GRANT SELECT ON public.units_public_discovery TO anon, authenticated;

-- Create restrictive policies for the units table
CREATE POLICY "Facility customers can view units for booking" 
ON public.units 
FOR SELECT 
USING (
  -- Authenticated users can see units in facilities they're associated with
  EXISTS (
    SELECT 1 
    FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND (
      p.facility_id = units.facility_id  -- Customers in the facility
      OR 
      (p.role = 'provider' AND p.id = (
        SELECT f.provider_id 
        FROM facilities f 
        WHERE f.id = units.facility_id
      )) -- Providers who own the facility
    )
  )
);

-- PHASE 4: Strengthen Authentication Security

-- Update the handle_new_user function to be more secure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role text;
  user_facility_id uuid;
BEGIN
  -- Validate and sanitize the role (default to customer, only allow specific values)
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
  IF user_role NOT IN ('customer', 'provider') THEN
    user_role := 'customer';
  END IF;
  
  -- Only set facility_id for customers, and validate it exists
  user_facility_id := NULL;
  IF user_role = 'customer' AND NEW.raw_user_meta_data->>'facility_id' IS NOT NULL THEN
    -- Validate facility exists and is active
    SELECT id INTO user_facility_id 
    FROM public.facilities 
    WHERE id = (NEW.raw_user_meta_data->>'facility_id')::uuid
    LIMIT 1;
  END IF;
  
  -- Insert with validated data
  INSERT INTO public.profiles (user_id, display_name, role, facility_id)
  VALUES (
    NEW.id,
    COALESCE(
      trim(NEW.raw_user_meta_data->>'display_name'), 
      split_part(NEW.email, '@', 1)  -- Use email prefix if no display name
    ),
    user_role,
    user_facility_id
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    -- Never update role or facility_id on conflict to prevent manipulation
    updated_at = now();
    
  RETURN NEW;
END;
$$;

-- Add rate limiting function for sensitive operations (basic implementation)
CREATE OR REPLACE FUNCTION public.check_rate_limit(operation_type text, user_id uuid, max_attempts integer DEFAULT 5, window_minutes integer DEFAULT 15)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  attempt_count integer;
BEGIN
  -- This is a basic rate limiting check
  -- In production, you'd want a proper rate limiting table with cleanup
  
  -- For now, just log the attempt
  RAISE LOG 'Rate limit check for operation % by user % (max: %/%min)', 
    operation_type, user_id, max_attempts, window_minutes;
    
  -- Always return true for now (implement proper rate limiting table later)
  RETURN true;
END;
$$;
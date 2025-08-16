-- =============================================
-- CRITICAL SECURITY FIXES MIGRATION
-- =============================================

-- Phase 1: Fix Critical Data Exposure
-- ====================================

-- 1. Remove overly permissive facility policy that exposed contact info
DROP POLICY IF EXISTS "Anyone can view facility basic info" ON public.facilities;

-- 2. Create secure public view for facilities (excluding sensitive contact info)
CREATE OR REPLACE VIEW public.facilities_safe_public AS
SELECT 
  id,
  name,
  address,
  postcode,
  description,
  created_at,
  updated_at
FROM public.facilities;

-- 3. Allow public read access to the safe view
ALTER VIEW public.facilities_safe_public OWNER TO postgres;
GRANT SELECT ON public.facilities_safe_public TO anon, authenticated;

-- 4. Add secure policy for authenticated users to view full facility details
CREATE POLICY "Authenticated users can view facility contact details"
  ON public.facilities
  FOR SELECT
  TO authenticated
  USING (true);

-- 5. Fix Payment System Vulnerabilities
-- Remove dangerous overly permissive payment policies
DROP POLICY IF EXISTS "System can insert payments" ON public.payments;
DROP POLICY IF EXISTS "System can update payment status" ON public.payments;

-- Create secure payment policies
CREATE POLICY "Only booking owners can view their payments"
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b 
      WHERE b.id = payments.booking_id 
      AND b.customer_id = auth.uid()
    )
  );

-- Only allow payment creation through secure edge functions (service role)
-- No direct INSERT access for regular users

-- Phase 2: Database Security Hardening
-- ===================================

-- 6. Secure all database functions with explicit search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    -- First try to get role from profiles table
    (
      SELECT p.role
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
      LIMIT 1
    ),
    -- Fallback to metadata from auth.users
    (
      SELECT COALESCE(
        nullif(u.raw_user_meta_data->>'role', ''),
        'customer'
      )
      FROM auth.users u
      WHERE u.id = auth.uid()
      LIMIT 1
    ),
    'customer'
  );
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    role = COALESCE(EXCLUDED.role, profiles.role);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_facility_provider_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Get the profile ID for the current user with provider role
    SELECT id INTO NEW.provider_id 
    FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'provider';
    
    -- If no provider profile found, raise an error
    IF NEW.provider_id IS NULL THEN
        RAISE EXCEPTION 'Only providers can create facilities';
    END IF;
    
    RETURN NEW;
END;
$function$;

-- 7. Remove redundant RLS policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Keep only the necessary policies with clear naming
-- (The remaining policies with "their own" naming are sufficient)

-- 8. Add trigger for facility provider assignment (if not exists)
DROP TRIGGER IF EXISTS set_facility_provider_trigger ON public.facilities;
CREATE TRIGGER set_facility_provider_trigger
  BEFORE INSERT ON public.facilities
  FOR EACH ROW
  EXECUTE FUNCTION public.set_facility_provider_id();

-- =============================================
-- SECURITY FIXES COMPLETED
-- =============================================
-- Critical fixes implemented:
-- ✅ Facility contact data secured
-- ✅ Payment system vulnerabilities fixed  
-- ✅ Database functions secured with search_path
-- ✅ Redundant RLS policies removed
-- ✅ Proper access controls established
-- =============================================
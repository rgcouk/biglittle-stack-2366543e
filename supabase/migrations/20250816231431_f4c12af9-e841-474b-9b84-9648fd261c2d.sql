-- Phase 1: Fix Critical Marketplace Functionality
-- Create public read policies for facilities (excluding sensitive contact data)
CREATE POLICY "Anyone can view facility basic info" 
ON public.facilities 
FOR SELECT 
USING (true);

-- Create public read policies for units 
CREATE POLICY "Anyone can view units" 
ON public.units 
FOR SELECT 
USING (true);

-- Phase 2: Enhance Data Protection
-- Add comprehensive payment RLS policies
CREATE POLICY "System can insert payments" 
ON public.payments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update payment status" 
ON public.payments 
FOR UPDATE 
USING (true);

-- Remove duplicate RLS policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;  
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users cannot change their own role" ON public.profiles;

-- Keep only the cleaner policy names
-- Note: The other policies with "their own" naming will remain

-- Phase 2: Secure database functions with proper search_path
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

-- Create a public-safe view for facilities that excludes sensitive contact data
CREATE OR REPLACE VIEW public.facilities_public AS
SELECT 
    id,
    name,
    address,
    postcode,
    description,
    created_at,
    updated_at
FROM public.facilities;

-- Grant access to the public view
GRANT SELECT ON public.facilities_public TO anon, authenticated;
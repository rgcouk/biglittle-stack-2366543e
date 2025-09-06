-- Fix critical security issues (corrected version)

-- Add missing RLS policies for units_secure_discovery
CREATE POLICY "Allow public read access to secure unit discovery" 
ON public.units_secure_discovery 
FOR SELECT 
USING (true);

-- Fix functions with mutable search_path that we can modify
ALTER FUNCTION public.get_user_role_enhanced() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.check_rate_limit_enhanced(text, integer, integer) SET search_path = public;

-- Create a network-resilient auth check function
CREATE OR REPLACE FUNCTION public.get_auth_status()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return basic auth status for debugging
  RETURN json_build_object(
    'authenticated', auth.uid() IS NOT NULL,
    'user_id', auth.uid(),
    'has_profile', EXISTS(SELECT 1 FROM profiles WHERE user_id = auth.uid()),
    'timestamp', NOW()
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Return safe error info
    RETURN json_build_object(
      'authenticated', false,
      'error', 'auth_check_failed',
      'timestamp', NOW()
    );
END;
$$;
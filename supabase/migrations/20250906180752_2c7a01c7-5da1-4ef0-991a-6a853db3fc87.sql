-- Fix critical security issues identified by the linter

-- Enable leaked password protection
UPDATE auth.config SET
  password_min_length = 8,
  password_require_letters = true,
  password_require_numbers = true,
  password_require_symbols = false,
  password_require_uppercase = false,
  leaked_password_protection = true;

-- Add missing RLS policies for units_secure_discovery
CREATE POLICY "Allow public read access to secure unit discovery" 
ON public.units_secure_discovery 
FOR SELECT 
USING (true);

-- Fix functions with mutable search_path
ALTER FUNCTION public.get_user_role_enhanced() SET search_path = '';
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- Create a more resilient auth state check function
CREATE OR REPLACE FUNCTION public.check_auth_status()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return basic auth status without exposing sensitive data
  RETURN json_build_object(
    'authenticated', auth.uid() IS NOT NULL,
    'user_id', auth.uid(),
    'timestamp', NOW()
  );
END;
$$;
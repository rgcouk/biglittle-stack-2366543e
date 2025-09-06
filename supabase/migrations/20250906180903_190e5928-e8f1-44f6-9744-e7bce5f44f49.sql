-- Fix only the function search paths that we can modify

-- Fix functions that need search_path set (corrected)
ALTER FUNCTION public.get_user_role_enhanced() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.check_rate_limit_enhanced(text, integer, integer) SET search_path = public;

-- Create a network-resilient auth utilities function
CREATE OR REPLACE FUNCTION public.check_auth_connectivity()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Simple connectivity check that doesn't rely on external auth
  RETURN json_build_object(
    'database_connected', true,
    'auth_uid', auth.uid(),
    'timestamp', NOW(),
    'session_active', auth.uid() IS NOT NULL
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'database_connected', false,
      'error', SQLERRM,
      'timestamp', NOW()
    );
END;
$$;
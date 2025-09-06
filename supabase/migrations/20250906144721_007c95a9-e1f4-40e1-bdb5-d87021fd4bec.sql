-- SECURITY FIX: Remove unnecessary SECURITY DEFINER functions (with proper dependency handling)

-- Step 1: Drop dependent triggers first
DROP TRIGGER IF EXISTS audit_role_changes_trigger ON public.profiles;

-- Step 2: Drop the problematic functions
DROP FUNCTION IF EXISTS api.get_current_user_role();
DROP FUNCTION IF EXISTS public.audit_critical_changes();
DROP FUNCTION IF EXISTS public.check_rate_limit(text, uuid, integer, integer);

-- Step 3: Update audit_role_changes to be safer (just logging, not blocking)
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Only log role changes for audit purposes (don't block operations)
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Log to our security audit table instead of auth schema
    PERFORM log_sensitive_access(
      'ROLE_CHANGE_DETECTED',
      'profiles',
      NEW.id,
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'user_id', NEW.user_id,
        'timestamp', now()
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Step 4: Ensure get_current_user_role function is properly scoped
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE sql 
STABLE SECURITY DEFINER 
SET search_path = public
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

-- Step 5: Ensure get_current_user_provider_id is properly scoped
CREATE OR REPLACE FUNCTION public.get_current_user_provider_id()
RETURNS UUID 
LANGUAGE plpgsql 
STABLE SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT p.id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'provider'
    LIMIT 1
  );
END;
$$;

-- Step 6: Update rate limiting functions to be more secure with input validation
CREATE OR REPLACE FUNCTION public.check_rate_limit_enhanced(operation_type text, max_attempts integer DEFAULT 5, window_minutes integer DEFAULT 15)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_window timestamp with time zone;
  attempt_count integer;
BEGIN
  -- Skip rate limiting for unauthenticated users
  IF auth.uid() IS NULL THEN
    RETURN true;
  END IF;
  
  -- Validate input parameters to prevent injection
  IF operation_type IS NULL OR length(operation_type) > 100 THEN
    RETURN false;
  END IF;
  
  IF max_attempts < 1 OR max_attempts > 1000 OR window_minutes < 1 OR window_minutes > 1440 THEN
    RETURN false;
  END IF;
  
  -- Calculate current window start
  current_window := date_trunc('minute', now()) - 
    (EXTRACT(minute FROM now())::integer % window_minutes) * interval '1 minute';
  
  -- Get current attempt count for this window
  SELECT COALESCE(attempts, 0) INTO attempt_count
  FROM public.rate_limits
  WHERE user_id = auth.uid() 
  AND operation = operation_type 
  AND window_start = current_window;
  
  -- Check if limit exceeded
  IF attempt_count >= max_attempts THEN
    -- Log the rate limit violation
    PERFORM log_sensitive_access(
      'RATE_LIMIT_EXCEEDED', 
      'rate_limits', 
      NULL, 
      jsonb_build_object(
        'operation', operation_type,
        'attempts', attempt_count,
        'max_attempts', max_attempts
      )
    );
    RETURN false;
  END IF;
  
  -- Increment or insert attempt count
  INSERT INTO public.rate_limits (user_id, operation, attempts, window_start)
  VALUES (auth.uid(), operation_type, 1, current_window)
  ON CONFLICT (user_id, operation, window_start) 
  DO UPDATE SET attempts = rate_limits.attempts + 1;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    -- Allow operation if rate limiting fails (fail open for availability)
    RETURN true;
END;
$$;

-- Step 7: Add security documentation comments
COMMENT ON FUNCTION public.get_current_user_role() IS 'Securely gets current user role. SECURITY DEFINER required for RLS bypass to read profiles table.';
COMMENT ON FUNCTION public.get_current_user_provider_id() IS 'Securely gets current user provider ID. SECURITY DEFINER required for RLS bypass to read profiles table.';
COMMENT ON FUNCTION public.check_rate_limit_enhanced(text, integer, integer) IS 'Rate limiting with input validation. SECURITY DEFINER required for rate_limits table access.';
COMMENT ON FUNCTION public.audit_role_changes() IS 'Audit trigger for role changes. SECURITY DEFINER required for security_audit_log access.';
COMMENT ON FUNCTION public.audit_profile_changes() IS 'Audit trigger for profile changes. SECURITY DEFINER required for security_audit_log access.';

-- Step 8: Update remaining security definer functions to have minimal privileges needed
-- Validate integration access function
CREATE OR REPLACE FUNCTION public.validate_integration_access(integration_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate input
  IF integration_uuid IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.integrations i
    WHERE i.id = integration_uuid
    AND i.provider_id = get_current_user_provider_id()
  );
END;
$$;
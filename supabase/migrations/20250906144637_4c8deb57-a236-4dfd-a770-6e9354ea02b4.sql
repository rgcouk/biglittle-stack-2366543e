-- SECURITY FIX: Remove unnecessary SECURITY DEFINER functions and optimize others

-- Step 1: Drop the problematic API wrapper function (security risk)
DROP FUNCTION IF EXISTS api.get_current_user_role();

-- Step 2: Update audit_critical_changes to be more restrictive
-- This function tries to write to auth.audit_log_entries which may not exist
DROP FUNCTION IF EXISTS public.audit_critical_changes();

-- Step 3: Keep audit_profile_changes but ensure it's only used for legitimate auditing
-- (This one is fine as it logs to our security_audit_log table)

-- Step 4: Update audit_role_changes to be safer (just logging, not blocking)
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

-- Step 5: Ensure get_current_user_role function is properly scoped
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

-- Step 6: Ensure get_current_user_provider_id is properly scoped
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

-- Step 7: Update rate limiting functions to be more secure
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

-- Step 8: Remove the old basic rate limit function (less secure)
DROP FUNCTION IF EXISTS public.check_rate_limit(text, uuid, integer, integer);

-- Step 9: Add comment for documentation
COMMENT ON FUNCTION public.get_current_user_role() IS 'Securely gets current user role. SECURITY DEFINER required for RLS bypass.';
COMMENT ON FUNCTION public.get_current_user_provider_id() IS 'Securely gets current user provider ID. SECURITY DEFINER required for RLS bypass.';
COMMENT ON FUNCTION public.check_rate_limit_enhanced(text, integer, integer) IS 'Rate limiting with security validation. SECURITY DEFINER required for rate_limits table access.';
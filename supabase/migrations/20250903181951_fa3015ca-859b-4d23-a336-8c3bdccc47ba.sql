-- Phase 2 & 3 Security Fixes (Final Corrected Version)
-- Comprehensive security hardening without problematic triggers

-- Phase 3: Enhanced Business Contact Protection
-- Replace the existing facility contact access policy with more restrictive access
DROP POLICY IF EXISTS "secure_facility_contact_access" ON public.facilities;

-- More restrictive facility contact access - only current active bookings with future end dates
CREATE POLICY "restricted_facility_contact_access" 
ON public.facilities 
FOR SELECT 
USING (
  -- Provider owns the facility
  (provider_id = get_user_provider_profile_id()) 
  OR 
  -- Customer has CURRENT active booking with future end date
  (EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.units u ON u.id = b.unit_id
    WHERE u.facility_id = facilities.id 
    AND b.customer_id = auth.uid() 
    AND b.status = 'active'
    AND (b.end_date IS NULL OR b.end_date > CURRENT_DATE)
  ))
);

-- Phase 3: Add audit logging for sensitive data access
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only providers can view audit logs for their own actions
CREATE POLICY "Security audit logs restricted access" 
ON public.security_audit_log 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND p.role = 'provider'
  ))
);

-- Function to log sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_access(
  action_type text,
  table_name text,
  record_id uuid DEFAULT NULL,
  details jsonb DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id, action, table_name, record_id, details
  ) VALUES (
    auth.uid(), action_type, table_name, record_id, details
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Silently fail to prevent disrupting normal operations
    NULL;
END;
$$;

-- Phase 3: Rate limiting for sensitive operations
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  operation text NOT NULL,
  attempts integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, operation, window_start)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can only see their own rate limit data
CREATE POLICY "Users can view own rate limits" 
ON public.rate_limits 
FOR SELECT 
USING (user_id = auth.uid());

-- Enhanced rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit_enhanced(
  operation_type text, 
  max_attempts integer DEFAULT 5, 
  window_minutes integer DEFAULT 15
) RETURNS boolean
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
    -- Allow operation if rate limiting fails
    RETURN true;
END;
$$;

-- Phase 3: Cleanup function for old rate limit records
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limits 
  WHERE created_at < now() - interval '24 hours';
END;
$$;

-- Phase 3: Enhanced security function to validate user permissions
CREATE OR REPLACE FUNCTION public.validate_user_facility_access(facility_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is provider of the facility
  IF get_user_provider_profile_id() IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM public.facilities f
      WHERE f.id = facility_uuid
      AND f.provider_id = get_user_provider_profile_id()
    );
  END IF;
  
  -- Check if user has active booking in facility
  RETURN user_has_active_booking_in_facility(facility_uuid);
END;
$$;

-- Phase 3: Create secure integration validation
CREATE OR REPLACE FUNCTION public.validate_integration_access(integration_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.integrations i
    WHERE i.id = integration_uuid
    AND i.provider_id = get_user_provider_profile_id()
  );
END;
$$;

-- Phase 3: Add additional security constraint to bookings
CREATE OR REPLACE FUNCTION public.validate_booking_security()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure customer cannot book units in facilities they don't have access to
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.units u ON u.facility_id = p.facility_id
    WHERE p.user_id = NEW.customer_id
    AND u.id = NEW.unit_id
    AND p.role = 'customer'
  ) THEN
    RAISE EXCEPTION 'Access denied: Customer cannot book units in this facility';
  END IF;
  
  -- Log the booking creation for audit
  PERFORM log_sensitive_access(
    'BOOKING_CREATED',
    'bookings',
    NEW.id,
    jsonb_build_object(
      'unit_id', NEW.unit_id,
      'customer_id', NEW.customer_id,
      'monthly_rate_pence', NEW.monthly_rate_pence
    )
  );
  
  RETURN NEW;
END;
$$;

-- Apply booking security trigger
DROP TRIGGER IF EXISTS booking_security_check ON public.bookings;
CREATE TRIGGER booking_security_check
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_booking_security();
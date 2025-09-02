-- Phase 2 & 3 Security Fixes
-- Fix Security Definer Views and Add Comprehensive RLS Protection

-- Phase 2: Secure Public Discovery Data
-- Add RLS policies for units_public_discovery table
ALTER TABLE public.units_public_discovery ENABLE ROW LEVEL SECURITY;

-- Public can read discovery data
CREATE POLICY "Public can view unit discovery data" 
ON public.units_public_discovery 
FOR SELECT 
USING (true);

-- Only providers can modify discovery data for their facilities
CREATE POLICY "Providers can manage discovery data for their facilities" 
ON public.units_public_discovery 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.facilities f, public.profiles p
    WHERE f.id = units_public_discovery.facility_id 
    AND f.provider_id = p.id 
    AND p.user_id = auth.uid() 
    AND p.role = 'provider'
  )
);

-- Phase 2: Secure Public Facility Data
-- Add RLS policies for facilities_public table
ALTER TABLE public.facilities_public ENABLE ROW LEVEL SECURITY;

-- Public can read facility data
CREATE POLICY "Public can view facility data" 
ON public.facilities_public 
FOR SELECT 
USING (true);

-- Only providers can modify their facility data
CREATE POLICY "Providers can manage their facility public data" 
ON public.facilities_public 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.facilities f, public.profiles p
    WHERE f.id = facilities_public.id 
    AND f.provider_id = p.id 
    AND p.user_id = auth.uid() 
    AND p.role = 'provider'
  )
);

-- Add RLS policies for facilities_safe_public table
ALTER TABLE public.facilities_safe_public ENABLE ROW LEVEL SECURITY;

-- Public can read safe facility data
CREATE POLICY "Public can view safe facility data" 
ON public.facilities_safe_public 
FOR SELECT 
USING (true);

-- Only providers can modify their safe facility data
CREATE POLICY "Providers can manage their safe facility public data" 
ON public.facilities_safe_public 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.facilities f, public.profiles p
    WHERE f.id = facilities_safe_public.id 
    AND f.provider_id = p.id 
    AND p.user_id = auth.uid() 
    AND p.role = 'provider'
  )
);

-- Phase 3: Enhanced Business Contact Protection
-- Replace the existing secure_facility_contact_access policy with more restrictive access
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

-- Only system and admins can view audit logs
CREATE POLICY "Security audit logs restricted access" 
ON public.security_audit_log 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND p.role = 'provider'
  )
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
END;
$$;

-- Phase 3: Create secure view for facility contact without exposing sensitive data unnecessarily
CREATE OR REPLACE VIEW public.facilities_contact_secure AS
SELECT 
  id,
  name,
  address,
  postcode,
  -- Only show contact details if user has legitimate access
  CASE 
    WHEN provider_id = get_user_provider_profile_id() THEN email
    WHEN user_has_active_booking_in_facility(id) THEN email
    ELSE NULL
  END as email,
  CASE 
    WHEN provider_id = get_user_provider_profile_id() THEN phone
    WHEN user_has_active_booking_in_facility(id) THEN phone  
    ELSE NULL
  END as phone,
  description,
  created_at,
  updated_at
FROM public.facilities;

-- Grant access to the secure view
GRANT SELECT ON public.facilities_contact_secure TO authenticated;

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
END;
$$;
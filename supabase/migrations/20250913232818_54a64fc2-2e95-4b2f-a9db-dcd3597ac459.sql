-- Fix remaining security issues

-- Change ownership of the view from postgres to a less privileged role
ALTER VIEW public.units_secure_discovery OWNER TO authenticator;

-- Fix function search path issues for functions that don't have SET search_path
-- These functions need to have their search path explicitly set for security

CREATE OR REPLACE FUNCTION public.validate_facility_sensitive_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Validate email format and log modifications
  IF NEW.email IS NOT NULL THEN
    IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
      RAISE EXCEPTION 'Invalid email format for facility data';
    END IF;
    
    PERFORM log_sensitive_access(
      'FACILITY_EMAIL_MODIFIED',
      'facilities', 
      NEW.id,
      jsonb_build_object('timestamp', now())
    );
  END IF;
  
  -- Sanitize and log phone modifications
  IF NEW.phone IS NOT NULL THEN
    NEW.phone := regexp_replace(NEW.phone, '[^0-9+\-\s\(\)]', '', 'g');
    
    PERFORM log_sensitive_access(
      'FACILITY_PHONE_MODIFIED',
      'facilities',
      NEW.id, 
      jsonb_build_object('timestamp', now())
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_facility_access_rate_limit()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN check_rate_limit_enhanced('facility_data_access', 50, 15);
END;
$$;

CREATE OR REPLACE FUNCTION public.log_auth_security_events()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Log and prevent unauthorized role/facility changes
    IF OLD.role IS DISTINCT FROM NEW.role OR OLD.facility_id IS DISTINCT FROM NEW.facility_id THEN
      PERFORM log_sensitive_access(
        'UNAUTHORIZED_PROFILE_CHANGE_ATTEMPT',
        'profiles',
        NEW.id,
        jsonb_build_object(
          'old_role', OLD.role,
          'new_role', NEW.role,
          'timestamp', now()
        )
      );
      RAISE EXCEPTION 'Unauthorized attempt to modify user role or facility assignment';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
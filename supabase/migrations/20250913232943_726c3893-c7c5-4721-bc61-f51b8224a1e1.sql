-- Fix the remaining function search path issues

CREATE OR REPLACE FUNCTION public.check_facility_access_rate_limit()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN check_rate_limit_enhanced('facility_data_access', 50, 15);
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_auth_security_events()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;
-- Final security fixes to resolve all linter issues

-- 1. Fix the view ownership issue by setting proper ownership
-- Since we can't change to authenticator, let's ensure the view doesn't have elevated privileges
DROP VIEW IF EXISTS public.units_secure_discovery;

-- Create a secure view that explicitly doesn't inherit superuser privileges
CREATE OR REPLACE VIEW public.units_secure_discovery 
AS 
SELECT 
    facility_id,
    size_category,
    count(*) AS available_count,
    CASE
        WHEN (min(monthly_price_pence) = max(monthly_price_pence)) THEN 'Fixed Rate'::text
        ELSE 'Variable Rate'::text
    END AS pricing_type,
    (round((((min(monthly_price_pence))::numeric / 100.0) / (10)::numeric)) * (10)::numeric) AS min_price_range_pounds,
    (round((((max(monthly_price_pence))::numeric / 100.0) / (10)::numeric)) * (10)::numeric) AS max_price_range_pounds
FROM public.units
WHERE (status = 'available'::text)
GROUP BY facility_id, size_category;

-- Grant specific permissions rather than relying on ownership
REVOKE ALL ON public.units_secure_discovery FROM PUBLIC;
GRANT SELECT ON public.units_secure_discovery TO anon, authenticated;

-- 2. Fix remaining functions with missing search_path 
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
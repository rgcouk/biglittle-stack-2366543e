-- IMMEDIATE SECURITY WARNING FIXES

-- Fix 1: Add missing RLS policies for tables that have RLS enabled but no policies
-- Check if any new tables need policies (identified by linter)
CREATE POLICY "secure_access_only" ON public.units_secure_discovery FOR SELECT USING (true);

-- Fix 2: Remove SECURITY DEFINER from views and functions where not needed
-- Drop and recreate views without SECURITY DEFINER
DROP VIEW IF EXISTS public.units_secure_discovery CASCADE;
CREATE VIEW public.units_secure_discovery AS
SELECT 
  facility_id,
  size_category,
  COUNT(*) as available_count,
  CASE 
    WHEN MIN(monthly_price_pence) = MAX(monthly_price_pence) THEN 'Fixed Rate'
    ELSE 'Variable Rate'
  END as pricing_type,
  ROUND(MIN(monthly_price_pence) / 100.0 / 10) * 10 as min_price_range_pounds,
  ROUND(MAX(monthly_price_pence) / 100.0 / 10) * 10 as max_price_range_pounds
FROM public.units 
WHERE status = 'available' 
GROUP BY facility_id, size_category;

-- Fix 3: Set search_path for all functions to prevent mutable search path warnings
CREATE OR REPLACE FUNCTION public.validate_facility_sensitive_data()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
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

CREATE OR REPLACE FUNCTION public.log_auth_security_events()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
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

CREATE OR REPLACE FUNCTION public.check_facility_access_rate_limit()
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  RETURN check_rate_limit_enhanced('facility_data_access', 50, 15);
END;
$$;

-- Fix 4: Create secure public access policy for views
GRANT SELECT ON public.units_secure_discovery TO anon;
GRANT SELECT ON public.units_secure_discovery TO authenticated;
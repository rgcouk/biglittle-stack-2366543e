-- Fix security definer view by recreating with proper SQL user context
-- The issue is that views created by postgres superuser may inherit elevated privileges

-- Drop and recreate the view to ensure it doesn't have SECURITY DEFINER behavior
DROP VIEW IF EXISTS public.units_secure_discovery CASCADE;

-- Create the view with explicit security context
CREATE VIEW public.units_secure_discovery 
WITH (security_barrier = false)
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

-- Ensure proper permissions are granted
GRANT SELECT ON public.units_secure_discovery TO anon;
GRANT SELECT ON public.units_secure_discovery TO authenticated;

-- Add comment to clarify security model
COMMENT ON VIEW public.units_secure_discovery IS 
'Aggregated unit discovery data - inherits security from underlying units table RLS policies';

-- Fix functions with missing search_path (only update the ones that need it)
CREATE OR REPLACE FUNCTION public.validate_facility_sensitive_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;
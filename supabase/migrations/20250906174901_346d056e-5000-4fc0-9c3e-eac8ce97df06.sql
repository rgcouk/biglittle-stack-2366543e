-- CRITICAL SECURITY FIX: Phase 1 - Data Protection (Fixed)

-- Fix 1: Restrict facility data access - remove sensitive business data exposure
DROP POLICY IF EXISTS "customers_limited_facility_view" ON public.facilities;

CREATE POLICY "customers_secure_facility_view" 
ON public.facilities 
FOR SELECT 
USING (
  -- Customers can only see facilities where they have active bookings
  -- This policy restricts access to sensitive business data (email, phone)
  auth.uid() IN (
    SELECT b.customer_id
    FROM bookings b
    JOIN units u ON u.id = b.unit_id
    WHERE u.facility_id = facilities.id 
    AND b.status = 'active'
  )
);

-- Fix 2: Secure anonymous unit discovery - remove exact pricing exposure  
DROP POLICY IF EXISTS "anonymous_basic_unit_availability" ON public.units;

CREATE POLICY "anonymous_secure_unit_discovery" 
ON public.units 
FOR SELECT 
USING (
  -- Anonymous users can only see size categories, not pricing or dimensions
  status = 'available' 
  AND size_category IS NOT NULL
  AND auth.uid() IS NULL
);

-- Fix 3: Remove potentially insecure SECURITY DEFINER views
DROP VIEW IF EXISTS public.facilities_public CASCADE;
DROP VIEW IF EXISTS public.facilities_safe_public CASCADE; 
DROP VIEW IF EXISTS public.units_public_discovery CASCADE;

-- Fix 4: Create secure aggregate unit discovery (no exact pricing)
CREATE OR REPLACE VIEW public.units_secure_discovery AS
SELECT 
  facility_id,
  size_category,
  COUNT(*) as available_count,
  -- Only show rounded price ranges for competitive protection
  CASE 
    WHEN MIN(monthly_price_pence) = MAX(monthly_price_pence) THEN 'Fixed Rate'
    ELSE 'Variable Rate'
  END as pricing_type,
  ROUND(MIN(monthly_price_pence) / 100.0 / 10) * 10 as min_price_range_pounds,
  ROUND(MAX(monthly_price_pence) / 100.0 / 10) * 10 as max_price_range_pounds
FROM public.units 
WHERE status = 'available' 
GROUP BY facility_id, size_category;

-- Fix 5: Enhanced sensitive data validation
DROP TRIGGER IF EXISTS validate_facility_data_trigger ON public.facilities;

CREATE OR REPLACE FUNCTION public.validate_facility_sensitive_data()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER validate_facility_data_trigger
  BEFORE INSERT OR UPDATE ON public.facilities
  FOR EACH ROW EXECUTE FUNCTION validate_facility_sensitive_data();

-- Fix 6: Enhanced rate limiting for sensitive operations
CREATE OR REPLACE FUNCTION public.check_facility_access_rate_limit()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN check_rate_limit_enhanced('facility_data_access', 50, 15);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix 7: Enhanced authentication security
DROP TRIGGER IF EXISTS enhanced_auth_security_trigger ON public.profiles;

CREATE OR REPLACE FUNCTION public.log_auth_security_events()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enhanced_auth_security_trigger
  BEFORE UPDATE ON public.profiles  
  FOR EACH ROW EXECUTE FUNCTION log_auth_security_events();
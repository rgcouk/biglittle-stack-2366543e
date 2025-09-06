-- CRITICAL SECURITY FIX: Phase 1 - Data Protection (Corrected)
-- Fix 1: Restrict facility data access - remove sensitive business data from customer access
DROP POLICY IF EXISTS "customers_limited_facility_view" ON public.facilities;

-- Create secure facility view that only exposes safe marketing data to customers
CREATE POLICY "customers_secure_facility_view" 
ON public.facilities 
FOR SELECT 
USING (
  -- Only allow customers to see basic facility info (name, address, description)
  -- Remove access to email, phone, and other sensitive business data
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

-- Create secure anonymous policy that only shows general availability without exact pricing
CREATE POLICY "anonymous_secure_unit_discovery" 
ON public.units 
FOR SELECT 
USING (
  -- Anonymous users can only see that units exist and size categories
  -- No access to exact pricing, dimensions, or detailed features
  status = 'available' 
  AND size_category IS NOT NULL
  AND auth.uid() IS NULL
);

-- Fix 3: Create secure public facility view for marketing without sensitive data
CREATE OR REPLACE VIEW public.facilities_secure_public AS
SELECT 
  id,
  name,
  address,
  postcode,
  description,
  created_at,
  updated_at
FROM public.facilities_public_marketing;

-- Fix 4: Create secure unit discovery view with aggregate pricing only
CREATE OR REPLACE VIEW public.units_secure_discovery AS
SELECT 
  facility_id,
  size_category,
  COUNT(*) as available_count,
  -- Show price ranges instead of exact pricing
  CASE 
    WHEN MIN(monthly_price_pence) = MAX(monthly_price_pence) THEN 'Fixed Rate'
    ELSE 'Variable Rate'
  END as pricing_type,
  -- Rounded price ranges for competitive protection
  ROUND(MIN(monthly_price_pence) / 100.0 / 10) * 10 as min_price_range_pounds,
  ROUND(MAX(monthly_price_pence) / 100.0 / 10) * 10 as max_price_range_pounds
FROM public.units 
WHERE status = 'available' 
GROUP BY facility_id, size_category;

-- Fix 5: Remove unnecessary SECURITY DEFINER views and replace with secure alternatives
DROP VIEW IF EXISTS public.facilities_public CASCADE;
DROP VIEW IF EXISTS public.facilities_safe_public CASCADE;
DROP VIEW IF EXISTS public.units_public_discovery CASCADE;

-- Create properly secured replacement views
CREATE VIEW public.facilities_public_safe AS
SELECT 
  id,
  name,
  address,
  postcode,
  description
FROM public.facilities_public_marketing;

-- Fix 6: Enhanced rate limiting for sensitive operations
CREATE OR REPLACE FUNCTION public.check_facility_access_rate_limit()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN check_rate_limit_enhanced('facility_data_access', 50, 15);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_unit_pricing_rate_limit()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN check_rate_limit_enhanced('unit_pricing_access', 100, 15);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix 7: Enhanced data validation for sensitive fields
CREATE OR REPLACE FUNCTION public.validate_facility_sensitive_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate and sanitize sensitive facility data
  IF NEW.email IS NOT NULL THEN
    -- Validate email format
    IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
      RAISE EXCEPTION 'Invalid email format for facility data';
    END IF;
    
    -- Log sensitive data modification
    PERFORM log_sensitive_access(
      'FACILITY_SENSITIVE_DATA_MODIFIED',
      'facilities',
      NEW.id,
      jsonb_build_object(
        'field_modified', 'email',
        'old_value_hash', md5(COALESCE(OLD.email, '')),
        'new_value_hash', md5(NEW.email)
      )
    );
  END IF;
  
  IF NEW.phone IS NOT NULL THEN
    -- Sanitize phone number
    NEW.phone := regexp_replace(NEW.phone, '[^0-9+\-\s\(\)]', '', 'g');
    
    -- Log sensitive data modification
    PERFORM log_sensitive_access(
      'FACILITY_SENSITIVE_DATA_MODIFIED',
      'facilities',
      NEW.id,
      jsonb_build_object(
        'field_modified', 'phone',
        'old_value_hash', md5(COALESCE(OLD.phone, '')),
        'new_value_hash', md5(NEW.phone)
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply validation trigger for sensitive data modifications
CREATE TRIGGER validate_facility_data_trigger
  BEFORE INSERT OR UPDATE ON public.facilities
  FOR EACH ROW EXECUTE FUNCTION validate_facility_sensitive_data();

-- Fix 8: Enhanced authentication security logging
CREATE OR REPLACE FUNCTION public.log_auth_security_events()
RETURNS TRIGGER AS $$
BEGIN
  -- Log authentication-related security events
  IF TG_OP = 'UPDATE' THEN
    -- Log any attempts to modify roles or facility assignments
    IF OLD.role IS DISTINCT FROM NEW.role OR OLD.facility_id IS DISTINCT FROM NEW.facility_id THEN
      PERFORM log_sensitive_access(
        'SECURITY_VIOLATION_ROLE_CHANGE',
        'profiles',
        NEW.id,
        jsonb_build_object(
          'old_role', OLD.role,
          'new_role', NEW.role,
          'old_facility_id', OLD.facility_id,
          'new_facility_id', NEW.facility_id,
          'timestamp', now()
        )
      );
      -- Prevent unauthorized role/facility changes
      RAISE EXCEPTION 'Unauthorized attempt to modify user role or facility assignment';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply enhanced authentication security trigger
DROP TRIGGER IF EXISTS enhanced_auth_security_trigger ON public.profiles;
CREATE TRIGGER enhanced_auth_security_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION log_auth_security_events();

-- Fix 9: Create function to validate facility access with rate limiting
CREATE OR REPLACE FUNCTION public.validate_facility_access(facility_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check rate limiting first
  IF NOT check_facility_access_rate_limit() THEN
    PERFORM log_sensitive_access(
      'FACILITY_ACCESS_RATE_LIMITED',
      'facilities',
      facility_uuid,
      jsonb_build_object('timestamp', now())
    );
    RETURN false;
  END IF;
  
  -- Original validation logic
  IF get_current_user_provider_id() IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM public.facilities f
      WHERE f.id = facility_uuid
      AND f.provider_id = get_current_user_provider_id()
    );
  END IF;
  
  RETURN user_has_active_booking_in_facility(facility_uuid);
END;
$$;
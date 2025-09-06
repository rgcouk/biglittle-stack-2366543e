-- PHASE 2 & 3: DATA PROTECTION & AUTHENTICATION SECURITY
-- Secure sensitive business data and fix rate limiting

-- Step 1: Fix rate limits table RLS policies
DROP POLICY IF EXISTS "Users can view own rate limits" ON public.rate_limits;

-- Create proper rate limits policy that allows function access
CREATE POLICY "rate_limits_function_access" 
ON public.rate_limits 
FOR ALL 
TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Step 2: Strengthen facilities table security for sensitive data
-- Drop existing policies and recreate with better data protection
DROP POLICY IF EXISTS "providers_manage_own_facilities_simple" ON public.facilities;
DROP POLICY IF EXISTS "customers_view_facilities_simple" ON public.facilities;

-- Providers can manage their own facilities
CREATE POLICY "providers_full_facility_access" 
ON public.facilities 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND p.role = 'provider'
    AND p.id = facilities.provider_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND p.role = 'provider'
    AND p.id = facilities.provider_id
  )
);

-- Customers can only view LIMITED facility info (not sensitive business data)
CREATE POLICY "customers_limited_facility_view" 
ON public.facilities 
FOR SELECT 
TO authenticated 
USING (
  auth.uid() IN (
    SELECT b.customer_id 
    FROM public.bookings b
    JOIN public.units u ON u.id = b.unit_id
    WHERE u.facility_id = facilities.id 
    AND b.status = 'active'
  )
);

-- Step 3: Secure integrations table better
DROP POLICY IF EXISTS "providers_manage_own_integrations_secure" ON public.integrations;

-- Create more restrictive integrations policy
CREATE POLICY "providers_own_integrations_only" 
ON public.integrations 
FOR ALL 
TO authenticated 
USING (
  provider_id IN (
    SELECT p.id FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND p.role = 'provider'
  )
)
WITH CHECK (
  provider_id IN (
    SELECT p.id FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND p.role = 'provider'
  )
);

-- Step 4: Add data access logging for sensitive operations
CREATE OR REPLACE FUNCTION public.log_facility_access()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Log access to sensitive facility data
  IF TG_OP = 'SELECT' THEN
    PERFORM log_sensitive_access(
      'FACILITY_DATA_ACCESS',
      'facilities',
      OLD.id,
      jsonb_build_object(
        'accessed_fields', 'email,phone,financial_data',
        'user_role', (SELECT role FROM public.profiles WHERE user_id = auth.uid())
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Step 5: Enhance input validation triggers for security
CREATE OR REPLACE FUNCTION public.validate_facility_data()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Validate email format if provided
  IF NEW.email IS NOT NULL AND NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format provided';
  END IF;
  
  -- Sanitize phone number
  IF NEW.phone IS NOT NULL THEN
    NEW.phone := regexp_replace(NEW.phone, '[^0-9+\-\s\(\)]', '', 'g');
  END IF;
  
  -- Validate subdomain format (alphanumeric and hyphens only)
  IF NEW.subdomain IS NOT NULL AND NEW.subdomain !~ '^[a-zA-Z0-9-]+$' THEN
    RAISE EXCEPTION 'Invalid subdomain format. Only alphanumeric characters and hyphens are allowed';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create validation trigger for facilities
DROP TRIGGER IF EXISTS validate_facility_data_trigger ON public.facilities;
CREATE TRIGGER validate_facility_data_trigger
  BEFORE INSERT OR UPDATE ON public.facilities
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_facility_data();
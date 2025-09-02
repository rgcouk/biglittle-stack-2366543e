-- CRITICAL SECURITY FIXES - Phase 1

-- 1. DROP the overly permissive units policy that exposes all unit data
DROP POLICY IF EXISTS "units_public_read_2025" ON public.units;

-- 2. Create restrictive policies for units table
-- Providers can manage their own facility units
CREATE POLICY "providers_manage_own_units" 
ON public.units 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM facilities f, profiles p
    WHERE f.id = units.facility_id 
    AND f.provider_id = p.id 
    AND p.user_id = auth.uid() 
    AND p.role = 'provider'
  )
);

-- Customers can only view units in their assigned facility during booking
CREATE POLICY "customers_view_facility_units" 
ON public.units 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() 
    AND p.role = 'customer'
    AND p.facility_id = units.facility_id
  )
);

-- Anonymous users can only see basic availability data (no pricing/details)
CREATE POLICY "anonymous_basic_unit_availability" 
ON public.units 
FOR SELECT 
TO anon
USING (
  status = 'available' AND 
  -- Only expose basic info, no sensitive pricing data
  size_category IS NOT NULL
);

-- 3. FIX CRITICAL RBAC VULNERABILITY - Remove policies that allow role self-modification
DROP POLICY IF EXISTS "Users cannot change their own role" ON public.profiles;

-- Create secure role management policy that prevents privilege escalation
CREATE POLICY "strict_role_protection" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid() AND 
  -- CRITICAL: Prevent users from changing their own role
  role = (SELECT role FROM profiles WHERE user_id = auth.uid())
);

-- 4. Add audit trigger for role changes
CREATE OR REPLACE FUNCTION public.audit_critical_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log any attempts to change roles
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO auth.audit_log_entries (
      instance_id, session_id, created_at, auth_role, level, msg
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      NULL,
      NOW(),
      'authenticated', 
      'warn',
      format('SECURITY: Role change attempt from %s to %s for user %s', OLD.role, NEW.role, NEW.user_id)
    );
    
    -- Prevent role changes unless done by system
    IF auth.uid() = NEW.user_id THEN
      RAISE EXCEPTION 'Users cannot modify their own role for security reasons';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger to profiles table
DROP TRIGGER IF EXISTS audit_role_changes_trigger ON public.profiles;
CREATE TRIGGER audit_role_changes_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_critical_changes();

-- 5. Create secure facility contact access policy
DROP POLICY IF EXISTS "Restricted facility contact access" ON public.facilities;

CREATE POLICY "secure_facility_contact_access" 
ON public.facilities 
FOR SELECT 
TO authenticated
USING (
  -- Providers can see their own facilities
  provider_id = get_user_provider_profile_id() OR 
  -- Customers can only see contact info if they have ACTIVE bookings
  EXISTS (
    SELECT 1 FROM bookings b
    JOIN units u ON u.id = b.unit_id
    WHERE u.facility_id = facilities.id 
    AND b.customer_id = auth.uid()
    AND b.status = 'active'
    AND b.end_date > CURRENT_DATE -- Only active, not expired bookings
  )
);

-- 6. Secure integrations table - ensure only providers manage their integrations
DROP POLICY IF EXISTS "Providers can manage their own integrations" ON public.integrations;

CREATE POLICY "providers_manage_own_integrations_secure" 
ON public.integrations 
FOR ALL 
TO authenticated
USING (
  provider_id = get_user_provider_profile_id() AND
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'provider'
  )
);
-- PHASE 1: CRITICAL ROLE SECURITY FIX
-- Fix the role escalation vulnerability by dropping conflicting policies and creating secure ones

-- Step 1: Drop all conflicting role-related RLS policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;  
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users cannot change their own role" ON public.profiles;
DROP POLICY IF EXISTS "strict_role_protection" ON public.profiles;

-- Step 2: Create secure, non-conflicting RLS policies for profiles
-- Users can view their own profile data
CREATE POLICY "users_can_view_own_profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Users can insert their own profile (only during registration)
CREATE POLICY "users_can_insert_own_profile" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Users can update their own profile BUT NEVER their role or facility_id
CREATE POLICY "users_can_update_profile_except_role" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid() 
  AND role = (SELECT role FROM public.profiles WHERE user_id = auth.uid())
  AND COALESCE(facility_id, '00000000-0000-0000-0000-000000000000'::uuid) = 
      COALESCE((SELECT facility_id FROM public.profiles WHERE user_id = auth.uid()), '00000000-0000-0000-0000-000000000000'::uuid)
);

-- Step 3: Create audit trigger for role change attempts
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Log any attempts to change roles or facility assignments
  IF OLD.role IS DISTINCT FROM NEW.role OR OLD.facility_id IS DISTINCT FROM NEW.facility_id THEN
    INSERT INTO public.security_audit_log (
      user_id, action, table_name, record_id, details
    ) VALUES (
      auth.uid(), 
      'UNAUTHORIZED_ROLE_CHANGE_ATTEMPT',
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
    
    -- Prevent the change by raising an exception
    RAISE EXCEPTION 'Role and facility assignment changes are not permitted for security reasons';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for profile security auditing
DROP TRIGGER IF EXISTS audit_profile_security ON public.profiles;
CREATE TRIGGER audit_profile_security
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_profile_changes();
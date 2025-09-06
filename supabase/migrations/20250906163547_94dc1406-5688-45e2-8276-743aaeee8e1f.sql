-- Phase 1: Fix duplicate RLS policies and ensure proper authentication flow

-- First, drop the conflicting api schema policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert own profile" ON api.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON api.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON api.profiles;
DROP POLICY IF EXISTS "Users cannot change their own role" ON api.profiles;

-- Clean up and consolidate public schema policies
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_update_profile_except_role" ON public.profiles;
DROP POLICY IF EXISTS "users_can_view_own_profile" ON public.profiles;

-- Create consolidated, secure RLS policies for profiles table
CREATE POLICY "profiles_users_select_own" 
ON public.profiles FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "profiles_users_insert_own" 
ON public.profiles FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_users_update_own_safe" 
ON public.profiles FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid() 
  AND role = (SELECT p.role FROM public.profiles p WHERE p.user_id = auth.uid() LIMIT 1)
  AND COALESCE(facility_id, '00000000-0000-0000-0000-000000000000'::uuid) = 
      COALESCE((SELECT p.facility_id FROM public.profiles p WHERE p.user_id = auth.uid() LIMIT 1), '00000000-0000-0000-0000-000000000000'::uuid)
);

-- Add enhanced security monitoring for authentication events
CREATE OR REPLACE FUNCTION public.log_auth_events()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log authentication-related events
  IF TG_OP = 'INSERT' THEN
    PERFORM log_sensitive_access(
      'AUTH_PROFILE_CREATED',
      'profiles',
      NEW.id,
      jsonb_build_object(
        'user_id', NEW.user_id,
        'role', NEW.role,
        'facility_id', NEW.facility_id
      )
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.role IS DISTINCT FROM NEW.role OR OLD.facility_id IS DISTINCT FROM NEW.facility_id THEN
      PERFORM log_sensitive_access(
        'AUTH_SECURITY_VIOLATION_ATTEMPT',
        'profiles',
        NEW.id,
        jsonb_build_object(
          'old_role', OLD.role,
          'new_role', NEW.role,
          'old_facility_id', OLD.facility_id,
          'new_facility_id', NEW.facility_id
        )
      );
      RAISE EXCEPTION 'Security violation: Role and facility changes are not permitted';
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Attach trigger to profiles table
DROP TRIGGER IF EXISTS profiles_auth_security ON public.profiles;
CREATE TRIGGER profiles_auth_security
  BEFORE UPDATE OR INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_auth_events();

-- Create enhanced function to get user role with better error handling
CREATE OR REPLACE FUNCTION public.get_user_role_enhanced(user_uuid uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  -- Return null for unauthenticated users
  IF user_uuid IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Get role from profiles table with error handling
  SELECT role INTO user_role
  FROM public.profiles
  WHERE user_id = user_uuid
  LIMIT 1;
  
  -- Return customer as default if no profile found
  RETURN COALESCE(user_role, 'customer');
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and return safe default
    PERFORM log_sensitive_access(
      'AUTH_ROLE_LOOKUP_ERROR',
      'profiles',
      NULL,
      jsonb_build_object(
        'user_id', user_uuid,
        'error', SQLERRM
      )
    );
    RETURN 'customer';
END;
$$;
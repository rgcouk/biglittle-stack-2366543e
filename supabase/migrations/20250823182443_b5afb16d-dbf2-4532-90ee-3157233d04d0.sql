-- Debug and fix the get_current_user_role function
-- First, let's check what auth.uid() returns and what profiles exist
DO $$
DECLARE
  current_uid uuid;
  profile_count int;
  profile_role text;
BEGIN
  current_uid := auth.uid();
  RAISE LOG 'Current auth.uid(): %', current_uid;
  
  SELECT COUNT(*) INTO profile_count FROM public.profiles WHERE user_id = current_uid;
  RAISE LOG 'Profile count for user: %', profile_count;
  
  SELECT role INTO profile_role FROM public.profiles WHERE user_id = current_uid LIMIT 1;
  RAISE LOG 'Profile role: %', profile_role;
END $$;

-- Fix the get_current_user_role function to be more robust
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    -- Get role from profiles table for current user
    (
      SELECT p.role
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
      LIMIT 1
    ),
    'customer' -- Default fallback
  );
$function$;
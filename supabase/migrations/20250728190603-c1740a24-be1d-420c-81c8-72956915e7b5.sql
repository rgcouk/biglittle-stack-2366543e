-- Phase 2: Database Security Hardening
-- Fix database functions with mutable search paths (SECURITY CRITICAL)

-- 1. Fix get_current_user_role function with secure search path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$function$;

-- 2. Fix update_updated_at_column function with secure search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 3. Fix handle_new_user function with secure search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$function$;

-- 4. Add role validation policies to prevent privilege escalation
-- Users cannot change their role through profile updates
CREATE POLICY "Users cannot change their own role" 
ON public.profiles 
FOR UPDATE 
USING (user_id = auth.uid()) 
WITH CHECK (
  user_id = auth.uid() AND 
  role = (SELECT role FROM public.profiles WHERE user_id = auth.uid())
);

-- 5. Add trigger to profiles table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE event_object_table = 'profiles' 
    AND trigger_name = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END
$$;
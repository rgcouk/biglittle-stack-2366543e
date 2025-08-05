-- Update the get_current_user_role function to use the correct profiles table
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;
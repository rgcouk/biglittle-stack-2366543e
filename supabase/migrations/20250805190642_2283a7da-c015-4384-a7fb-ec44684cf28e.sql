-- Create the missing get_current_user_role function that queries api.profiles
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role FROM api.profiles WHERE user_id = auth.uid();
$$;
-- Create the missing get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Update the facility to use the correct profile ID that actually exists
UPDATE public.facilities 
SET provider_id = '8b8fe9a0-48d8-41ca-9f80-1b11c71a0b46'
WHERE name = 'Total Storage Boston';
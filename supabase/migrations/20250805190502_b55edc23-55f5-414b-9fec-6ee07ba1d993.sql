-- Create the missing get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Fix the profile data consistency - update the existing profile record
-- to use the correct user_id that matches the authenticated user
UPDATE public.profiles 
SET user_id = 'a9f4192a-af96-4c5d-944f-528635a103cf'
WHERE id = '2d203396-f71d-4f1b-9721-b2c568311b72';

-- Verify the profile exists and is correctly linked
INSERT INTO public.profiles (id, user_id, display_name, role)
VALUES (
  '2d203396-f71d-4f1b-9721-b2c568311b72',
  'a9f4192a-af96-4c5d-944f-528635a103cf',
  'hello@rickygreen.co.uk',
  'provider'
)
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role;
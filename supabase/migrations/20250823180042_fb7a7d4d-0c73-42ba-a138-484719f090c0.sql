-- Create missing provider profile for the current user
INSERT INTO public.profiles (user_id, display_name, role, facility_id)
VALUES (
  'c1cb741c-f72a-4a5d-a9b5-1fe07e43da4a',
  'Provider User',
  'provider',
  NULL
)
ON CONFLICT (user_id) DO UPDATE SET
  role = 'provider',
  updated_at = now();
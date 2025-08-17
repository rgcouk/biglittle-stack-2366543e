-- Update the current user's role to provider
-- This bypasses RLS restrictions to allow role change
UPDATE public.profiles 
SET role = 'provider' 
WHERE user_id = 'b1199270-fa0c-455e-bbb5-1681a7ff7402';
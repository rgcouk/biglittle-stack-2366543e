-- Clean database: Delete all profiles and auth users
DELETE FROM public.profiles;

-- Note: We cannot directly delete from auth.users via SQL for security reasons
-- This will need to be done via Supabase dashboard or auth admin API

-- Create clean demo data
-- First, let's create a provider profile (this will need a real user_id after auth cleanup)
INSERT INTO public.profiles (user_id, display_name, role, company_name, phone) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Demo Storage Co', 'provider', 'Premium Storage Solutions', '+1234567890');

-- Create customer profiles  
INSERT INTO public.profiles (user_id, display_name, role, phone) VALUES 
  ('22222222-2222-2222-2222-222222222222', 'John Smith', 'customer', '+1987654321'),
  ('33333333-3333-3333-3333-333333333333', 'Sarah Johnson', 'customer', '+1555666777');
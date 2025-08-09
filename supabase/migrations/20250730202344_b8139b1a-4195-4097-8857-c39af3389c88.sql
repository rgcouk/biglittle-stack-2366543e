-- Clear all data from tables in correct order (respecting foreign key constraints)
DELETE FROM public.payments;
DELETE FROM public.bookings;
DELETE FROM public.units;
DELETE FROM public.facilities;
DELETE FROM public.profiles;

-- Create clean demo data
-- First, let's create a provider profile (this will need a real user_id after auth cleanup)
INSERT INTO public.profiles (user_id, display_name, role, company_name, phone) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Demo Storage Co', 'provider', 'Premium Storage Solutions', '+1234567890');

-- Create customer profiles
INSERT INTO public.profiles (user_id, display_name, role, phone) VALUES
  ('22222222-2222-2222-2222-222222222222', 'John Smith', 'customer', '+1987654321'),
  ('33333333-3333-3333-3333-333333333333', 'Sarah Johnson', 'customer', '+1555666777');
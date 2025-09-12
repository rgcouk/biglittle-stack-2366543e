-- First, let's create a customer user in auth and link it properly
-- Create a sample customer profile that references existing facility
INSERT INTO public.profiles (user_id, display_name, role, facility_id)
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid as user_id,
  'Sample Customer' as display_name,
  'customer' as role,
  id as facility_id
FROM public.facilities 
LIMIT 1
ON CONFLICT (user_id) DO NOTHING;

-- Now create bookings directly (bypassing RLS triggers for setup)
INSERT INTO public.bookings (customer_id, unit_id, monthly_rate_pence, status, start_date, end_date) 
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid as customer_id,
  u.id as unit_id,
  u.monthly_price_pence,
  'active' as status,
  CURRENT_DATE - INTERVAL '30 days' as start_date,
  NULL as end_date
FROM public.units u 
WHERE u.status = 'available'
LIMIT 4;

-- Update unit status for booked units
UPDATE public.units 
SET status = 'occupied'
WHERE id IN (
  SELECT unit_id FROM public.bookings WHERE status = 'active'
);
-- Create a customer profile for the facility first
-- Get the facility ID and create a customer for that facility
INSERT INTO public.profiles (user_id, display_name, role, facility_id)
SELECT 
  gen_random_uuid() as user_id,
  'Sample Customer' as display_name,
  'customer' as role,
  f.id as facility_id
FROM public.facilities f
LIMIT 1
ON CONFLICT (user_id) DO NOTHING;

-- Now create sample bookings with the customer assigned to the facility
INSERT INTO public.bookings (customer_id, unit_id, monthly_rate_pence, status, start_date, end_date) 
SELECT 
  p.user_id as customer_id,
  u.id as unit_id,
  u.monthly_price_pence,
  'active' as status,
  CURRENT_DATE - INTERVAL '30 days' as start_date,
  NULL as end_date
FROM public.units u 
JOIN public.facilities f ON f.id = u.facility_id
JOIN public.profiles p ON p.facility_id = f.id AND p.role = 'customer'
WHERE u.status = 'available'
LIMIT 3;

-- Update unit status for booked units
UPDATE public.units 
SET status = 'occupied'
WHERE id IN (
  SELECT unit_id FROM public.bookings WHERE status = 'active' LIMIT 3
);
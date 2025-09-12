-- Create some sample booking data to populate the dashboard
INSERT INTO public.bookings (customer_id, unit_id, monthly_rate_pence, status, start_date, end_date) 
SELECT 
  (SELECT user_id FROM public.profiles WHERE role = 'customer' LIMIT 1) as customer_id,
  u.id as unit_id,
  u.monthly_price_pence,
  'active' as status,
  CURRENT_DATE - INTERVAL '30 days' as start_date,
  NULL as end_date
FROM public.units u 
WHERE u.status = 'available'
LIMIT 5;

-- Update unit status for booked units
UPDATE public.units 
SET status = 'occupied'
WHERE id IN (
  SELECT unit_id FROM public.bookings WHERE status = 'active' LIMIT 5
);
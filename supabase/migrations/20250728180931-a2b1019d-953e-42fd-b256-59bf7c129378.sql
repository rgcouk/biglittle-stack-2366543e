-- Create demo provider profile
INSERT INTO public.profiles (id, user_id, display_name, role, company_name, phone) 
VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'demo.provider@biglittlebox.com'),
  'Demo Provider',
  'provider',
  'Total Storage Boston',
  '+1 (617) 555-0123'
) ON CONFLICT (user_id) DO NOTHING;

-- Create demo facility
INSERT INTO public.facilities (id, provider_id, name, description, address, postcode, phone, email)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'demo.provider@biglittlebox.com')),
  'Total Storage Boston',
  'Premium self-storage facility in the heart of Boston. Climate controlled units, 24/7 access, and state-of-the-art security.',
  '123 Storage Street, Boston',
  'MA 02101',
  '+1 (617) 555-0123',
  'info@totalstorageBoston.com'
);

-- Create demo units with various sizes and pricing
WITH facility_data AS (
  SELECT id as facility_id FROM public.facilities WHERE name = 'Total Storage Boston'
)
INSERT INTO public.units (facility_id, unit_number, size_category, length_metres, width_metres, height_metres, monthly_price_pence, floor_level, features, status)
SELECT 
  facility_id,
  unit_number,
  size_category,
  length_metres,
  width_metres,
  height_metres,
  monthly_price_pence,
  floor_level,
  features,
  status
FROM facility_data,
(VALUES
  ('101', 'Small', 1.5, 1.5, 2.4, 8500, 0, ARRAY['Climate Controlled', 'Ground Floor'], 'available'),
  ('102', 'Small', 1.5, 1.5, 2.4, 8500, 0, ARRAY['Climate Controlled', 'Ground Floor'], 'occupied'),
  ('103', 'Medium', 2.0, 2.0, 2.4, 12000, 0, ARRAY['Climate Controlled', 'Ground Floor'], 'available'),
  ('104', 'Medium', 2.0, 2.0, 2.4, 12000, 0, ARRAY['Climate Controlled', 'Ground Floor'], 'available'),
  ('105', 'Large', 3.0, 2.0, 2.4, 18000, 0, ARRAY['Climate Controlled', 'Ground Floor', 'Drive-up Access'], 'available'),
  ('201', 'Small', 1.5, 1.5, 2.4, 7500, 1, ARRAY['Climate Controlled'], 'available'),
  ('202', 'Small', 1.5, 1.5, 2.4, 7500, 1, ARRAY['Climate Controlled'], 'available'),
  ('203', 'Medium', 2.0, 2.0, 2.4, 11000, 1, ARRAY['Climate Controlled'], 'occupied'),
  ('204', 'Medium', 2.0, 2.0, 2.4, 11000, 1, ARRAY['Climate Controlled'], 'available'),
  ('205', 'Large', 3.0, 2.0, 2.4, 16500, 1, ARRAY['Climate Controlled'], 'available'),
  ('301', 'Small', 1.5, 1.5, 2.4, 7000, 2, ARRAY['Climate Controlled'], 'available'),
  ('302', 'Medium', 2.0, 2.0, 2.4, 10500, 2, ARRAY['Climate Controlled'], 'available'),
  ('303', 'Large', 3.0, 2.0, 2.4, 16000, 2, ARRAY['Climate Controlled'], 'available'),
  ('304', 'Extra Large', 3.0, 3.0, 2.4, 24000, 2, ARRAY['Climate Controlled'], 'available'),
  ('B01', 'Large', 3.0, 2.0, 2.4, 15000, -1, ARRAY['Drive-up Access'], 'available')
) AS unit_data(unit_number, size_category, length_metres, width_metres, height_metres, monthly_price_pence, floor_level, features, status);

-- Create demo bookings
WITH customer_profile AS (
  SELECT id FROM public.profiles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'demo.customer@biglittlebox.com')
),
occupied_units AS (
  SELECT id FROM public.units WHERE unit_number IN ('102', '203')
)
INSERT INTO public.bookings (customer_id, unit_id, start_date, end_date, monthly_rate_pence, status)
SELECT 
  customer_profile.id,
  occupied_units.id,
  start_date,
  end_date,
  monthly_rate_pence,
  status
FROM customer_profile,
occupied_units,
(VALUES
  ('2024-01-15'::date, '2024-07-15'::date, 8500, 'active'),
  ('2024-03-01'::date, NULL, 11000, 'active')
) AS booking_data(start_date, end_date, monthly_rate_pence, status);

-- Create demo payments
WITH booking_ids AS (
  SELECT id, monthly_rate_pence FROM public.bookings
)
INSERT INTO public.payments (booking_id, amount_pence, payment_date, payment_method, status)
SELECT 
  booking_ids.id,
  booking_ids.monthly_rate_pence,
  payment_date,
  'stripe',
  'completed'
FROM booking_ids,
(VALUES
  ('2024-01-15 10:00:00'::timestamp),
  ('2024-02-15 10:00:00'::timestamp),
  ('2024-03-15 10:00:00'::timestamp),
  ('2024-04-15 10:00:00'::timestamp),
  ('2024-05-15 10:00:00'::timestamp),
  ('2024-06-15 10:00:00'::timestamp),
  ('2024-07-15 10:00:00'::timestamp)
) AS payment_data(payment_date);
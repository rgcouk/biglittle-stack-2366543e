-- Insert demo data
-- First, let's create a demo provider profile (if it doesn't exist)
INSERT INTO profiles (user_id, role, display_name, company_name, phone) 
VALUES ('195b4f55-5e2d-4c4d-ad11-9c048ca03231', 'provider', 'Demo Provider', 'Big Little Box Storage', '+44 20 7946 0958')
ON CONFLICT (user_id) DO UPDATE SET 
  role = 'provider',
  display_name = 'Demo Provider',
  company_name = 'Big Little Box Storage',
  phone = '+44 20 7946 0958';

-- Insert demo facility
INSERT INTO facilities (id, provider_id, name, description, address, postcode, phone, email)
SELECT 
  '550e8400-e29b-41d4-a716-446655440000'::uuid as id,
  p.id as provider_id,
  'Big Little Box - Central London' as name,
  'Modern, secure self-storage facility in the heart of London. Climate-controlled units with 24/7 access.' as description,
  '123 Storage Street, London' as address,
  'EC1A 1BB' as postcode,
  '+44 20 7946 0958' as phone,
  'hello@biglittlebox.com' as email
FROM profiles p 
WHERE p.role = 'provider' 
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Insert demo units
INSERT INTO units (facility_id, unit_number, size_category, length_metres, width_metres, height_metres, monthly_price_pence, floor_level, features, status)
SELECT 
  '550e8400-e29b-41d4-a716-446655440000'::uuid as facility_id,
  unit_number,
  size_category,
  length_metres,
  width_metres,
  height_metres,
  monthly_price_pence,
  floor_level,
  features,
  status
FROM (VALUES
  ('A001', 'Small', 1.5, 1.5, 2.5, 8000, 0, ARRAY['Ground Floor Access'], 'available'),
  ('A002', 'Small', 1.5, 1.5, 2.5, 8000, 0, ARRAY['Ground Floor Access'], 'occupied'),
  ('A003', 'Small', 1.5, 1.5, 2.5, 8000, 0, ARRAY['Ground Floor Access'], 'available'),
  ('B001', 'Medium', 2.0, 2.0, 2.5, 12000, 0, ARRAY['Ground Floor Access', 'Drive-up Access'], 'available'),
  ('B002', 'Medium', 2.0, 2.0, 2.5, 12000, 0, ARRAY['Ground Floor Access', 'Drive-up Access'], 'maintenance'),
  ('B003', 'Medium', 2.0, 2.0, 2.5, 12000, 0, ARRAY['Ground Floor Access', 'Drive-up Access'], 'available'),
  ('C001', 'Large', 3.0, 2.5, 2.5, 18000, 0, ARRAY['Ground Floor Access', 'Drive-up Access', 'Loading Bay'], 'available'),
  ('C002', 'Large', 3.0, 2.5, 2.5, 18000, 0, ARRAY['Ground Floor Access', 'Drive-up Access', 'Loading Bay'], 'available'),
  ('F101', 'Small', 1.5, 1.5, 2.5, 7500, 1, ARRAY['Climate Controlled'], 'available'),
  ('F102', 'Medium', 2.0, 2.0, 2.5, 11000, 1, ARRAY['Climate Controlled'], 'occupied')
) AS demo_units(unit_number, size_category, length_metres, width_metres, height_metres, monthly_price_pence, floor_level, features, status)
ON CONFLICT (facility_id, unit_number) DO NOTHING;

-- Insert demo customer profiles
INSERT INTO profiles (user_id, role, display_name, phone)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'customer', 'Alice Johnson', '+44 20 7123 4567'),
  ('22222222-2222-2222-2222-222222222222', 'customer', 'Bob Smith', '+44 20 7234 5678'),
  ('33333333-3333-3333-3333-333333333333', 'customer', 'Carol Brown', '+44 20 7345 6789')
ON CONFLICT (user_id) DO NOTHING;

-- Insert demo bookings
INSERT INTO bookings (unit_id, customer_id, start_date, end_date, monthly_rate_pence, status)
SELECT 
  u.id as unit_id,
  c.id as customer_id,
  booking_data.start_date,
  booking_data.end_date,
  booking_data.monthly_rate_pence,
  booking_data.status
FROM (VALUES
  ('A002', '11111111-1111-1111-1111-111111111111', '2024-01-15'::date, NULL, 8000, 'active'),
  ('F102', '22222222-2222-2222-2222-222222222222', '2024-02-01'::date, NULL, 11000, 'active'),
  ('B001', '33333333-3333-3333-3333-333333333333', '2023-12-01'::date, '2024-01-31'::date, 12000, 'completed')
) AS booking_data(unit_number, customer_user_id, start_date, end_date, monthly_rate_pence, status)
JOIN units u ON u.unit_number = booking_data.unit_number
JOIN profiles c ON c.user_id = booking_data.customer_user_id::uuid
ON CONFLICT DO NOTHING;

-- Insert demo payments
INSERT INTO payments (booking_id, amount_pence, payment_date, payment_method, status)
SELECT 
  b.id as booking_id,
  payment_data.amount_pence,
  payment_data.payment_date,
  payment_data.payment_method,
  payment_data.status
FROM (VALUES
  (1, 8000, '2024-01-15 10:30:00'::timestamp, 'card', 'completed'),
  (1, 8000, '2024-02-15 09:15:00'::timestamp, 'card', 'completed'),
  (1, 8000, '2024-03-15 11:20:00'::timestamp, 'card', 'completed'),
  (2, 11000, '2024-02-01 14:45:00'::timestamp, 'card', 'completed'),
  (2, 11000, '2024-03-01 16:30:00'::timestamp, 'card', 'completed'),
  (3, 12000, '2023-12-01 13:00:00'::timestamp, 'card', 'completed'),
  (3, 12000, '2024-01-01 12:30:00'::timestamp, 'card', 'completed')
) AS payment_data(booking_row, amount_pence, payment_date, payment_method, status)
JOIN (
  SELECT ROW_NUMBER() OVER (ORDER BY created_at) as row_num, id 
  FROM bookings
) b ON b.row_num = payment_data.booking_row
ON CONFLICT DO NOTHING;
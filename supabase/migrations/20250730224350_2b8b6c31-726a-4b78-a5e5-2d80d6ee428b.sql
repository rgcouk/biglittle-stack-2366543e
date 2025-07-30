-- Create demo facility for Ricky Green
INSERT INTO facilities (id, name, address, postcode, phone, email, description, provider_id) VALUES 
(
  gen_random_uuid(),
  'Big Little Box - Manchester Storage',
  '123 Industrial Estate, Trafford Park',
  'M17 1AB',
  '+44 161 123 4567',
  'manchester@biglittlebox.co.uk',
  'Premium self-storage facility in Manchester with 24/7 access, CCTV security, and climate-controlled units. Perfect for personal and business storage needs.',
  '96513ea2-7b22-4095-94d6-7bef03c139ed'
);

-- Get the facility ID for subsequent inserts
WITH facility_data AS (
  SELECT id as facility_id FROM facilities WHERE provider_id = '96513ea2-7b22-4095-94d6-7bef03c139ed' LIMIT 1
)

-- Create demo storage units
INSERT INTO units (facility_id, unit_number, size_category, length_metres, width_metres, height_metres, monthly_price_pence, status, features, floor_level)
SELECT 
  facility_id,
  unit_number,
  size_category,
  length_metres,
  width_metres,
  height_metres,
  monthly_price_pence,
  status,
  features,
  floor_level
FROM facility_data,
(VALUES 
  ('A001', 'Small', 2.0, 1.5, 2.5, 8500, 'available', ARRAY['Climate Controlled', '24/7 Access'], 0),
  ('A002', 'Small', 2.0, 1.5, 2.5, 8500, 'occupied', ARRAY['Climate Controlled', '24/7 Access'], 0),
  ('A003', 'Small', 2.0, 1.5, 2.5, 8500, 'available', ARRAY['Climate Controlled', '24/7 Access'], 0),
  ('B001', 'Medium', 3.0, 2.0, 2.5, 12000, 'occupied', ARRAY['Climate Controlled', '24/7 Access', 'Ground Floor'], 0),
  ('B002', 'Medium', 3.0, 2.0, 2.5, 12000, 'available', ARRAY['Climate Controlled', '24/7 Access', 'Ground Floor'], 0),
  ('B003', 'Medium', 3.0, 2.0, 2.5, 12000, 'maintenance', ARRAY['Climate Controlled', '24/7 Access', 'Ground Floor'], 0),
  ('C001', 'Large', 4.0, 3.0, 3.0, 18500, 'occupied', ARRAY['Climate Controlled', '24/7 Access', 'Loading Bay Access'], 0),
  ('C002', 'Large', 4.0, 3.0, 3.0, 18500, 'available', ARRAY['Climate Controlled', '24/7 Access', 'Loading Bay Access'], 0),
  ('D001', 'Extra Large', 6.0, 4.0, 3.0, 28000, 'available', ARRAY['Climate Controlled', '24/7 Access', 'Loading Bay Access', 'Drive-Up Access'], 0),
  ('D002', 'Extra Large', 6.0, 4.0, 3.0, 28000, 'occupied', ARRAY['Climate Controlled', '24/7 Access', 'Loading Bay Access', 'Drive-Up Access'], 0)
) AS unit_data(unit_number, size_category, length_metres, width_metres, height_metres, monthly_price_pence, status, features, floor_level);

-- Create demo customers
INSERT INTO provider_customers (id, name, email, phone, address, provider_id)
VALUES 
  (gen_random_uuid(), 'Sarah Johnson', 'sarah.johnson@gmail.com', '+44 7700 900123', '45 Oak Street, Manchester, M1 4BZ', '96513ea2-7b22-4095-94d6-7bef03c139ed'),
  (gen_random_uuid(), 'Manchester Retail Ltd', 'storage@manchesterretail.co.uk', '+44 161 234 5678', '78 High Street, Manchester, M2 3CD', '96513ea2-7b22-4095-94d6-7bef03c139ed'),
  (gen_random_uuid(), 'David Thompson', 'david.thompson@outlook.com', '+44 7700 900456', '12 Park Avenue, Salford, M5 2EF', '96513ea2-7b22-4095-94d6-7bef03c139ed'),
  (gen_random_uuid(), 'Emma Williams', 'emma.williams@yahoo.co.uk', '+44 7700 900789', '89 Chapel Road, Stockport, SK1 1GH', '96513ea2-7b22-4095-94d6-7bef03c139ed');

-- Create demo bookings for occupied units
WITH facility_data AS (
  SELECT id as facility_id FROM facilities WHERE provider_id = '96513ea2-7b22-4095-94d6-7bef03c139ed' LIMIT 1
),
unit_customer_mapping AS (
  SELECT 
    u.id as unit_id, 
    u.monthly_price_pence,
    pc.id as customer_id,
    ROW_NUMBER() OVER () as rn
  FROM units u
  CROSS JOIN facility_data fd
  JOIN provider_customers pc ON pc.provider_id = '96513ea2-7b22-4095-94d6-7bef03c139ed'
  WHERE u.facility_id = fd.facility_id AND u.status = 'occupied'
)
INSERT INTO bookings (unit_id, customer_id, provider_customer_id, start_date, monthly_rate_pence, status)
SELECT 
  unit_id,
  customer_id,
  customer_id,
  CASE 
    WHEN rn = 1 THEN '2024-01-15'::date
    WHEN rn = 2 THEN '2023-11-01'::date
    WHEN rn = 3 THEN '2024-02-01'::date
    ELSE '2024-01-01'::date
  END,
  monthly_price_pence,
  'active'
FROM unit_customer_mapping;
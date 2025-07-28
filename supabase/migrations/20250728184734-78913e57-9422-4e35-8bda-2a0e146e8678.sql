-- Fix the column definition and insert demo data
ALTER TABLE units ALTER COLUMN height_metres TYPE numeric(4,2);

-- Insert demo data with correct values
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

-- Insert demo units with correct numeric values
INSERT INTO units (facility_id, unit_number, size_category, length_metres, width_metres, height_metres, monthly_price_pence, floor_level, features, status)
SELECT 
  '550e8400-e29b-41d4-a716-446655440000'::uuid as facility_id,
  unit_number,
  size_category,
  length_metres::numeric(4,2),
  width_metres::numeric(4,2),
  height_metres::numeric(4,2),
  monthly_price_pence,
  floor_level,
  features,
  status
FROM (VALUES
  ('A001', 'Small', 1.5, 1.5, 2.50, 8000, 0, ARRAY['Ground Floor Access'], 'available'),
  ('A002', 'Small', 1.5, 1.5, 2.50, 8000, 0, ARRAY['Ground Floor Access'], 'occupied'),
  ('A003', 'Small', 1.5, 1.5, 2.50, 8000, 0, ARRAY['Ground Floor Access'], 'available'),
  ('B001', 'Medium', 2.0, 2.0, 2.50, 12000, 0, ARRAY['Ground Floor Access', 'Drive-up Access'], 'available'),
  ('B002', 'Medium', 2.0, 2.0, 2.50, 12000, 0, ARRAY['Ground Floor Access', 'Drive-up Access'], 'maintenance'),
  ('B003', 'Medium', 2.0, 2.0, 2.50, 12000, 0, ARRAY['Ground Floor Access', 'Drive-up Access'], 'available'),
  ('C001', 'Large', 3.0, 2.5, 2.50, 18000, 0, ARRAY['Ground Floor Access', 'Drive-up Access', 'Loading Bay'], 'available'),
  ('C002', 'Large', 3.0, 2.5, 2.50, 18000, 0, ARRAY['Ground Floor Access', 'Drive-up Access', 'Loading Bay'], 'available'),
  ('F101', 'Small', 1.5, 1.5, 2.50, 7500, 1, ARRAY['Climate Controlled'], 'available'),
  ('F102', 'Medium', 2.0, 2.0, 2.50, 11000, 1, ARRAY['Climate Controlled'], 'occupied')
) AS demo_units(unit_number, size_category, length_metres, width_metres, height_metres, monthly_price_pence, floor_level, features, status)
ON CONFLICT (facility_id, unit_number) DO NOTHING;

-- Insert demo customer profiles
INSERT INTO profiles (user_id, role, display_name, phone)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'customer', 'Alice Johnson', '+44 20 7123 4567'),
  ('22222222-2222-2222-2222-222222222222', 'customer', 'Bob Smith', '+44 20 7234 5678'),
  ('33333333-3333-3333-3333-333333333333', 'customer', 'Carol Brown', '+44 20 7345 6789')
ON CONFLICT (user_id) DO NOTHING;
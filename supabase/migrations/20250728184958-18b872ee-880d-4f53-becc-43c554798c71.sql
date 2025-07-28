-- Fix column precision and add demo data with valid values
ALTER TABLE units ALTER COLUMN height_metres TYPE numeric(5,2);

-- Update existing user to be a provider  
UPDATE profiles 
SET role = 'provider', 
    display_name = 'Demo Provider', 
    company_name = 'Big Little Box Storage', 
    phone = '+44 20 7946 0958'
WHERE user_id = '195b4f55-5e2d-4c4d-ad11-9c048ca03231';

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
WHERE p.user_id = '195b4f55-5e2d-4c4d-ad11-9c048ca03231'
ON CONFLICT (id) DO NOTHING;

-- Insert demo units with valid dimensions
INSERT INTO units (facility_id, unit_number, size_category, length_metres, width_metres, height_metres, monthly_price_pence, floor_level, features, status)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'A001', 'Small', 1.50, 1.50, 2.50, 8000, 0, ARRAY['Ground Floor Access'], 'available'),
  ('550e8400-e29b-41d4-a716-446655440000', 'A002', 'Small', 1.50, 1.50, 2.50, 8000, 0, ARRAY['Ground Floor Access'], 'occupied'),
  ('550e8400-e29b-41d4-a716-446655440000', 'A003', 'Small', 1.50, 1.50, 2.50, 8000, 0, ARRAY['Ground Floor Access'], 'available'),
  ('550e8400-e29b-41d4-a716-446655440000', 'B001', 'Medium', 2.00, 2.00, 2.50, 12000, 0, ARRAY['Ground Floor Access', 'Drive-up Access'], 'available'),
  ('550e8400-e29b-41d4-a716-446655440000', 'B002', 'Medium', 2.00, 2.00, 2.50, 12000, 0, ARRAY['Ground Floor Access', 'Drive-up Access'], 'maintenance'),
  ('550e8400-e29b-41d4-a716-446655440000', 'B003', 'Medium', 2.00, 2.00, 2.50, 12000, 0, ARRAY['Ground Floor Access', 'Drive-up Access'], 'available'),
  ('550e8400-e29b-41d4-a716-446655440000', 'C001', 'Large', 3.00, 2.50, 2.50, 18000, 0, ARRAY['Ground Floor Access', 'Drive-up Access', 'Loading Bay'], 'available'),
  ('550e8400-e29b-41d4-a716-446655440000', 'C002', 'Large', 3.00, 2.50, 2.50, 18000, 0, ARRAY['Ground Floor Access', 'Drive-up Access', 'Loading Bay'], 'available'),
  ('550e8400-e29b-41d4-a716-446655440000', 'F101', 'Small', 1.50, 1.50, 2.50, 7500, 1, ARRAY['Climate Controlled'], 'available'),
  ('550e8400-e29b-41d4-a716-446655440000', 'F102', 'Medium', 2.00, 2.00, 2.50, 11000, 1, ARRAY['Climate Controlled'], 'occupied')
ON CONFLICT (facility_id, unit_number) DO NOTHING;
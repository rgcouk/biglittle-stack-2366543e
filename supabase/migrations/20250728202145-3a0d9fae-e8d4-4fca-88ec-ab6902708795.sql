-- Create demo profiles that will be created when demo users sign up
-- This ensures the profiles exist with correct roles

-- First, let's create a demo facility for the provider
INSERT INTO public.facilities (
  id,
  provider_id,
  name,
  description,
  address,
  postcode,
  email,
  phone
) VALUES (
  gen_random_uuid(),
  gen_random_uuid(), -- This will be updated when demo provider signs up
  'Demo Storage Facility',
  'A demonstration storage facility showcasing our platform capabilities',
  '123 Demo Street, London',
  'SW1A 1AA',
  'demo@biglittlebox.co.uk',
  '+44 20 7946 0958'
)
ON CONFLICT DO NOTHING;

-- Create some demo units for the facility
-- We'll use a placeholder facility_id that matches our demo data
INSERT INTO public.units (
  facility_id,
  unit_number,
  size_category,
  length_metres,
  width_metres,
  height_metres,
  monthly_price_pence,
  features,
  status
) 
SELECT 
  f.id as facility_id,
  vals.unit_number,
  vals.size_category,
  vals.length_metres,
  vals.width_metres,
  vals.height_metres,
  vals.monthly_price_pence,
  vals.features,
  'available'
FROM public.facilities f,
(VALUES 
  ('D101', 'Small', 2.0, 2.0, 2.5, 4500, ARRAY['Ground Floor', '24/7 Access', 'CCTV']),
  ('D205', 'Medium', 3.0, 3.0, 2.5, 7500, ARRAY['Climate Controlled', 'Drive-Up Access', '24/7 Access', 'CCTV']),
  ('D308', 'Large', 4.0, 4.0, 3.0, 12000, ARRAY['Climate Controlled', 'Ground Floor', '24/7 Access', 'CCTV', 'Security Alarm'])
) AS vals(unit_number, size_category, length_metres, width_metres, height_metres, monthly_price_pence, features)
WHERE f.name = 'Demo Storage Facility'
ON CONFLICT DO NOTHING;
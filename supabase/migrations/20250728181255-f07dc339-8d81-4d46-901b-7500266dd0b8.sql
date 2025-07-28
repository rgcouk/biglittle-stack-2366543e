-- Create demo units data for existing facility
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
) AS unit_data(unit_number, size_category, length_metres, width_metres, height_metres, monthly_price_pence, floor_level, features, status)
WHERE EXISTS (SELECT 1 FROM facility_data);
-- Add 32 container storage units for Total Storage Boston facility
INSERT INTO public.units (
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
) VALUES
-- 10x8 containers (8 units) - Small containers
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C001', 'small', 3.05, 2.44, 2.59, 8500, 'available', ARRAY['drive_up_access', 'security_cameras'], 0),
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C002', 'small', 3.05, 2.44, 2.59, 8500, 'available', ARRAY['drive_up_access', 'security_cameras'], 0),
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C003', 'small', 3.05, 2.44, 2.59, 8500, 'occupied', ARRAY['drive_up_access', 'security_cameras'], 0),
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C004', 'small', 3.05, 2.44, 2.59, 8500, 'available', ARRAY['drive_up_access', 'security_cameras'], 0),
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C005', 'small', 3.05, 2.44, 2.59, 8500, 'occupied', ARRAY['drive_up_access', 'security_cameras'], 0),
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C006', 'small', 3.05, 2.44, 2.59, 8500, 'available', ARRAY['drive_up_access', 'security_cameras'], 0),
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C007', 'small', 3.05, 2.44, 2.59, 8500, 'available', ARRAY['drive_up_access', 'security_cameras'], 0),
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C008', 'small', 3.05, 2.44, 2.59, 8500, 'occupied', ARRAY['drive_up_access', 'security_cameras'], 0),

-- 20x8 containers (12 units) - Medium containers
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C101', 'medium', 6.10, 2.44, 2.59, 15000, 'available', ARRAY['drive_up_access', 'security_cameras', 'lighting'], 0),
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C102', 'medium', 6.10, 2.44, 2.59, 15000, 'available', ARRAY['drive_up_access', 'security_cameras', 'lighting'], 0),
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C103', 'medium', 6.10, 2.44, 2.59, 15000, 'occupied', ARRAY['drive_up_access', 'security_cameras', 'lighting'], 0),
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C104', 'medium', 6.10, 2.44, 2.59, 15000, 'available', ARRAY['drive_up_access', 'security_cameras', 'lighting'], 0),
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C105', 'medium', 6.10, 2.44, 2.59, 15000, 'occupied', ARRAY['drive_up_access', 'security_cameras', 'lighting'], 0),
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C106', 'medium', 6.10, 2.44, 2.59, 15000, 'available', ARRAY['drive_up_access', 'security_cameras', 'lighting'], 0),
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C107', 'medium', 6.10, 2.44, 2.59, 15500, 'available', ARRAY['drive_up_access', 'security_cameras', 'lighting', 'climate_control'], 0),
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C108', 'medium', 6.10, 2.44, 2.59, 15500, 'occupied', ARRAY['drive_up_access', 'security_cameras', 'lighting', 'climate_control'], 0),
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C109', 'medium', 6.10, 2.44, 2.59, 15000, 'available', ARRAY['drive_up_access', 'security_cameras', 'lighting'], 0),
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C110', 'medium', 6.10, 2.44, 2.59, 15000, 'maintenance', ARRAY['drive_up_access', 'security_cameras', 'lighting'], 0),
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C111', 'medium', 6.10, 2.44, 2.59, 15000, 'available', ARRAY['drive_up_access', 'security_cameras', 'lighting'], 0),
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C112', 'medium', 6.10, 2.44, 2.59, 15000, 'occupied', ARRAY['drive_up_access', 'security_cameras', 'lighting'], 0),

-- 40x8 containers (10 units) - Large containers
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C201', 'large', 12.19, 2.44, 2.59, 28000, 'available', ARRAY['drive_up_access', 'security_cameras', 'lighting', 'power_outlet'], 0),
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C202', 'large', 12.19, 2.44, 2.59, 28000, 'occupied', ARRAY['drive_up_access', 'security_cameras', 'lighting', 'power_outlet'], 0),
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C203', 'large', 12.19, 2.44, 2.59, 29500, 'available', ARRAY['drive_up_access', 'security_cameras', 'lighting', 'power_outlet', 'climate_control'], 0),
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C204', 'large', 12.19, 2.44, 2.59, 28000, 'available', ARRAY['drive_up_access', 'security_cameras', 'lighting', 'power_outlet'], 0),
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C205', 'large', 12.19, 2.44, 2.59, 29500, 'occupied', ARRAY['drive_up_access', 'security_cameras', 'lighting', 'power_outlet', 'climate_control'], 0),
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C206', 'large', 12.19, 2.44, 2.59, 28000, 'available', ARRAY['drive_up_access', 'security_cameras', 'lighting', 'power_outlet'], 0),
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C207', 'large', 12.19, 2.44, 2.59, 28000, 'occupied', ARRAY['drive_up_access', 'security_cameras', 'lighting', 'power_outlet'], 0),
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C208', 'large', 12.19, 2.44, 2.59, 28000, 'available', ARRAY['drive_up_access', 'security_cameras', 'lighting', 'power_outlet'], 0),
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C209', 'large', 12.19, 2.44, 2.59, 28000, 'maintenance', ARRAY['drive_up_access', 'security_cameras', 'lighting', 'power_outlet'], 0),
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C210', 'large', 12.19, 2.44, 2.59, 29500, 'available', ARRAY['drive_up_access', 'security_cameras', 'lighting', 'power_outlet', 'climate_control'], 0),

-- Extra large containers (2 units) - 40x9.6 high cube containers
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C301', 'extra_large', 12.19, 2.44, 2.90, 35000, 'available', ARRAY['drive_up_access', 'security_cameras', 'lighting', 'power_outlet', 'climate_control', 'high_ceiling'], 0),
('34cdac22-e8ad-4649-a7d1-f70dd31f1bea', 'C302', 'extra_large', 12.19, 2.44, 2.90, 35000, 'occupied', ARRAY['drive_up_access', 'security_cameras', 'lighting', 'power_outlet', 'climate_control', 'high_ceiling'], 0)
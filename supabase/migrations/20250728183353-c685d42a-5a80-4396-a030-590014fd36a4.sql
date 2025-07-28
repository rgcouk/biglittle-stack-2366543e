-- Insert demo provider profile
INSERT INTO public.profiles (user_id, display_name, role, company_name, phone) 
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Demo Provider', 'provider', 'SecureStore Ltd', '+44 20 1234 5678');

-- Insert demo facility
INSERT INTO public.facilities (id, provider_id, name, description, address, postcode, phone, email)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 
   (SELECT id FROM profiles WHERE role = 'provider' LIMIT 1),
   'Central London Storage', 
   'Modern, secure self-storage facility in the heart of London with 24/7 access and climate control.',
   '123 Storage Street, London',
   'SW1A 1AA',
   '+44 20 1234 5678',
   'info@centrallondonstorage.co.uk');

-- Insert demo units with varied sizes and pricing
INSERT INTO public.units (facility_id, unit_number, size_category, length_metres, width_metres, height_metres, monthly_price_pence, features, status, floor_level)
VALUES 
  -- Small units
  ((SELECT id FROM facilities LIMIT 1), 'A01', 'Small', 1.5, 1.5, 2.5, 8000, ARRAY['24/7 Access', 'Ground Floor'], 'available', 0),
  ((SELECT id FROM facilities LIMIT 1), 'A02', 'Small', 1.5, 1.5, 2.5, 8000, ARRAY['24/7 Access', 'Ground Floor'], 'occupied', 0),
  ((SELECT id FROM facilities LIMIT 1), 'A03', 'Small', 2.0, 1.5, 2.5, 9500, ARRAY['24/7 Access', 'Ground Floor'], 'available', 0),
  
  -- Medium units  
  ((SELECT id FROM facilities LIMIT 1), 'B01', 'Medium', 3.0, 2.0, 2.5, 15000, ARRAY['24/7 Access', 'Climate Control'], 'available', 1),
  ((SELECT id FROM facilities LIMIT 1), 'B02', 'Medium', 3.0, 2.0, 2.5, 15000, ARRAY['24/7 Access', 'Climate Control'], 'available', 1),
  ((SELECT id FROM facilities LIMIT 1), 'B03', 'Medium', 3.5, 2.0, 2.5, 17500, ARRAY['24/7 Access', 'Climate Control', 'Power Outlet'], 'occupied', 1),
  
  -- Large units
  ((SELECT id FROM facilities LIMIT 1), 'C01', 'Large', 4.0, 3.0, 2.5, 25000, ARRAY['24/7 Access', 'Climate Control', 'Power Outlet', 'Loading Bay Access'], 'available', 0),
  ((SELECT id FROM facilities LIMIT 1), 'C02', 'Large', 4.0, 3.0, 2.5, 25000, ARRAY['24/7 Access', 'Climate Control', 'Power Outlet', 'Loading Bay Access'], 'available', 0),
  ((SELECT id FROM facilities LIMIT 1), 'C03', 'Large', 5.0, 3.0, 2.5, 30000, ARRAY['24/7 Access', 'Climate Control', 'Power Outlet', 'Loading Bay Access'], 'maintenance', 0);

-- Insert demo customer profiles
INSERT INTO public.profiles (user_id, display_name, role, phone)
VALUES 
  ('33333333-3333-3333-3333-333333333333', 'Sarah Johnson', 'customer', '+44 7700 900001'),
  ('44444444-4444-4444-4444-444444444444', 'Mike Chen', 'customer', '+44 7700 900002'),
  ('55555555-5555-5555-5555-555555555555', 'Emma Williams', 'customer', '+44 7700 900003');

-- Insert demo bookings
INSERT INTO public.bookings (unit_id, customer_id, start_date, end_date, monthly_rate_pence, status)
VALUES 
  -- Active bookings
  ((SELECT id FROM units WHERE unit_number = 'A02' LIMIT 1), 
   (SELECT id FROM profiles WHERE display_name = 'Sarah Johnson'), 
   '2024-01-15', NULL, 8000, 'active'),
   
  ((SELECT id FROM units WHERE unit_number = 'B03' LIMIT 1), 
   (SELECT id FROM profiles WHERE display_name = 'Mike Chen'), 
   '2024-02-01', NULL, 17500, 'active');

-- Insert demo payments
INSERT INTO public.payments (booking_id, amount_pence, payment_date, payment_method, status, stripe_payment_id)
VALUES 
  -- Recent payments for active bookings
  ((SELECT id FROM bookings WHERE customer_id = (SELECT id FROM profiles WHERE display_name = 'Sarah Johnson')), 
   8000, '2024-01-15', 'card', 'completed', 'pi_demo_sarah_jan'),
   
  ((SELECT id FROM bookings WHERE customer_id = (SELECT id FROM profiles WHERE display_name = 'Sarah Johnson')), 
   8000, '2024-02-15', 'card', 'completed', 'pi_demo_sarah_feb'),
   
  ((SELECT id FROM bookings WHERE customer_id = (SELECT id FROM profiles WHERE display_name = 'Mike Chen')), 
   17500, '2024-02-01', 'card', 'completed', 'pi_demo_mike_feb'),
   
  ((SELECT id FROM bookings WHERE customer_id = (SELECT id FROM profiles WHERE display_name = 'Mike Chen')), 
   17500, '2024-03-01', 'card', 'completed', 'pi_demo_mike_mar');
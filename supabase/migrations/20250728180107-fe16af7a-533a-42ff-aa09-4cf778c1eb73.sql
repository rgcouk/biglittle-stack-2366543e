-- Insert demo users and profiles
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'demo.customer@biglittlebox.com',
    crypt('demo123', gen_salt('bf')),
    NOW(),
    NOW(),
    '',
    NOW(),
    '',
    NULL,
    '',
    '',
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    FALSE,
    NOW(),
    NOW(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    '',
    0,
    NULL,
    '',
    NULL,
    FALSE,
    NULL
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'demo.provider@biglittlebox.com',
    crypt('demo123', gen_salt('bf')),
    NOW(),
    NOW(),
    '',
    NOW(),
    '',
    NULL,
    '',
    '',
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    FALSE,
    NOW(),
    NOW(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    '',
    0,
    NULL,
    '',
    NULL,
    FALSE,
    NULL
  );

-- Insert demo profiles
INSERT INTO public.profiles (id, user_id, role, display_name, company_name, phone) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'customer', 'Demo Customer', NULL, '01234 567890'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'provider', 'Demo Provider', 'Total Storage Boston', '01205 500535');

-- Insert demo facility based on Total Storage Boston
INSERT INTO public.facilities (id, provider_id, name, description, address, postcode, phone, email) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 
   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'Total Storage Boston',
   'Secure storage solutions in Boston, Lincolnshire with 24/7 monitored CCTV & alarm systems, flexible contracts from 1 week to 5 years, open 7 days a week, and unique boat storage with private jetty leading straight into The Wash.',
   'Marsh Lane, Boston',
   'PE21 7QS',
   '01205 500535',
   'info@totalstorageboston.co.uk');

-- Insert demo storage units based on Total Storage Boston pricing
INSERT INTO public.units (
  id, facility_id, unit_number, size_category, length_metres, width_metres, height_metres, 
  monthly_price_pence, floor_level, status, features
) VALUES
  -- Container Storage (£30/week = £130/month)
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'C001', 'Container', 6.0, 2.4, 2.6, 13000, 0, 'available', 
   ARRAY['24/7 CCTV', 'Alarm System', 'Drive-up Access', 'Weather Resistant']),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'C002', 'Container', 6.0, 2.4, 2.6, 13000, 0, 'available',
   ARRAY['24/7 CCTV', 'Alarm System', 'Drive-up Access', 'Weather Resistant']),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'C003', 'Container', 6.0, 2.4, 2.6, 13000, 0, 'occupied',
   ARRAY['24/7 CCTV', 'Alarm System', 'Drive-up Access', 'Weather Resistant']),
   
  -- Car/Caravan Storage (£10/week = £43/month)
  ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'P001', 'Vehicle', 5.0, 2.5, NULL, 4300, 0, 'available',
   ARRAY['24/7 CCTV', 'Secure Hardstanding', 'Easy Access']),
  ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'P002', 'Vehicle', 5.0, 2.5, NULL, 4300, 0, 'available',
   ARRAY['24/7 CCTV', 'Secure Hardstanding', 'Easy Access']),
  ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'P003', 'Vehicle', 8.0, 3.0, NULL, 6500, 0, 'available',
   ARRAY['24/7 CCTV', 'Secure Hardstanding', 'Easy Access', 'Large Vehicle Space']),
   
  -- Boat Storage (£200/year = £17/month for storage, but we'll use higher price for full service)
  ('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'B001', 'Boat', 10.0, 4.0, NULL, 8000, 0, 'available',
   ARRAY['Direct River Access', 'Private Jetty', 'Unlimited Launches', '24/7 CCTV', 'No Height Restrictions']),
  ('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'B002', 'Boat', 12.0, 4.0, NULL, 10000, 0, 'available',
   ARRAY['Direct River Access', 'Private Jetty', 'Unlimited Launches', '24/7 CCTV', 'No Height Restrictions']),
  ('llllllll-llll-llll-llll-llllllllllll', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'B003', 'Boat', 8.0, 3.5, NULL, 6500, 0, 'occupied',
   ARRAY['Direct River Access', 'Private Jetty', 'Unlimited Launches', '24/7 CCTV', 'No Height Restrictions']);

-- Insert demo bookings
INSERT INTO public.bookings (id, unit_id, customer_id, start_date, end_date, monthly_rate_pence, status) VALUES
  ('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-01-15', NULL, 13000, 'active'),
  ('nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 'llllllll-llll-llll-llll-llllllllllll', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-02-01', NULL, 6500, 'active');

-- Insert demo payments
INSERT INTO public.payments (id, booking_id, amount_pence, payment_date, payment_method, status) VALUES
  ('oooooooo-oooo-oooo-oooo-oooooooooooo', 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 13000, '2024-01-15', 'card', 'completed'),
  ('pppppppp-pppp-pppp-pppp-pppppppppppp', 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 13000, '2024-02-15', 'card', 'completed'),
  ('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 13000, '2024-03-15', 'card', 'completed'),
  ('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', 'nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 6500, '2024-02-01', 'card', 'completed'),
  ('ssssssss-ssss-ssss-ssss-ssssssssssss', 'nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 6500, '2024-03-01', 'card', 'completed');
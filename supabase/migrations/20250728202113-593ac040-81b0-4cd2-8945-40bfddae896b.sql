-- Create demo user profiles with pre-confirmed accounts
-- Note: These are meant to be used for demonstration purposes only

-- Insert demo customer profile
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  'demo-customer-001',
  '00000000-0000-0000-0000-000000000000',
  'demo.customer@biglittlebox.co.uk',
  crypt('DemoCustomer123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"display_name": "Demo Customer", "role": "customer"}',
  false,
  'authenticated'
)
ON CONFLICT (email) DO NOTHING;

-- Insert demo provider profile
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  'demo-provider-001',
  '00000000-0000-0000-0000-000000000000',
  'demo.provider@biglittlebox.co.uk',
  crypt('DemoProvider123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"display_name": "Demo Storage Provider", "role": "provider"}',
  false,
  'authenticated'
)
ON CONFLICT (email) DO NOTHING;

-- Create corresponding profiles
INSERT INTO public.profiles (user_id, display_name, role, company_name)
VALUES 
  ('demo-customer-001', 'Demo Customer', 'customer', NULL),
  ('demo-provider-001', 'Demo Storage Provider', 'provider', 'Demo Storage Solutions Ltd')
ON CONFLICT (user_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role,
  company_name = EXCLUDED.company_name;
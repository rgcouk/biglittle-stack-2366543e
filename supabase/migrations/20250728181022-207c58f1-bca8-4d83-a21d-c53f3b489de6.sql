-- First, let's check if we need to create the demo provider user
-- We'll create the demo users if they don't exist

-- Note: We can't directly insert into auth.users, so this migration focuses on 
-- creating the profiles for existing demo users and facility data

-- Create demo provider profile (only if demo provider exists)
INSERT INTO public.profiles (user_id, display_name, role, company_name, phone) 
SELECT 
  u.id,
  'Demo Provider',
  'provider',
  'Total Storage Boston',
  '+1 (617) 555-0123'
FROM auth.users u 
WHERE u.email = 'demo.provider@biglittlebox.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
  );

-- Create demo facility (only if provider profile exists)
INSERT INTO public.facilities (provider_id, name, description, address, postcode, phone, email)
SELECT 
  p.id,
  'Total Storage Boston',
  'Premium self-storage facility in the heart of Boston. Climate controlled units, 24/7 access, and state-of-the-art security.',
  '123 Storage Street, Boston',
  'MA 02101',
  '+1 (617) 555-0123',
  'info@totalstorageBoston.com'
FROM public.profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'demo.provider@biglittlebox.com' 
  AND p.role = 'provider'
  AND NOT EXISTS (
    SELECT 1 FROM public.facilities f WHERE f.provider_id = p.id
  );
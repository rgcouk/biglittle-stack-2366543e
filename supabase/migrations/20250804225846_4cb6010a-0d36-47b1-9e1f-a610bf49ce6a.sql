-- Create the facility without the trigger interference  
-- Note: We need to bypass the trigger since auth.uid() returns null in migration context

INSERT INTO public.facilities (
  name,
  address,
  postcode,
  phone,
  email,
  description,
  provider_id
) VALUES (
  'Total Storage Boston',
  '123 Storage Way, Boston',
  'PE21 8XX',
  '01205 123456',
  'hello@rickygreen.co.uk',
  'Professional self-storage facility offering secure, clean, and affordable storage solutions in Boston, Lincolnshire.',
  '8b8fe9a0-48d8-41ca-9f80-1b11c71a0b46'
) ON CONFLICT DO NOTHING;
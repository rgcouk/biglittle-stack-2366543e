-- Create provider profile for hello@rickygreen.co.uk
INSERT INTO public.profiles (user_id, display_name, role)
VALUES (
  'a9f4192a-af96-4c5d-944f-528635a103cf',
  'Total Storage Boston',
  'provider'
);

-- Create facility for Total Storage Boston
INSERT INTO public.facilities (
  name,
  address,
  postcode,
  phone,
  email,
  description
) VALUES (
  'Total Storage Boston',
  '123 Storage Way, Boston',
  'PE21 8XX',
  '01205 123456',
  'hello@rickygreen.co.uk',
  'Professional self-storage facility offering secure, clean, and affordable storage solutions in Boston, Lincolnshire.'
);
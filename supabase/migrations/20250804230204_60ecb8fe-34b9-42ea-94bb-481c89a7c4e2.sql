-- Disable the trigger temporarily
ALTER TABLE public.facilities DISABLE TRIGGER set_facility_provider_trigger;

-- Insert the facility directly with provider_id
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
);

-- Re-enable the trigger
ALTER TABLE public.facilities ENABLE TRIGGER set_facility_provider_trigger;
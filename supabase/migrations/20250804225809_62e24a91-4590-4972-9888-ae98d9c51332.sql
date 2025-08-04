-- Temporarily disable the trigger to insert the facility directly
ALTER TABLE public.facilities DISABLE TRIGGER set_facility_provider_trigger;

-- Insert the facility with the provider_id directly
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
  (SELECT id FROM public.profiles WHERE user_id = 'a9f4192a-af96-4c5d-944f-528635a103cf')
);

-- Re-enable the trigger
ALTER TABLE public.facilities ENABLE TRIGGER set_facility_provider_trigger;
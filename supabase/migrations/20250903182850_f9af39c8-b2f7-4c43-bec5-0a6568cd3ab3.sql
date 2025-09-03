-- Ensure existing facilities are synced to public marketing table
-- This will populate the marketing table with existing facility data

INSERT INTO public.facilities_public_marketing (
  id, name, address, postcode, description, created_at, updated_at
)
SELECT 
  id, name, address, postcode, description, created_at, updated_at
FROM public.facilities
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  postcode = EXCLUDED.postcode,
  description = EXCLUDED.description,
  updated_at = EXCLUDED.updated_at;
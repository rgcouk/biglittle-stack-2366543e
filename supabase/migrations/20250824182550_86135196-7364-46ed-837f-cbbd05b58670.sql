-- Clean up duplicate facilities in facilities_public_marketing table
-- Keep only the facility that has units (34cdac22-e8ad-4649-a7d1-f70dd31f1bea)
DELETE FROM facilities_public_marketing 
WHERE id NOT IN ('34cdac22-e8ad-4649-a7d1-f70dd31f1bea');

-- Ensure the facilities_public_marketing table is properly synced with facilities table
-- First, clear all existing entries
TRUNCATE facilities_public_marketing;

-- Insert all facilities from the main facilities table into the marketing table
INSERT INTO facilities_public_marketing (id, name, address, postcode, description, created_at, updated_at)
SELECT 
    id,
    name,
    address,
    postcode,
    description,
    created_at,
    updated_at
FROM facilities
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    address = EXCLUDED.address,
    postcode = EXCLUDED.postcode,
    description = EXCLUDED.description,
    updated_at = EXCLUDED.updated_at;
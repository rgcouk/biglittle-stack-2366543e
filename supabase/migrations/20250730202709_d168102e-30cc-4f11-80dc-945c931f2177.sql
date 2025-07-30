-- Get the profile ID for the current user
DO $$
DECLARE
    provider_profile_id uuid;
    facility_id uuid;
BEGIN
    -- Get the profile ID
    SELECT id INTO provider_profile_id FROM public.profiles WHERE user_id = 'd9d5ef3b-0369-499e-8267-204c79dbe2ae';
    
    -- Create a facility
    INSERT INTO public.facilities (provider_id, name, description, address, postcode, phone, email)
    VALUES (provider_profile_id, 'Premium Storage Solutions', 'Modern, secure storage facility with climate-controlled units', '123 Storage Lane', 'SW1A 1AA', '+1234567890', 'info@premiumstorage.com')
    RETURNING id INTO facility_id;
    
    -- Create some units
    INSERT INTO public.units (facility_id, unit_number, size_category, length_metres, width_metres, height_metres, monthly_price_pence, features, status) VALUES
    (facility_id, 'A1', 'Small', 2.0, 2.0, 2.5, 8000, ARRAY['Climate Controlled', 'Ground Floor'], 'available'),
    (facility_id, 'A2', 'Small', 2.0, 2.0, 2.5, 8000, ARRAY['Climate Controlled', 'Ground Floor'], 'available'),
    (facility_id, 'B1', 'Medium', 3.0, 3.0, 2.5, 12000, ARRAY['Climate Controlled', 'Security Camera'], 'available'),
    (facility_id, 'B2', 'Medium', 3.0, 3.0, 2.5, 12000, ARRAY['Climate Controlled', 'Security Camera'], 'available'),
    (facility_id, 'C1', 'Large', 4.0, 4.0, 3.0, 18000, ARRAY['Climate Controlled', 'Drive-up Access', 'Security Camera'], 'available'),
    (facility_id, 'C2', 'Large', 4.0, 4.0, 3.0, 18000, ARRAY['Climate Controlled', 'Drive-up Access', 'Security Camera'], 'occupied');
END $$;
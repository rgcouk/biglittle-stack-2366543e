-- Add trigger to automatically set provider_id when creating facilities
CREATE OR REPLACE FUNCTION public.set_facility_provider_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Get the profile ID for the current user
    SELECT id INTO NEW.provider_id 
    FROM api.profiles 
    WHERE user_id = auth.uid() AND role = 'provider';
    
    -- If no provider profile found, raise an error
    IF NEW.provider_id IS NULL THEN
        RAISE EXCEPTION 'Only providers can create facilities';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run before insert on facilities
DROP TRIGGER IF EXISTS set_facility_provider_trigger ON public.facilities;
CREATE TRIGGER set_facility_provider_trigger
    BEFORE INSERT ON public.facilities
    FOR EACH ROW
    EXECUTE FUNCTION public.set_facility_provider_id();
-- Update the handle_new_user function to handle facility_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, role, facility_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'facility_id' IS NOT NULL 
      THEN NEW.raw_user_meta_data->>'facility_id'::uuid
      ELSE NULL
    END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    role = COALESCE(EXCLUDED.role, profiles.role),
    facility_id = COALESCE(EXCLUDED.facility_id, profiles.facility_id);
  RETURN NEW;
END;
$$;
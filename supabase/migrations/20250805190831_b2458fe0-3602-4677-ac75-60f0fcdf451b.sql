-- Create the RPC function in the api schema where it can be accessed
CREATE OR REPLACE FUNCTION api.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'api'
AS $$
  SELECT role FROM api.profiles WHERE user_id = auth.uid();
$$;
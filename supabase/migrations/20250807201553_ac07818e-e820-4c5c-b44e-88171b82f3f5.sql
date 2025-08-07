BEGIN;

-- Ensure API schema exists
CREATE SCHEMA IF NOT EXISTS api;

-- Harden signup handler to never trust client-provided role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    'customer'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Provide a stable, RLS-bypassing role lookup via API schema
CREATE OR REPLACE FUNCTION api.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION api.get_current_user_role() TO anon, authenticated;

-- Enforce a single profile per auth user (dedupe + unique constraint)
WITH duplicates AS (
  SELECT user_id, MIN(id) AS keep_id
  FROM public.profiles
  GROUP BY user_id
  HAVING COUNT(*) > 1
),
rows_to_delete AS (
  SELECT p.id
  FROM public.profiles p
  JOIN duplicates d ON p.user_id = d.user_id
  WHERE p.id <> d.keep_id
)
DELETE FROM public.profiles WHERE id IN (SELECT id FROM rows_to_delete);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_user_id_unique'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
  END IF;
END $$;

-- Lock down profiles policies (remove permissive/duplicate ones and recreate minimal secure set)
DROP POLICY IF EXISTS "Function can access roles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users cannot change their own role" ON public.profiles;

CREATE POLICY "Profiles are viewable by owner"
ON public.profiles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Profiles are insertable by owner"
ON public.profiles
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Profiles are updatable by owner without role change"
ON public.profiles
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND role = (SELECT role FROM public.profiles WHERE user_id = auth.uid())
);

-- Remove public exposure of facilities and units
DROP POLICY IF EXISTS "Customers can view facilities" ON public.facilities;
DROP POLICY IF EXISTS "Customers can view available units" ON public.units;

-- Ensure provider policies exist (idempotent creation)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'facilities' AND policyname = 'Providers can manage own facilities'
  ) THEN
    CREATE POLICY "Providers can manage own facilities"
    ON public.facilities
    FOR ALL
    USING (provider_id IN (
      SELECT profiles.id FROM api.profiles profiles
      WHERE profiles.user_id = auth.uid() AND profiles.role = 'provider'
    ))
    WITH CHECK (provider_id IN (
      SELECT profiles.id FROM api.profiles profiles
      WHERE profiles.user_id = auth.uid() AND profiles.role = 'provider'
    ));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'units' AND policyname = 'Providers can manage units in own facilities'
  ) THEN
    CREATE POLICY "Providers can manage units in own facilities"
    ON public.units
    FOR ALL
    USING (facility_id IN (
      SELECT f.id
      FROM public.facilities f
      JOIN api.profiles p ON f.provider_id = p.id
      WHERE p.user_id = auth.uid() AND p.role = 'provider'
    ))
    WITH CHECK (facility_id IN (
      SELECT f.id
      FROM public.facilities f
      JOIN api.profiles p ON f.provider_id = p.id
      WHERE p.user_id = auth.uid() AND p.role = 'provider'
    ));
  END IF;
END $$;

COMMIT;
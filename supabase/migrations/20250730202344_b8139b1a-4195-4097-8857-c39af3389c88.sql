-- Phase 1: Database Cleanup - Remove dual customer system and simplify RLS
-- This migration file has been updated to only perform cleanup and not insert demo data.

-- Drop the provider_customers table (dual customer system)
DROP TABLE IF EXISTS public.provider_customers CASCADE;

-- Simplify bookings table - remove provider_customer_id reference
ALTER TABLE public.bookings DROP COLUMN IF EXISTS provider_customer_id;

-- Clear all data from tables in correct order (respecting foreign key constraints)
DELETE FROM public.payments;
DELETE FROM public.bookings;
DELETE FROM public.units;
DELETE FROM public.facilities;
DELETE FROM public.profiles;

-- Now let's work on the real fix for your signup flow.

-- Step 1: Create a migration file for the fix.
-- You can create a new file by running the command `supabase migration new fix_handle_new_user_role`.

-- Step 2: Edit the new migration file.
-- In this new file, you will place the corrected `handle_new_user` function:

-- CORRECTED handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';
-- Phase 1: Database Cleanup - Remove dual customer system and simplify RLS

-- Drop the provider_customers table (dual customer system)
DROP TABLE IF EXISTS public.provider_customers CASCADE;

-- Simplify bookings table - remove provider_customer_id reference
ALTER TABLE public.bookings DROP COLUMN IF EXISTS provider_customer_id;

-- Update RLS policies to be simpler and provider-focused
-- Drop existing complex policies on bookings
DROP POLICY IF EXISTS "Providers can manage bookings for their customers" ON public.bookings;
DROP POLICY IF EXISTS "Providers can view bookings for their units" ON public.bookings;
DROP POLICY IF EXISTS "Providers can update bookings for their units" ON public.bookings;
DROP POLICY IF EXISTS "Providers can delete bookings for their units" ON public.bookings;

-- Create simplified RLS policies for bookings (provider-owned units only)
CREATE POLICY "Providers can manage bookings for their units" 
ON public.bookings 
FOR ALL 
USING (
  unit_id IN (
    SELECT u.id 
    FROM units u 
    JOIN facilities f ON u.facility_id = f.id 
    JOIN profiles p ON f.provider_id = p.id 
    WHERE p.user_id = auth.uid() AND p.role = 'provider'
  )
);
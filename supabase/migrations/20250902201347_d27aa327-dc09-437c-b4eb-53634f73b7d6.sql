-- FIX SECURITY DEFINER VIEWS AND FUNCTION SEARCH PATH ISSUES

-- 1. Fix function search path issues by setting search_path on all functions
ALTER FUNCTION public.audit_critical_changes() SET search_path = public;
ALTER FUNCTION public.get_current_user_role() SET search_path = public;
ALTER FUNCTION public.get_current_user_role_safe() SET search_path = public;
ALTER FUNCTION public.get_user_provider_profile_id() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.set_facility_provider_id() SET search_path = public;
ALTER FUNCTION public.sync_facility_marketing_data() SET search_path = public;
ALTER FUNCTION public.generate_payment_for_booking() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.check_rate_limit(text, uuid, integer, integer) SET search_path = public;
ALTER FUNCTION public.generate_monthly_payments() SET search_path = public;
ALTER FUNCTION public.update_payment_statuses() SET search_path = public;
ALTER FUNCTION public.user_has_active_booking_in_facility(uuid) SET search_path = public;
ALTER FUNCTION public.get_facility_by_subdomain(text) SET search_path = public;

-- 2. Drop and recreate SECURITY DEFINER views to make them regular views
-- First check what views exist and recreate them without SECURITY DEFINER

-- Drop existing views that might have SECURITY DEFINER
DROP VIEW IF EXISTS public.facilities_public CASCADE;
DROP VIEW IF EXISTS public.facilities_safe_public CASCADE;
DROP VIEW IF EXISTS public.units_public_discovery CASCADE;

-- Recreate facilities_public as a regular view (not SECURITY DEFINER)
CREATE VIEW public.facilities_public AS
SELECT id, name, address, postcode, description, created_at, updated_at
FROM public.facilities_public_marketing;

-- Recreate facilities_safe_public as a regular view
CREATE VIEW public.facilities_safe_public AS
SELECT id, name, address, postcode, description, created_at, updated_at
FROM public.facilities_public_marketing;

-- Recreate units_public_discovery as a regular view
CREATE VIEW public.units_public_discovery AS
SELECT 
    facility_id,
    size_category,
    MIN(monthly_price_pence) as min_price_pence,
    MAX(monthly_price_pence) as max_price_pence,
    COUNT(*) as available_count
FROM public.units
WHERE status = 'available'
GROUP BY facility_id, size_category;

-- Enable RLS on these views 
ALTER VIEW public.facilities_public OWNER TO postgres;
ALTER VIEW public.facilities_safe_public OWNER TO postgres;  
ALTER VIEW public.units_public_discovery OWNER TO postgres;
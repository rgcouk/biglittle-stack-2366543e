-- Fix the Security Definer View issue by using SECURITY INVOKER mode
-- This makes the view respect RLS policies of the querying user instead of the creator

-- Drop the existing view 
DROP VIEW IF EXISTS public.units_secure_discovery CASCADE;

-- Recreate the view with SECURITY INVOKER to fix the security issue
CREATE VIEW public.units_secure_discovery 
WITH (security_invoker=on)
AS 
SELECT 
    facility_id,
    size_category,
    count(*) AS available_count,
    CASE
        WHEN (min(monthly_price_pence) = max(monthly_price_pence)) THEN 'Fixed Rate'::text
        ELSE 'Variable Rate'::text
    END AS pricing_type,
    (round((((min(monthly_price_pence))::numeric / 100.0) / (10)::numeric)) * (10)::numeric) AS min_price_range_pounds,
    (round((((max(monthly_price_pence))::numeric / 100.0) / (10)::numeric)) * (10)::numeric) AS max_price_range_pounds
FROM public.units
WHERE (status = 'available'::text)
GROUP BY facility_id, size_category;

-- Grant appropriate permissions
GRANT SELECT ON public.units_secure_discovery TO anon;
GRANT SELECT ON public.units_secure_discovery TO authenticated;

-- Add comment to clarify the security model
COMMENT ON VIEW public.units_secure_discovery IS 
'Unit discovery view with SECURITY INVOKER - respects RLS policies of querying user';
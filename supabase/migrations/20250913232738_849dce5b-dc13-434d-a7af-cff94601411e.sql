-- Fix security definer view issue by recreating the units_secure_discovery view
-- Views inherit security from their underlying tables, so no SECURITY DEFINER needed

-- Drop the existing view
DROP VIEW IF EXISTS public.units_secure_discovery;

-- Recreate the view as a regular view (inherits security from underlying units table)
CREATE VIEW public.units_secure_discovery AS
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

-- Grant appropriate permissions (views inherit table permissions but need explicit grants)
GRANT SELECT ON public.units_secure_discovery TO anon;
GRANT SELECT ON public.units_secure_discovery TO authenticated;
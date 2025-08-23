-- Clear all data from the database tables
-- WARNING: This will delete all data and cannot be undone

-- Clear tables in order to respect foreign key constraints
TRUNCATE TABLE public.payments CASCADE;
TRUNCATE TABLE public.bookings CASCADE;
TRUNCATE TABLE public.units CASCADE;
TRUNCATE TABLE public.facilities CASCADE;
TRUNCATE TABLE public.facilities_public CASCADE;
TRUNCATE TABLE public.facilities_public_marketing CASCADE;
TRUNCATE TABLE public.facilities_safe_public CASCADE;
TRUNCATE TABLE public.profiles CASCADE;
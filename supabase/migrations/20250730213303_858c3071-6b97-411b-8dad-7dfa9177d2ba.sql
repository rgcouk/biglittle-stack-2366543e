-- Clear all data from tables in correct order (respecting foreign key constraints)
DELETE FROM public.payments;
DELETE FROM public.bookings;
DELETE FROM public.units;
DELETE FROM public.facilities;
DELETE FROM public.profiles;
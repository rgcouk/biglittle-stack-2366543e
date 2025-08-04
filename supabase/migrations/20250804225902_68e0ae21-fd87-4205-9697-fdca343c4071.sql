-- Check what triggers exist on facilities table
SELECT tgname, tgenabled FROM pg_trigger WHERE tgrelid = 'public.facilities'::regclass;
-- Ensure public schema is exposed in the API
-- This allows access to tables in the public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to all existing tables in public schema
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Grant access to all sequences in public schema
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
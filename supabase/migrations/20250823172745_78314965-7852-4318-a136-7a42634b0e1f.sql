-- Disable pg_graphql extension to prevent unauthorized GraphQL access
-- This ensures all data access goes through the REST API with proper RLS policies

DROP EXTENSION IF EXISTS pg_graphql CASCADE;

-- Verify that the extension is removed
-- This will prevent GraphQL queries from bypassing RLS policies
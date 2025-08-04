-- First check if we have conflicting SELECT policies, then clean them up properly
DO $$
BEGIN
    -- Drop all duplicate SELECT policies on api.profiles
    DROP POLICY IF EXISTS "Allow logged-in users to read their own profile" ON api.profiles;
    DROP POLICY IF EXISTS "Authenticated user can read their own profile" ON api.profiles;
    DROP POLICY IF EXISTS "Authenticated users can read their own profile" ON api.profiles;
    
    -- Keep only the main one we created
    -- DROP POLICY IF EXISTS "Users can view own profile" ON api.profiles;
    
    -- Recreate a clean SELECT policy if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'api' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can view own profile'
        AND cmd = 'SELECT'
    ) THEN
        CREATE POLICY "Users can view own profile" ON api.profiles
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error cleaning up policies: %', SQLERRM;
END $$;
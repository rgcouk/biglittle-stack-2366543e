-- Security Fix: Clean up conflicting RLS policies on profiles table
-- Remove all existing SELECT policies that may conflict
DROP POLICY IF EXISTS "Users can view their own profile" ON api.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON api.profiles; 
DROP POLICY IF EXISTS "Users can view profiles" ON api.profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON api.profiles;
DROP POLICY IF EXISTS "Allow users to view their own profile" ON api.profiles;
DROP POLICY IF EXISTS "Users can access their own profile" ON api.profiles;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON api.profiles;

-- Create a single, clear SELECT policy
CREATE POLICY "Users can view own profile" ON api.profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Ensure other policies are properly scoped
DROP POLICY IF EXISTS "Users can update their own profile" ON api.profiles;
CREATE POLICY "Users can update own profile" ON api.profiles
    FOR UPDATE USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON api.profiles;
CREATE POLICY "Users can insert own profile" ON api.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
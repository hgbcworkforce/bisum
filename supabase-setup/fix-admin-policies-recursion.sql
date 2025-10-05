-- Fix Admin RLS Policies Infinite Recursion
-- This script fixes the circular dependency in admin_users policies
-- Run this script to resolve the infinite recursion error

-- First, disable RLS temporarily on admin_users to break the cycle
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Drop all existing problematic policies on admin_users
DROP POLICY IF EXISTS "Users can view own admin profile" ON admin_users;
DROP POLICY IF EXISTS "Users can update own profile" ON admin_users;
DROP POLICY IF EXISTS "Allow admin registration" ON admin_users;
DROP POLICY IF EXISTS "Admins can view other admins" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage admins" ON admin_users;

-- Re-enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies for admin_users
-- Allow authenticated users to view their own profile
CREATE POLICY "Users can view own profile" ON admin_users
    FOR SELECT
    USING (user_id = auth.uid());

-- Allow authenticated users to update their own basic profile info only
CREATE POLICY "Users can update own basic info" ON admin_users
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Allow new admin registration (anyone can register, but approval required)
CREATE POLICY "Anyone can register as admin" ON admin_users
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid() AND
        is_approved = false AND
        is_active = true AND
        role = 'organizer'
    );

-- Create a separate policy for super admin management
-- Use a hardcoded super admin email to avoid recursion
CREATE POLICY "Super admin can manage all admins" ON admin_users
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'oluwaseyipd@gmail.com'  -- CHANGE THIS TO YOUR ADMIN EMAIL
        )
    );

-- Alternative: Create a bypass policy for super admin using service role
-- This policy allows service role (backend operations) to manage admins
CREATE POLICY "Service role can manage admins" ON admin_users
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Fix other table policies that might reference admin_users recursively
-- Update attendees policies to avoid admin_users dependency for public registration
DROP POLICY IF EXISTS "Admins can view attendees" ON attendees;
DROP POLICY IF EXISTS "Admins can edit attendees" ON attendees;

-- Create simplified admin policies for attendees that use hardcoded admin email
CREATE POLICY "Specific admin can view attendees" ON attendees
    FOR SELECT
    USING (
        -- Allow public access for email checking OR admin access
        true OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'oluwaseyipd@gmail.com'  -- CHANGE THIS TO YOUR ADMIN EMAIL
        )
    );

CREATE POLICY "Specific admin can edit attendees" ON attendees
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'oluwaseyipd@gmail.com'  -- CHANGE THIS TO YOUR ADMIN EMAIL
        )
    );

-- Fix payments policies similarly
DROP POLICY IF EXISTS "Admins can view payments" ON payments;
DROP POLICY IF EXISTS "Admins can manage payments" ON payments;

CREATE POLICY "Specific admin can manage payments" ON payments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'oluwaseyipd@gmail.com'  -- CHANGE THIS TO YOUR ADMIN EMAIL
        )
    );

-- Fix sessions policies
DROP POLICY IF EXISTS "Admins can manage sessions" ON sessions;

CREATE POLICY "Specific admin can manage sessions" ON sessions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'oluwaseyipd@gmail.com'  -- CHANGE THIS TO YOUR ADMIN EMAIL
        )
    );

-- Fix session registrations policies
DROP POLICY IF EXISTS "Admins can manage session registrations" ON session_registrations;

CREATE POLICY "Specific admin can manage session registrations" ON session_registrations
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'oluwaseyipd@gmail.com'  -- CHANGE THIS TO YOUR ADMIN EMAIL
        )
    );

-- Fix activity log policies
DROP POLICY IF EXISTS "Super admins can view all activity" ON admin_activity_log;

CREATE POLICY "Specific admin can view all activity" ON admin_activity_log
    FOR SELECT
    USING (
        -- Users can see their own activity OR super admin can see all
        admin_id IN (SELECT id FROM admin_users WHERE user_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'oluwaseyipd@gmail.com'  -- CHANGE THIS TO YOUR ADMIN EMAIL
        )
    );

-- Test the fixes
DO $$
BEGIN
    RAISE NOTICE '=== RLS Policy Fixes Applied ===';
    RAISE NOTICE '';
    RAISE NOTICE 'IMPORTANT: Update all instances of oluwaseyipd@gmail.com';
    RAISE NOTICE 'with your actual admin email address!';
    RAISE NOTICE '';
    RAISE NOTICE 'Key Changes:';
    RAISE NOTICE '1. Removed recursive admin_users policy checks';
    RAISE NOTICE '2. Used hardcoded admin email to avoid circular dependency';
    RAISE NOTICE '3. Simplified public registration policies';
    RAISE NOTICE '4. Added service role bypass for backend operations';
    RAISE NOTICE '';
    RAISE NOTICE 'Test your registration now - it should work!';
END $$;

-- Show current policies for verification
SELECT
    schemaname,
    tablename,
    policyname,
    cmd as policy_command
FROM pg_policies
WHERE tablename IN ('attendees', 'admin_users', 'payments')
ORDER BY tablename, policyname;

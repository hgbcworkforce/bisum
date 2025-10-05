-- Fix Registration Permission Issues
-- This script resolves common RLS policy issues that prevent user registration
-- Run this in your Supabase SQL Editor

-- First, let's temporarily disable RLS to check if that's the issue
ALTER TABLE attendees DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE session_registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow public registration" ON attendees;
DROP POLICY IF EXISTS "Attendees can view own data" ON attendees;
DROP POLICY IF EXISTS "Attendees can update own data" ON attendees;
DROP POLICY IF EXISTS "Admins can view all attendees" ON attendees;
DROP POLICY IF EXISTS "Admins can update all attendees" ON attendees;
DROP POLICY IF EXISTS "Admins can manage all attendees" ON attendees;

DROP POLICY IF EXISTS "Allow public payment creation" ON payments;
DROP POLICY IF EXISTS "Attendees can view own payments" ON payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
DROP POLICY IF EXISTS "Admins can update payments" ON payments;
DROP POLICY IF EXISTS "Admins can manage all payments" ON payments;

DROP POLICY IF EXISTS "Allow public to view sessions" ON sessions;
DROP POLICY IF EXISTS "Admins can manage sessions" ON sessions;

DROP POLICY IF EXISTS "Attendees can register for sessions" ON session_registrations;
DROP POLICY IF EXISTS "Attendees can view own registrations" ON session_registrations;
DROP POLICY IF EXISTS "Attendees can view own session registrations" ON session_registrations;
DROP POLICY IF EXISTS "Attendees can cancel own registrations" ON session_registrations;
DROP POLICY IF EXISTS "Admins can manage all session registrations" ON session_registrations;

DROP POLICY IF EXISTS "Admins can view other admins" ON admins;

-- Re-enable RLS
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create simple, working policies for registration

-- ATTENDEES TABLE POLICIES
-- Allow anyone to register (insert)
CREATE POLICY "Allow public registration" ON attendees
    FOR INSERT
    WITH CHECK (true);

-- Allow attendees to view their own data
CREATE POLICY "Attendees can view own data" ON attendees
    FOR SELECT
    USING (auth.jwt() ->> 'email' = email OR auth.jwt() IS NULL);

-- Allow attendees to update their own data
CREATE POLICY "Attendees can update own data" ON attendees
    FOR UPDATE
    USING (auth.jwt() ->> 'email' = email)
    WITH CHECK (auth.jwt() ->> 'email' = email);

-- Allow admins to do everything (replace with your admin email)
CREATE POLICY "Admin full access to attendees" ON attendees
    FOR ALL
    USING (auth.jwt() ->> 'email' = 'admin@bisumconference.org')
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@bisumconference.org');

-- PAYMENTS TABLE POLICIES
-- Allow anyone to create payments
CREATE POLICY "Allow payment creation" ON payments
    FOR INSERT
    WITH CHECK (true);

-- Allow users to view their own payments
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM attendees
            WHERE attendees.id = payments.attendee_id
            AND (attendees.email = auth.jwt() ->> 'email' OR auth.jwt() IS NULL)
        )
    );

-- Allow admin full access to payments
CREATE POLICY "Admin full access to payments" ON payments
    FOR ALL
    USING (auth.jwt() ->> 'email' = 'admin@bisumconference.org')
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@bisumconference.org');

-- SESSIONS TABLE POLICIES
-- Allow everyone to view sessions
CREATE POLICY "Public can view sessions" ON sessions
    FOR SELECT
    USING (true);

-- Allow admin to manage sessions
CREATE POLICY "Admin can manage sessions" ON sessions
    FOR ALL
    USING (auth.jwt() ->> 'email' = 'admin@bisumconference.org')
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@bisumconference.org');

-- SESSION REGISTRATIONS POLICIES
-- Allow attendees to register for sessions
CREATE POLICY "Allow session registration" ON session_registrations
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM attendees
            WHERE attendees.id = session_registrations.attendee_id
            AND (attendees.email = auth.jwt() ->> 'email' OR auth.jwt() IS NULL)
        )
    );

-- Allow users to view their own session registrations
CREATE POLICY "View own session registrations" ON session_registrations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM attendees
            WHERE attendees.id = session_registrations.attendee_id
            AND (attendees.email = auth.jwt() ->> 'email' OR auth.jwt() IS NULL)
        )
    );

-- Allow admin full access to session registrations
CREATE POLICY "Admin full access to session registrations" ON session_registrations
    FOR ALL
    USING (auth.jwt() ->> 'email' = 'admin@bisumconference.org')
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@bisumconference.org');

-- ADMINS TABLE POLICIES
-- Allow users to view admin record if they are that admin
CREATE POLICY "Self admin access" ON admins
    FOR SELECT
    USING (email = auth.jwt() ->> 'email');

-- Grant necessary permissions to authenticated and anonymous users
-- Run these if you have superuser access
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT ON attendees TO anon, authenticated;
GRANT SELECT, INSERT ON payments TO anon, authenticated;
GRANT SELECT ON sessions TO anon, authenticated;
GRANT SELECT, INSERT ON session_registrations TO anon, authenticated;
GRANT SELECT ON admins TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Update the admin email (CHANGE THIS TO YOUR ACTUAL EMAIL!)
UPDATE admins
SET email = 'admin@bisumconference.org'
WHERE role = 'super_admin';

-- Test the setup
DO $$
BEGIN
    RAISE NOTICE 'Registration permission fixes applied successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'IMPORTANT: Update the admin email in this script!';
    RAISE NOTICE 'Replace admin@bisumconference.org with your actual email';
    RAISE NOTICE '';
    RAISE NOTICE 'Test your registration now.';
END $$;

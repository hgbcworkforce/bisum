-- Quick Fix for RLS Policy Infinite Recursion Issue
-- Run this script to fix the admin policy circular dependency

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all attendees" ON attendees;
DROP POLICY IF EXISTS "Admins can update all attendees" ON attendees;
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
DROP POLICY IF EXISTS "Admins can update payments" ON payments;
DROP POLICY IF EXISTS "Admins can manage sessions" ON sessions;
DROP POLICY IF EXISTS "Admins can manage all session registrations" ON session_registrations;
DROP POLICY IF EXISTS "Admins can view other admins" ON admins;

-- Create new policies without circular dependency
-- Replace 'admin@bisumconference.org' with your actual admin email

-- Attendees policies
CREATE POLICY "Admins can manage all attendees" ON attendees FOR ALL
    USING (auth.jwt() ->> 'email' = 'admin@bisumconference.org');

-- Payments policies
CREATE POLICY "Admins can manage all payments" ON payments FOR ALL
    USING (auth.jwt() ->> 'email' = 'admin@bisumconference.org');

-- Sessions policies
CREATE POLICY "Admins can manage sessions" ON sessions FOR ALL
    USING (auth.jwt() ->> 'email' = 'admin@bisumconference.org');

-- Session registrations policies
CREATE POLICY "Admins can manage all session registrations" ON session_registrations FOR ALL
    USING (auth.jwt() ->> 'email' = 'admin@bisumconference.org');

-- Admins table policy (safe - no circular dependency)
CREATE POLICY "Admins can view other admins" ON admins FOR SELECT
    USING (auth.jwt() ->> 'email' = email);

-- Update the admin email to your actual email (CHANGE THIS!)
UPDATE admins
SET email = 'oluwaseyiae@gmail.com'
WHERE role = 'super_admin';

SELECT 'RLS policies fixed successfully! Update the admin email in the script before running.' as status;

-- Quick Fix for Registration Error
-- This temporarily disables RLS on admin_users to fix the infinite recursion
-- Run this immediately to fix the registration issue

-- Disable RLS on admin_users table to break the circular dependency
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Also ensure public registration works on attendees table
ALTER TABLE attendees DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;

-- Re-enable with simple policies
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create simple attendees policies
DROP POLICY IF EXISTS "Public registration allowed" ON attendees;
DROP POLICY IF EXISTS "Public can check email exists" ON attendees;

CREATE POLICY "Anyone can register" ON attendees
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can read for email check" ON attendees
    FOR SELECT
    USING (true);

-- Create simple payments policies
DROP POLICY IF EXISTS "Public can create payments" ON payments;

CREATE POLICY "Anyone can create payments" ON payments
    FOR INSERT
    WITH CHECK (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON attendees TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON payments TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'Quick fix applied! Registration should work now. Admin features may be limited until proper fix is applied.' as status;

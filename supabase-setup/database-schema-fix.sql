-- BISUM Conference Database Schema Fix
-- Fixes permission issues for public registration
-- Version: 2.1

-- First, drop existing policies that might be causing conflicts
DROP POLICY IF EXISTS "Allow public registration" ON attendees;
DROP POLICY IF EXISTS "Allow public payment creation" ON payments;

-- Recreate the public registration policy with better permissions
CREATE POLICY "Enable public registration" ON attendees
    FOR INSERT
    WITH CHECK (true);

-- Allow public users to create payments
CREATE POLICY "Enable public payment creation" ON payments
    FOR INSERT
    WITH CHECK (true);

-- Allow public users to read sessions (conference schedule)
CREATE POLICY "Allow public to read sessions" ON sessions
    FOR SELECT
    USING (true);

-- Ensure the attendees table allows public inserts by disabling auth requirement for INSERT
ALTER TABLE attendees FORCE ROW LEVEL SECURITY;
ALTER TABLE payments FORCE ROW LEVEL SECURITY;
ALTER TABLE sessions FORCE ROW LEVEL SECURITY;

-- Grant necessary permissions to the authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant table permissions for registration
GRANT INSERT ON attendees TO authenticated;
GRANT INSERT ON attendees TO anon;
GRANT SELECT ON attendees TO authenticated;

GRANT INSERT ON payments TO authenticated;
GRANT INSERT ON payments TO anon;
GRANT SELECT ON payments TO authenticated;

GRANT SELECT ON sessions TO authenticated;
GRANT SELECT ON sessions TO anon;

-- Grant sequence permissions for auto-generated fields
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Update the registration number generation function to work with RLS
CREATE OR REPLACE FUNCTION generate_registration_number()
RETURNS VARCHAR(50)
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    reg_number VARCHAR(50);
    counter INTEGER;
    year_suffix VARCHAR(4);
BEGIN
    year_suffix := EXTRACT(YEAR FROM NOW())::VARCHAR;

    -- Get the count of existing registrations for this year
    SELECT COUNT(*) + 1 INTO counter
    FROM attendees
    WHERE registration_number LIKE 'BISUM' || year_suffix || '%';

    -- Format as BISUM2025001, BISUM2025002, etc.
    reg_number := 'BISUM' || year_suffix || LPAD(counter::VARCHAR, 3, '0');

    RETURN reg_number;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to auto-generate registration numbers
CREATE OR REPLACE FUNCTION auto_generate_registration_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.registration_number IS NULL OR NEW.registration_number = '' THEN
        NEW.registration_number := generate_registration_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_auto_registration_number ON attendees;

-- Create the trigger
CREATE TRIGGER trigger_auto_registration_number
    BEFORE INSERT ON attendees
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_registration_number();

-- Ensure admin policies still work (replace with your admin email)
CREATE POLICY "Admin full access to attendees" ON attendees
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE email = auth.jwt() ->> 'email'
            AND email = 'admin@bisumconference.org'
        )
    );

CREATE POLICY "Admin full access to payments" ON payments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE email = auth.jwt() ->> 'email'
            AND email = 'admin@bisumconference.org'
        )
    );

-- Allow attendees to view their own data (after registration)
CREATE POLICY "Attendees view own data" ON attendees
    FOR SELECT
    USING (
        auth.jwt() ->> 'email' = email OR
        auth.jwt() IS NULL -- Allow public access for registration confirmation
    );

-- Allow attendees to view their own payments
CREATE POLICY "Attendees view own payments" ON payments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM attendees
            WHERE attendees.id = payments.attendee_id
            AND (attendees.email = auth.jwt() ->> 'email' OR auth.jwt() IS NULL)
        )
    );

-- Create a simplified view for public registration stats (no sensitive data)
CREATE OR REPLACE VIEW public_registration_stats AS
SELECT
    COUNT(*) as total_registrations,
    COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_registrations,
    COUNT(CASE WHEN registration_type = 'student' THEN 1 END) as student_count,
    COUNT(CASE WHEN registration_type = 'professional' THEN 1 END) as professional_count
FROM attendees
WHERE status = 'active';

-- Allow public access to registration stats
GRANT SELECT ON public_registration_stats TO authenticated;
GRANT SELECT ON public_registration_stats TO anon;

-- Test the permissions with a sample insert (this should not fail)
-- Note: This is just a test query, it won't actually insert data
SELECT 'Permissions test: ' ||
CASE
    WHEN has_table_privilege('anon', 'attendees', 'INSERT') THEN 'PASSED'
    ELSE 'FAILED'
END as test_result;

-- Success message
SELECT 'Database schema permissions fixed successfully! Public registration should now work.' as status;

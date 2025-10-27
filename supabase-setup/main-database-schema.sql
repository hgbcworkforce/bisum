-- BISUM Conference Management System Database Schema
-- Updated with Simplified Admin Permissions and Designated Approver
-- Version: 6.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE registration_type AS ENUM ('student', 'professional');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE attendee_status AS ENUM ('active', 'cancelled', 'refunded');
CREATE TYPE referral_source AS ENUM ('church', 'instagram', 'recommendation_from_friend', 'whatsapp', 'facebook', 'flyer');
CREATE TYPE breakout_session_choice AS ENUM ('investment', 'tech', 'fashion', 'agriculture', 'foods');

-- Create attendees table (for public registration - no authentication required)
CREATE TABLE IF NOT EXISTS attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Personal Information
    first_name VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(first_name)) > 0),
    last_name VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(last_name)) > 0),
    email VARCHAR(255) NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    phone VARCHAR(20) NOT NULL CHECK (phone ~ '^\+?[0-9\s\-\(\)]{10,20}$'),

    -- Registration Details
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    registration_type registration_type NOT NULL,
    registration_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Payment Status
    payment_status payment_status NOT NULL DEFAULT 'pending',

    -- New Registration Form Fields
    expectations TEXT,
    referral_source referral_source NOT NULL,
    breakout_session_choice breakout_session_choice NOT NULL,

    -- Status
    status attendee_status NOT NULL DEFAULT 'active',

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create admin_users table (for authenticated admin access)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- This links to Supabase auth.users
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Profile Information
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,

    -- Admin Status
    is_active BOOLEAN DEFAULT TRUE,
    is_approved BOOLEAN DEFAULT FALSE, -- New signups need approval

    -- Profile Details
    phone VARCHAR(20),
    department VARCHAR(100), -- e.g., "Marketing", "Finance", "Logistics"

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ,

    -- Approval tracking
    approved_by UUID REFERENCES admin_users(id),
    approved_at TIMESTAMPTZ
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Payment Reference
    transaction_ref VARCHAR(100) NOT NULL UNIQUE,
    flutterwave_transaction_id VARCHAR(100) UNIQUE,

    -- Attendee Information
    attendee_id UUID NOT NULL REFERENCES attendees(id) ON DELETE CASCADE,

    -- Payment Details
    amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',

    -- Payment Status
    status payment_status NOT NULL DEFAULT 'pending',

    -- Payment Method
    payment_method VARCHAR(50),
    payment_channel VARCHAR(50),

    -- Flutterwave Response Data
    flutterwave_response JSONB DEFAULT '{}',

    -- Payment Timestamps
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendees_email ON attendees(email);
CREATE INDEX IF NOT EXISTS idx_attendees_registration_number ON attendees(registration_number);
CREATE INDEX IF NOT EXISTS idx_attendees_payment_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_attendees_registration_type ON attendees(registration_type);
CREATE INDEX IF NOT EXISTS idx_attendees_created_at ON attendees(created_at);
CREATE INDEX IF NOT EXISTS idx_attendees_referral_source ON attendees(referral_source);
CREATE INDEX IF NOT EXISTS idx_attendees_breakout_session ON attendees(breakout_session_choice);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_approved ON admin_users(is_approved);

CREATE INDEX IF NOT EXISTS idx_payments_transaction_ref ON payments(transaction_ref);
CREATE INDEX IF NOT EXISTS idx_payments_flutterwave_id ON payments(flutterwave_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_attendee_id ON payments(attendee_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_attendees_updated_at BEFORE UPDATE ON attendees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate registration numbers
CREATE OR REPLACE FUNCTION generate_registration_number()
RETURNS VARCHAR(50) AS $$
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

-- Enable Row Level Security
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR ATTENDEES (Public Registration)
-- Allow anyone to register (insert attendees)
CREATE POLICY "Public registration allowed" ON attendees
    FOR INSERT
    WITH CHECK (true);

-- Allow public to view attendees for email checking during registration
CREATE POLICY "Public can check email exists" ON attendees
    FOR SELECT
    USING (true);

-- Allow authenticated admins to view all attendees
CREATE POLICY "Admins can view attendees" ON attendees
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
            AND admin_users.is_active = true
            AND admin_users.is_approved = true
        )
    );

-- Allow admins to edit attendees
CREATE POLICY "Admins can edit attendees" ON attendees
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
            AND admin_users.is_active = true
            AND admin_users.is_approved = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
            AND admin_users.is_active = true
            AND admin_users.is_approved = true
        )
    );

-- RLS POLICIES FOR ADMIN_USERS
-- Allow select only to the admin with email
CREATE POLICY "Allow select to oluwaseyiae@gmail.com" ON admin_users
FOR SELECT
    USING (email = 'oluwaseyiae@gmail.com');

-- Allow new admins to register themselves (but need approval)
CREATE POLICY "Allow anyone to register" ON admin_users
    FOR INSERT
    WITH CHECK (true);

-- Only the designated approver can approve new admins
CREATE POLICY "Only approver can approve" ON admin_users
    FOR UPDATE
    USING ( EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = admin_users.approved_by AND auth.users.email = 'oluwaseyiae@gmail.com'))
    WITH CHECK (EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = admin_users.approved_by AND auth.users.email = 'oluwaseyiae@gmail.com'));

-- RLS POLICIES FOR PAYMENTS
-- Allow public to create payments
CREATE POLICY "Public can create payments" ON payments
    FOR INSERT
    WITH CHECK (true);

-- Allow admins to view payments
CREATE POLICY "Admins can view payments" ON payments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
            AND admin_users.is_active = true
            AND admin_users.is_approved = true
        )
    );

-- Allow admins to manage payments
CREATE POLICY "Admins can manage payments" ON payments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
            AND admin_users.is_active = true
            AND admin_users.is_approved = true
        )
    );

-- Create useful views
CREATE OR REPLACE VIEW attendee_summary AS
SELECT
    a.id,
    a.registration_number,
    a.first_name || ' ' || a.last_name AS full_name,
    a.email,
    a.phone,
    a.registration_type,
    a.payment_status,
    a.status,
    a.registration_date,
    a.expectations,
    a.referral_source,
    a.breakout_session_choice,
    p.amount AS paid_amount,
    p.paid_at,
    CASE
        WHEN a.payment_status = 'completed' THEN 'Fully Registered'
        WHEN a.payment_status = 'pending' THEN 'Payment Pending'
        WHEN a.payment_status = 'failed' THEN 'Payment Failed'
        ELSE 'Unknown'
    END AS registration_status
FROM attendees a
LEFT JOIN payments p ON a.id = p.attendee_id AND p.status = 'completed';

-- Create registration statistics view with new fields
CREATE OR REPLACE VIEW registration_stats AS
SELECT
    COUNT(*) as total_registrations,
    COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_payments,
    COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_payments,
    COUNT(CASE WHEN payment_status = 'failed' THEN 1 END) as failed_payments,
    COUNT(CASE WHEN registration_type = 'student' THEN 1 END) as student_count,
    COUNT(CASE WHEN registration_type = 'professional' THEN 1 END) as professional_count,
    COUNT(CASE WHEN referral_source = 'church' THEN 1 END) as church_referrals,
    COUNT(CASE WHEN referral_source = 'instagram' THEN 1 END) as instagram_referrals,
    COUNT(CASE WHEN referral_source = 'recommendation_from_friend' THEN 1 END) as friend_referrals,
    COUNT(CASE WHEN referral_source = 'whatsapp' THEN 1 END) as whatsapp_referrals,
    COUNT(CASE WHEN referral_source = 'facebook' THEN 1 END) as facebook_referrals,
    COUNT(CASE WHEN referral_source = 'flyer' THEN 1 END) as flyer_referrals,
    COUNT(CASE WHEN breakout_session_choice = 'investment' THEN 1 END) as investment_session,
    COUNT(CASE WHEN breakout_session_choice = 'tech' THEN 1 END) as tech_session,
    COUNT(CASE WHEN breakout_session_choice = 'fashion' THEN 1 END) as fashion_session,
    COUNT(CASE WHEN breakout_session_choice = 'agriculture' THEN 1 END) as agriculture_session,
    COUNT(CASE WHEN breakout_session_choice = 'foods' THEN 1 END) as foods_session
FROM attendees;

-- Admin users summary view
CREATE OR REPLACE VIEW admin_summary AS
SELECT
    au.id,
    au.email,
    au.full_name,
    au.is_active,
    au.is_approved,
    au.created_at,
    au.last_login,
    approver.full_name as approved_by_name,
    au.approved_at
FROM admin_users au
LEFT JOIN admin_users approver ON au.approved_by = approver.id;

-- Initial admin user will be created manually after setting up Supabase Auth
-- See ADMIN_AUTH_SETUP.md for instructions on creating your first admin user

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT ON attendees TO anon, authenticated;
GRANT SELECT, INSERT ON payments TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON admin_users TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Add column comments for documentation
COMMENT ON COLUMN attendees.expectations IS 'Optional field for attendee expectations from the conference';
COMMENT ON COLUMN attendees.referral_source IS 'Required field indicating how the attendee heard about the conference';
COMMENT ON COLUMN attendees.breakout_session_choice IS 'Required field for the attendees chosen breakout session';

COMMENT ON TABLE admin_users IS 'Authenticated admin users who can access the dashboard';
COMMENT ON COLUMN admin_users.is_approved IS 'New admin signups require approval from the designated approver';
COMMENT ON COLUMN admin_users.user_id IS 'Links to auth.users table in Supabase Auth';

-- Success message
SELECT 'BISUM Conference Database Schema with Simplified Admin Permissions and Designated Approver created successfully!' as status;

-- Important notes for setup
DO $$
BEGIN
    RAISE NOTICE '=== SETUP INSTRUCTIONS ===';
    RAISE NOTICE '';
    RAISE NOTICE '1. The user with the email address ''oluwaseyiae@gmail.com'' has all admin permissions (all other users will need that user to approve them)';
    RAISE NOTICE '2. Create your first admin user in Supabase Auth dashboard using oluwaseyiae@gmail.com';
    RAISE NOTICE '3. Set up your admin authentication flow in your app';
    RAISE NOTICE '4. Public registration will work without authentication';
    RAISE NOTICE '';
    RAISE NOTICE 'Admin Permission System:';
    RAISE NOTICE '- New admins sign up but need approval from the designated approver';
    RAISE NOTICE '- Simplified admin permission system: All authenticated admins have the same permission';
    RAISE NOTICE '';
    RAISE NOTICE 'Public Registration System:';
    RAISE NOTICE '- No authentication required for attendees';
    RAISE NOTICE '- Just information gathering and payment';
    RAISE NOTICE '- Admins can view/manage through dashboard';
    RAISE NOTICE '';
END $$;

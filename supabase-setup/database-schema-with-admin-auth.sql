-- BISUM Conference Management System Database Schema
-- Updated with Admin Authentication + Public Registration
-- Version: 3.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE registration_type AS ENUM ('student', 'professional');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE attendee_status AS ENUM ('active', 'cancelled', 'refunded');
CREATE TYPE referral_source AS ENUM ('church', 'instagram', 'recommendation_from_friend', 'whatsapp', 'facebook', 'flyer');
CREATE TYPE breakout_session_choice AS ENUM ('investment', 'tech', 'fashion', 'agriculture', 'foods');
CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'organizer', 'finance');

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
    role admin_role NOT NULL DEFAULT 'organizer',

    -- Admin Status
    is_active BOOLEAN DEFAULT TRUE,
    is_approved BOOLEAN DEFAULT FALSE, -- New signups need approval

    -- Profile Details
    phone VARCHAR(20),
    department VARCHAR(100), -- e.g., "Marketing", "Finance", "Logistics"

    -- Permissions
    can_view_attendees BOOLEAN DEFAULT TRUE,
    can_edit_attendees BOOLEAN DEFAULT FALSE,
    can_view_payments BOOLEAN DEFAULT TRUE,
    can_manage_payments BOOLEAN DEFAULT FALSE,
    can_manage_sessions BOOLEAN DEFAULT FALSE,
    can_manage_admins BOOLEAN DEFAULT FALSE,

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

-- Create sessions table for conference sessions
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    speaker VARCHAR(100),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    venue VARCHAR(100),
    max_capacity INTEGER DEFAULT NULL,
    session_type VARCHAR(50) DEFAULT 'general',
    status VARCHAR(20) DEFAULT 'scheduled',

    -- Session management
    created_by UUID REFERENCES admin_users(id),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create session registrations table
CREATE TABLE IF NOT EXISTS session_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attendee_id UUID NOT NULL REFERENCES attendees(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'registered',

    UNIQUE(attendee_id, session_id)
);

-- Create admin activity log (for audit trail)
CREATE TABLE IF NOT EXISTS admin_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES admin_users(id),

    action VARCHAR(50) NOT NULL, -- 'login', 'view_attendees', 'edit_attendee', etc.
    resource_type VARCHAR(50), -- 'attendee', 'payment', 'session', etc.
    resource_id UUID, -- ID of the resource being acted upon

    details JSONB DEFAULT '{}', -- Additional context
    ip_address INET,
    user_agent TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendees_email ON attendees(email);
CREATE INDEX IF NOT EXISTS idx_attendees_registration_number ON attendees(registration_number);
CREATE INDEX IF NOT EXISTS idx_attendees_payment_status ON attendees(payment_status);
CREATE INDEX IF NOT EXISTS idx_attendees_registration_type ON attendees(registration_type);
CREATE INDEX IF NOT EXISTS idx_attendees_created_at ON attendees(created_at);
CREATE INDEX IF NOT EXISTS idx_attendees_referral_source ON attendees(referral_source);
CREATE INDEX IF NOT EXISTS idx_attendees_breakout_session ON attendees(breakout_session_choice);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_approved ON admin_users(is_approved);

CREATE INDEX IF NOT EXISTS idx_payments_transaction_ref ON payments(transaction_ref);
CREATE INDEX IF NOT EXISTS idx_payments_flutterwave_id ON payments(flutterwave_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_attendee_id ON payments(attendee_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_created_by ON sessions(created_by);

CREATE INDEX IF NOT EXISTS idx_session_registrations_attendee ON session_registrations(attendee_id);
CREATE INDEX IF NOT EXISTS idx_session_registrations_session ON session_registrations(session_id);

CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_id ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_action ON admin_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at);

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

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
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

-- Function to log admin activity
CREATE OR REPLACE FUNCTION log_admin_activity(
    p_admin_id UUID,
    p_action VARCHAR(50),
    p_resource_type VARCHAR(50) DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO admin_activity_log (
        admin_id,
        action,
        resource_type,
        resource_id,
        details
    ) VALUES (
        p_admin_id,
        p_action,
        p_resource_type,
        p_resource_id,
        p_details
    );
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR ATTENDEES (Public Registration)
-- Allow anyone to register (insert attendees)
CREATE POLICY "Public registration allowed" ON attendees
    FOR INSERT
    WITH CHECK (true);

-- Allow public to view attendees for email checking during registration
CREATE POLICY "Public can check email exists" ON attendees
    FOR SELECT
    USING (true);

-- Allow authenticated admins to view all attendees based on permissions
CREATE POLICY "Admins can view attendees" ON attendees
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
            AND admin_users.is_active = true
            AND admin_users.is_approved = true
            AND admin_users.can_view_attendees = true
        )
    );

-- Allow admins to edit attendees based on permissions
CREATE POLICY "Admins can edit attendees" ON attendees
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
            AND admin_users.is_active = true
            AND admin_users.is_approved = true
            AND admin_users.can_edit_attendees = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
            AND admin_users.is_active = true
            AND admin_users.is_approved = true
            AND admin_users.can_edit_attendees = true
        )
    );

-- RLS POLICIES FOR ADMIN_USERS
-- Users can view their own profile
CREATE POLICY "Users can view own admin profile" ON admin_users
    FOR SELECT
    USING (user_id = auth.uid());

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile" ON admin_users
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- New admins can register themselves (but need approval)
CREATE POLICY "Allow admin registration" ON admin_users
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid() AND
        is_approved = false AND
        role = 'organizer' -- Default role for new signups
    );

-- Super admins and admins can view other admins
CREATE POLICY "Admins can view other admins" ON admin_users
    FOR SELECT
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
            AND admin_users.is_active = true
            AND admin_users.is_approved = true
            AND admin_users.can_manage_admins = true
        )
    );

-- Super admins can manage other admins
CREATE POLICY "Super admins can manage admins" ON admin_users
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
            AND admin_users.is_active = true
            AND admin_users.is_approved = true
            AND admin_users.can_manage_admins = true
        )
    );

-- RLS POLICIES FOR PAYMENTS
-- Allow public to create payments
CREATE POLICY "Public can create payments" ON payments
    FOR INSERT
    WITH CHECK (true);

-- Allow admins to view payments based on permissions
CREATE POLICY "Admins can view payments" ON payments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
            AND admin_users.is_active = true
            AND admin_users.is_approved = true
            AND admin_users.can_view_payments = true
        )
    );

-- Allow admins to manage payments based on permissions
CREATE POLICY "Admins can manage payments" ON payments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
            AND admin_users.is_active = true
            AND admin_users.is_approved = true
            AND admin_users.can_manage_payments = true
        )
    );

-- RLS POLICIES FOR SESSIONS
-- Allow public to view sessions
CREATE POLICY "Public can view sessions" ON sessions
    FOR SELECT
    USING (true);

-- Allow admins to manage sessions based on permissions
CREATE POLICY "Admins can manage sessions" ON sessions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
            AND admin_users.is_active = true
            AND admin_users.is_approved = true
            AND admin_users.can_manage_sessions = true
        )
    );

-- RLS POLICIES FOR SESSION REGISTRATIONS
-- Allow public to register for sessions
CREATE POLICY "Public can register for sessions" ON session_registrations
    FOR INSERT
    WITH CHECK (true);

-- Allow public to view session registrations
CREATE POLICY "Public can view session registrations" ON session_registrations
    FOR SELECT
    USING (true);

-- Allow admins to manage session registrations
CREATE POLICY "Admins can manage session registrations" ON session_registrations
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
            AND admin_users.is_active = true
            AND admin_users.is_approved = true
        )
    );

-- RLS POLICIES FOR ADMIN ACTIVITY LOG
-- Users can view their own activity
CREATE POLICY "Users can view own activity" ON admin_activity_log
    FOR SELECT
    USING (
        admin_id IN (
            SELECT id FROM admin_users WHERE user_id = auth.uid()
        )
    );

-- Super admins can view all activity
CREATE POLICY "Super admins can view all activity" ON admin_activity_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
            AND admin_users.is_active = true
            AND admin_users.is_approved = true
            AND admin_users.can_manage_admins = true
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
    au.role,
    au.department,
    au.is_active,
    au.is_approved,
    au.created_at,
    au.last_login,
    approver.full_name as approved_by_name,
    au.approved_at,
    -- Permission summary
    CASE
        WHEN au.can_manage_admins THEN 'Full Access'
        WHEN au.can_manage_payments AND au.can_manage_sessions THEN 'Manager'
        WHEN au.can_edit_attendees THEN 'Editor'
        ELSE 'Viewer'
    END as access_level
FROM admin_users au
LEFT JOIN admin_users approver ON au.approved_by = approver.id;

-- Initial admin user will be created manually after setting up Supabase Auth
-- See ADMIN_AUTH_SETUP.md for instructions on creating your first admin user

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT ON attendees TO anon, authenticated;
GRANT SELECT, INSERT ON payments TO anon, authenticated;
GRANT SELECT ON sessions TO anon, authenticated;
GRANT SELECT, INSERT ON session_registrations TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON admin_users TO authenticated;
GRANT SELECT, INSERT ON admin_activity_log TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Add column comments for documentation
COMMENT ON COLUMN attendees.expectations IS 'Optional field for attendee expectations from the conference';
COMMENT ON COLUMN attendees.referral_source IS 'Required field indicating how the attendee heard about the conference';
COMMENT ON COLUMN attendees.breakout_session_choice IS 'Required field for the attendees chosen breakout session';

COMMENT ON TABLE admin_users IS 'Authenticated admin users who can access the dashboard';
COMMENT ON COLUMN admin_users.is_approved IS 'New admin signups require approval from existing admins';
COMMENT ON COLUMN admin_users.user_id IS 'Links to auth.users table in Supabase Auth';

-- Success message
SELECT 'BISUM Conference Database Schema with Admin Authentication created successfully!' as status;

-- Important notes for setup
DO $$
BEGIN
    RAISE NOTICE '=== SETUP INSTRUCTIONS ===';
    RAISE NOTICE '';
    RAISE NOTICE '1. Create your first admin user in Supabase Auth dashboard';
    RAISE NOTICE '2. Get the user_id from auth.users table';
    RAISE NOTICE '3. Update the admin_users INSERT statement above with the real user_id';
    RAISE NOTICE '4. Set up your admin authentication flow in your app';
    RAISE NOTICE '5. Public registration will work without authentication';
    RAISE NOTICE '';
    RAISE NOTICE 'Admin Permission System:';
    RAISE NOTICE '- New admins sign up but need approval';
    RAISE NOTICE '- Granular permissions for different operations';
    RAISE NOTICE '- Activity logging for audit trails';
    RAISE NOTICE '';
    RAISE NOTICE 'Public Registration System:';
    RAISE NOTICE '- No authentication required for attendees';
    RAISE NOTICE '- Just information gathering and payment';
    RAISE NOTICE '- Admins can view/manage through dashboard';
END $$;

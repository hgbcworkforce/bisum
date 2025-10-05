-- BISUM Conference Management System Database Schema
-- Updated with new registration form fields
-- Version: 2.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE registration_type AS ENUM ('student', 'professional', 'speaker', 'sponsor');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE attendee_status AS ENUM ('active', 'cancelled', 'refunded');
CREATE TYPE referral_source AS ENUM ('church', 'instagram', 'recommendation_from_friend', 'whatsapp', 'facebook', 'flyer');
CREATE TYPE breakout_session_choice AS ENUM ('investment', 'tech', 'fashion', 'agriculture', 'foods');

-- Create attendees table
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

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Payment Reference
    transaction_ref VARCHAR(100) NOT NULL UNIQUE,
    flutterwave_transaction_id VARCHAR(100) NOT NULL UNIQUE,

    -- Attendee Information
    attendee_id UUID NOT NULL REFERENCES attendees(id) ON DELETE CASCADE,

    -- Payment Details
    amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',

    -- Payment Status
    status payment_status NOT NULL DEFAULT 'pending',

    -- Payment Method
    payment_method VARCHAR(50) NOT NULL,
    payment_channel VARCHAR(50) NOT NULL,

    -- Flutterwave Response Data
    flutterwave_response JSONB NOT NULL DEFAULT '{}',

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

-- Create admins table for admin access
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendees_email ON attendees(email);
CREATE INDEX IF NOT EXISTS idx_attendees_registration_number ON attendees(registration_number);
CREATE INDEX IF NOT EXISTS idx_attendees_payment_status ON attendees(payment_status);
CREATE INDEX IF NOT EXISTS idx_attendees_registration_type ON attendees(registration_type);
CREATE INDEX IF NOT EXISTS idx_attendees_created_at ON attendees(created_at);
CREATE INDEX IF NOT EXISTS idx_attendees_referral_source ON attendees(referral_source);
CREATE INDEX IF NOT EXISTS idx_attendees_breakout_session ON attendees(breakout_session_choice);

CREATE INDEX IF NOT EXISTS idx_payments_transaction_ref ON payments(transaction_ref);
CREATE INDEX IF NOT EXISTS idx_payments_flutterwave_id ON payments(flutterwave_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_attendee_id ON payments(attendee_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

CREATE INDEX IF NOT EXISTS idx_session_registrations_attendee ON session_registrations(attendee_id);
CREATE INDEX IF NOT EXISTS idx_session_registrations_session ON session_registrations(session_id);

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

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
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
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Policies for attendees table
-- Allow public to insert (for registration)
CREATE POLICY "Allow public registration" ON attendees FOR INSERT WITH CHECK (true);

-- Allow attendees to view their own data
CREATE POLICY "Attendees can view own data" ON attendees FOR SELECT
    USING (auth.jwt() ->> 'email' = email);

-- Allow attendees to update their own data
CREATE POLICY "Attendees can update own data" ON attendees FOR UPDATE
    USING (auth.jwt() ->> 'email' = email);

-- Allow specific admin emails to view all attendees (replace with your admin email)
CREATE POLICY "Admins can view all attendees" ON attendees FOR SELECT
    USING (auth.jwt() ->> 'email' = 'admin@bisumconference.org');

-- Allow specific admin emails to manage all attendees
CREATE POLICY "Admins can manage all attendees" ON attendees FOR ALL
    USING (auth.jwt() ->> 'email' = 'admin@bisumconference.org');

-- Policies for payments table
-- Allow public to insert (for payment creation)
CREATE POLICY "Allow public payment creation" ON payments FOR INSERT WITH CHECK (true);

-- Allow attendees to view their own payments
CREATE POLICY "Attendees can view own payments" ON payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM attendees
            WHERE attendees.id = payments.attendee_id
            AND attendees.email = auth.jwt() ->> 'email'
        )
    );

-- Allow admin to view all payments
CREATE POLICY "Admins can view all payments" ON payments FOR ALL
    USING (auth.jwt() ->> 'email' = 'admin@bisumconference.org');

-- Allow admin to manage all payments
CREATE POLICY "Admins can manage all payments" ON payments FOR ALL
    USING (auth.jwt() ->> 'email' = 'admin@bisumconference.org');

-- Policies for sessions table
-- Allow public to view sessions
CREATE POLICY "Allow public to view sessions" ON sessions FOR SELECT USING (true);

-- Allow admin to manage sessions
CREATE POLICY "Admins can manage sessions" ON sessions FOR ALL
    USING (auth.jwt() ->> 'email' = 'admin@bisumconference.org');

-- Policies for session registrations
-- Allow attendees to register for sessions
CREATE POLICY "Attendees can register for sessions" ON session_registrations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM attendees
            WHERE attendees.id = session_registrations.attendee_id
            AND attendees.email = auth.jwt() ->> 'email'
        )
    );

-- Allow attendees to view their registrations
CREATE POLICY "Attendees can view own registrations" ON session_registrations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM attendees
            WHERE attendees.id = session_registrations.attendee_id
            AND attendees.email = auth.jwt() ->> 'email'
        )
    );

-- Allow attendees to cancel their registrations
CREATE POLICY "Attendees can cancel own registrations" ON session_registrations FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM attendees
            WHERE attendees.id = session_registrations.attendee_id
            AND attendees.email = auth.jwt() ->> 'email'
        )
    );

-- Allow admin to manage all session registrations
CREATE POLICY "Admins can manage all session registrations" ON session_registrations FOR ALL
    USING (auth.jwt() ->> 'email' = 'admin@bisumconference.org');

-- Policies for admins table
-- Allow authenticated users to view admins if they are in the admin table
CREATE POLICY "Admins can view other admins" ON admins FOR SELECT
    USING (auth.jwt() ->> 'email' = email);

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

-- Create registration statistics view
CREATE OR REPLACE VIEW registration_stats AS
SELECT
    COUNT(*) as total_registrations,
    COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_payments,
    COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_payments,
    COUNT(CASE WHEN payment_status = 'failed' THEN 1 END) as failed_payments,
    COUNT(CASE WHEN registration_type = 'student' THEN 1 END) as student_count,
    COUNT(CASE WHEN registration_type = 'professional' THEN 1 END) as professional_count,
    COUNT(CASE WHEN registration_type = 'speaker' THEN 1 END) as speaker_count,
    COUNT(CASE WHEN registration_type = 'sponsor' THEN 1 END) as sponsor_count,
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

-- Insert sample admin user (update email as needed)
INSERT INTO admins (email, full_name, role)
VALUES ('admin@bisumconference.org', 'Conference Administrator', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- Add column comments for documentation
COMMENT ON COLUMN attendees.expectations IS 'Optional field for attendee expectations from the conference';
COMMENT ON COLUMN attendees.referral_source IS 'Required field indicating how the attendee heard about the conference';
COMMENT ON COLUMN attendees.breakout_session_choice IS 'Required field for the attendees chosen breakout session';

-- Success message
SELECT 'BISUM Conference Database Schema created successfully with new registration fields!' as status;

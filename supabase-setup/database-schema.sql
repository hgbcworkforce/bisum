-- BISUM Conference Database Schema for Supabase
-- This script creates the necessary tables and policies for the conference registration system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE registration_type AS ENUM ('student', 'professional', 'speaker', 'sponsor');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE attendee_status AS ENUM ('active', 'cancelled', 'refunded');

-- Create attendees table
CREATE TABLE IF NOT EXISTS attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Personal Information
    first_name VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(first_name)) > 0),
    last_name VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(last_name)) > 0),
    email VARCHAR(255) NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    phone VARCHAR(20) NOT NULL CHECK (phone ~ '^\+?[0-9\s\-\(\)]{10,20}$'),

    -- Organization Information
    organization VARCHAR(100) NOT NULL CHECK (LENGTH(TRIM(organization)) > 0),
    position VARCHAR(100),

    -- Registration Details
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    registration_type registration_type NOT NULL,
    registration_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Payment Status
    payment_status payment_status NOT NULL DEFAULT 'pending',

    -- Additional Information
    dietary_restrictions TEXT,
    special_needs TEXT,
    session_preferences TEXT[] DEFAULT '{}',

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

    -- Timestamps
    initiated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Additional Information
    metadata JSONB DEFAULT '{}',

    -- Error Information (if payment failed)
    error_message TEXT,
    error_code VARCHAR(50)
);

-- Create sessions table (for conference sessions)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    speaker_name VARCHAR(100),
    speaker_bio TEXT,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    venue VARCHAR(100),
    capacity INTEGER CHECK (capacity > 0),
    category VARCHAR(50),
    is_keynote BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create session_registrations table (for tracking who's attending which sessions)
CREATE TABLE IF NOT EXISTS session_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attendee_id UUID NOT NULL REFERENCES attendees(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(attendee_id, session_id)
);

-- Create admins table for dashboard access
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendees_email ON attendees(email);
CREATE INDEX IF NOT EXISTS idx_attendees_registration_number ON attendees(registration_number);
CREATE INDEX IF NOT EXISTS idx_attendees_payment_status ON attendees(payment_status);
CREATE INDEX IF NOT EXISTS idx_attendees_registration_type ON attendees(registration_type);
CREATE INDEX IF NOT EXISTS idx_attendees_created_at ON attendees(created_at);

CREATE INDEX IF NOT EXISTS idx_payments_transaction_ref ON payments(transaction_ref);
CREATE INDEX IF NOT EXISTS idx_payments_flutterwave_id ON payments(flutterwave_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_attendee_id ON payments(attendee_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_sessions_category ON sessions(category);

CREATE INDEX IF NOT EXISTS idx_session_registrations_attendee ON session_registrations(attendee_id);
CREATE INDEX IF NOT EXISTS idx_session_registrations_session ON session_registrations(session_id);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_attendees_updated_at BEFORE UPDATE ON attendees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate registration number
CREATE OR REPLACE FUNCTION generate_registration_number()
RETURNS TRIGGER AS $$
DECLARE
    year_part TEXT;
    count_part TEXT;
    attendee_count INTEGER;
BEGIN
    -- Get current year
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;

    -- Get count of existing attendees
    SELECT COUNT(*) + 1 INTO attendee_count FROM attendees;

    -- Format count with leading zeros
    count_part := LPAD(attendee_count::TEXT, 4, '0');

    -- Generate registration number
    NEW.registration_number := 'BISUM/' || year_part || '/' || count_part;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for auto-generating registration numbers
CREATE TRIGGER generate_attendee_registration_number
    BEFORE INSERT ON attendees
    FOR EACH ROW
    WHEN (NEW.registration_number IS NULL OR NEW.registration_number = '')
    EXECUTE FUNCTION generate_registration_number();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
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
    USING (email = auth.jwt() ->> 'email');

-- Allow attendees to update their own data
CREATE POLICY "Attendees can update own data" ON attendees FOR UPDATE
    USING (email = auth.jwt() ->> 'email');

-- Allow admins to view all attendees
CREATE POLICY "Admins can view all attendees" ON attendees FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE email = auth.jwt() ->> 'email'
            AND is_active = true
        )
    );

-- Allow admins to update all attendees
CREATE POLICY "Admins can update all attendees" ON attendees FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE email = auth.jwt() ->> 'email'
            AND is_active = true
        )
    );

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

-- Allow admins to view all payments
CREATE POLICY "Admins can view all payments" ON payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE email = auth.jwt() ->> 'email'
            AND is_active = true
        )
    );

-- Allow admins to update payments
CREATE POLICY "Admins can update payments" ON payments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE email = auth.jwt() ->> 'email'
            AND is_active = true
        )
    );

-- Policies for sessions table
-- Allow public to view sessions
CREATE POLICY "Allow public to view sessions" ON sessions FOR SELECT WITH CHECK (true);

-- Allow admins to manage sessions
CREATE POLICY "Admins can manage sessions" ON sessions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE email = auth.jwt() ->> 'email'
            AND is_active = true
        )
    );

-- Policies for session_registrations table
-- Allow attendees to register for sessions
CREATE POLICY "Attendees can register for sessions" ON session_registrations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM attendees
            WHERE attendees.id = session_registrations.attendee_id
            AND attendees.email = auth.jwt() ->> 'email'
        )
    );

-- Allow attendees to view their session registrations
CREATE POLICY "Attendees can view own session registrations" ON session_registrations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM attendees
            WHERE attendees.id = session_registrations.attendee_id
            AND attendees.email = auth.jwt() ->> 'email'
        )
    );

-- Allow admins to view all session registrations
CREATE POLICY "Admins can view all session registrations" ON session_registrations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE email = auth.jwt() ->> 'email'
            AND is_active = true
        )
    );

-- Policies for admins table
-- Only admins can view admin table
CREATE POLICY "Admins can view admin table" ON admins FOR SELECT
    USING (
        email = auth.jwt() ->> 'email'
        AND is_active = true
    );

-- Create views for commonly used data
CREATE OR REPLACE VIEW attendee_summary AS
SELECT
    a.id,
    a.registration_number,
    a.first_name || ' ' || a.last_name AS full_name,
    a.email,
    a.phone,
    a.organization,
    a.position,
    a.registration_type,
    a.payment_status,
    a.status,
    a.registration_date,
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

-- Create view for payment statistics
CREATE OR REPLACE VIEW payment_statistics AS
SELECT
    COUNT(*) AS total_payments,
    SUM(amount) AS total_amount,
    COUNT(*) FILTER (WHERE status = 'completed') AS successful_payments,
    SUM(amount) FILTER (WHERE status = 'completed') AS successful_amount,
    COUNT(*) FILTER (WHERE status = 'pending') AS pending_payments,
    COUNT(*) FILTER (WHERE status = 'failed') AS failed_payments,
    ROUND(
        (COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / COUNT(*)) * 100, 2
    ) AS success_rate_percentage
FROM payments;

-- Create view for registration statistics
CREATE OR REPLACE VIEW registration_statistics AS
SELECT
    COUNT(*) AS total_registrations,
    COUNT(*) FILTER (WHERE status = 'active') AS active_registrations,
    COUNT(*) FILTER (WHERE payment_status = 'completed') AS completed_payments,
    COUNT(*) FILTER (WHERE payment_status = 'pending') AS pending_payments,
    COUNT(*) FILTER (WHERE registration_type = 'student') AS student_registrations,
    COUNT(*) FILTER (WHERE registration_type = 'professional') AS professional_registrations,
    COUNT(*) FILTER (WHERE registration_type = 'speaker') AS speaker_registrations,
    COUNT(*) FILTER (WHERE registration_type = 'sponsor') AS sponsor_registrations,
    ROUND(
        (COUNT(*) FILTER (WHERE payment_status = 'completed')::DECIMAL / COUNT(*)) * 100, 2
    ) AS payment_completion_rate
FROM attendees;

-- Insert some sample sessions
INSERT INTO sessions (title, description, speaker_name, speaker_bio, session_date, start_time, end_time, venue, capacity, category, is_keynote) VALUES
('Opening Keynote: Future of Technology in Nigeria', 'An inspiring talk about the technological landscape in Nigeria', 'Dr. Adebayo Ogundimu', 'Renowned tech leader and entrepreneur', CURRENT_DATE + INTERVAL '30 days', '09:00:00', '10:30:00', 'Main Auditorium', 500, 'keynote', true),
('Building Scalable Web Applications', 'Learn how to build applications that can handle millions of users', 'Sarah Johnson', 'Senior Software Engineer at Google', CURRENT_DATE + INTERVAL '30 days', '11:00:00', '12:00:00', 'Tech Hall A', 100, 'technical', false),
('Entrepreneurship in the Digital Age', 'Starting and scaling a tech business in today\'s market', 'Chika Nwobi', 'CEO of L5Lab', CURRENT_DATE + INTERVAL '30 days', '14:00:00', '15:00:00', 'Business Hall', 150, 'business', false),
('AI and Machine Learning Workshop', 'Hands-on workshop on implementing ML solutions', 'Prof. Kemi Adeyeye', 'AI Research Lead', CURRENT_DATE + INTERVAL '30 days', '15:30:00', '17:00:00', 'Workshop Room 1', 50, 'workshop', false);

-- Create initial admin user (you should change this email to your actual admin email)
INSERT INTO admins (email, full_name, role, is_active) VALUES
('admin@bisum.org', 'BISUM Admin', 'super_admin', true);

-- Grant necessary permissions (run these as superuser if needed)
-- GRANT USAGE ON SCHEMA public TO anon, authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create function to cleanup old pending payments (run daily)
CREATE OR REPLACE FUNCTION cleanup_old_pending_payments()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete payments that have been pending for more than 24 hours
    DELETE FROM payments
    WHERE status = 'pending'
    AND created_at < NOW() - INTERVAL '24 hours';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    -- Update corresponding attendee payment status
    UPDATE attendees
    SET payment_status = 'failed', updated_at = NOW()
    WHERE payment_status = 'pending'
    AND NOT EXISTS (
        SELECT 1 FROM payments
        WHERE payments.attendee_id = attendees.id
        AND payments.status IN ('pending', 'completed')
    );

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE attendees IS 'Conference attendees registration data';
COMMENT ON TABLE payments IS 'Payment records for conference registrations';
COMMENT ON TABLE sessions IS 'Conference sessions and workshops';
COMMENT ON TABLE session_registrations IS 'Attendee registrations for specific sessions';
COMMENT ON TABLE admins IS 'Admin users for dashboard access';

COMMENT ON FUNCTION generate_registration_number() IS 'Automatically generates unique registration numbers';
COMMENT ON FUNCTION cleanup_old_pending_payments() IS 'Cleans up old pending payments that were never completed';

-- Final message
DO $$
BEGIN
    RAISE NOTICE 'BISUM Conference database schema created successfully!';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update admin email in the admins table';
    RAISE NOTICE '2. Configure your Supabase environment variables';
    RAISE NOTICE '3. Set up Flutterwave payment integration';
    RAISE NOTICE '4. Test the registration and payment flow';
END $$;

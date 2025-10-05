-- BISUM Conference - Simple Permissions Fix
-- Fixes registration permission issues without admin table dependencies
-- Run this in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- First, let's check what tables exist and create missing ones if needed
-- Create attendees table if it doesn't exist (with all required fields)
CREATE TABLE IF NOT EXISTS attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Personal Information
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,

    -- Registration Details
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    registration_type VARCHAR(20) NOT NULL DEFAULT 'professional',
    registration_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Payment Status
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',

    -- New Registration Form Fields
    expectations TEXT,
    referral_source VARCHAR(50) NOT NULL,
    breakout_session_choice VARCHAR(50) NOT NULL,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'active',

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create payments table if it doesn't exist
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
    status VARCHAR(20) NOT NULL DEFAULT 'pending',

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

-- Remove all existing policies that might be causing conflicts
DROP POLICY IF EXISTS "Allow public registration" ON attendees;
DROP POLICY IF EXISTS "Enable public registration" ON attendees;
DROP POLICY IF EXISTS "Attendees can view own data" ON attendees;
DROP POLICY IF EXISTS "Attendees can update own data" ON attendees;
DROP POLICY IF EXISTS "Admin full access to attendees" ON attendees;
DROP POLICY IF EXISTS "Admins can view all attendees" ON attendees;
DROP POLICY IF EXISTS "Admins can manage all attendees" ON attendees;

DROP POLICY IF EXISTS "Allow public payment creation" ON payments;
DROP POLICY IF EXISTS "Enable public payment creation" ON payments;
DROP POLICY IF EXISTS "Attendees can view own payments" ON payments;
DROP POLICY IF EXISTS "Admin full access to payments" ON payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
DROP POLICY IF EXISTS "Admins can manage all payments" ON payments;

-- Enable Row Level Security
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create simple, permissive policies for public registration
CREATE POLICY "public_registration_insert" ON attendees
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "public_registration_select" ON attendees
    FOR SELECT
    USING (true);

CREATE POLICY "public_payment_insert" ON payments
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "public_payment_select" ON payments
    FOR SELECT
    USING (true);

-- Grant necessary permissions to anonymous users
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant table permissions
GRANT ALL ON attendees TO anon;
GRANT ALL ON attendees TO authenticated;

GRANT ALL ON payments TO anon;
GRANT ALL ON payments TO authenticated;

-- Grant sequence permissions for UUID generation
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create or replace the registration number generation function
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

-- Create trigger function for auto-generating registration numbers
CREATE OR REPLACE FUNCTION auto_generate_registration_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.registration_number IS NULL OR NEW.registration_number = '' THEN
        NEW.registration_number := generate_registration_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS trigger_auto_registration_number ON attendees;
CREATE TRIGGER trigger_auto_registration_number
    BEFORE INSERT ON attendees
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_registration_number();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers
DROP TRIGGER IF EXISTS update_attendees_updated_at ON attendees;
CREATE TRIGGER update_attendees_updated_at
    BEFORE UPDATE ON attendees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create useful indexes for performance
CREATE INDEX IF NOT EXISTS idx_attendees_email ON attendees(email);
CREATE INDEX IF NOT EXISTS idx_attendees_registration_number ON attendees(registration_number);
CREATE INDEX IF NOT EXISTS idx_attendees_payment_status ON attendees(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_attendee_id ON payments(attendee_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_ref ON payments(transaction_ref);

-- Test the permissions
DO $$
BEGIN
    -- Test if anon role has INSERT permission on attendees
    IF has_table_privilege('anon', 'attendees', 'INSERT') THEN
        RAISE NOTICE '✅ SUCCESS: Anonymous users can register (INSERT attendees)';
    ELSE
        RAISE NOTICE '❌ FAILED: Anonymous users cannot register';
    END IF;

    -- Test if anon role has INSERT permission on payments
    IF has_table_privilege('anon', 'payments', 'INSERT') THEN
        RAISE NOTICE '✅ SUCCESS: Anonymous users can create payments (INSERT payments)';
    ELSE
        RAISE NOTICE '❌ FAILED: Anonymous users cannot create payments';
    END IF;
END $$;

-- Final success message
SELECT
    'Database permissions fixed! Registration should now work.' as status,
    'Tables: attendees, payments created/updated' as tables_status,
    'Policies: Public registration enabled' as policies_status,
    'Permissions: Anonymous INSERT/SELECT granted' as permissions_status;

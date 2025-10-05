# BISUM Conference - Quick Fix for "admins table does not exist" Error

## 🚨 IMMEDIATE FIX REQUIRED

You're getting the error `ERROR: 42P01: relation "admins" does not exist` because your database is missing some tables from the complete schema.

## 🛠️ Step 1: Run This SQL First (MOST IMPORTANT)

Copy and paste this **ENTIRE** SQL script into your Supabase SQL Editor and run it:

```sql
-- BISUM Conference - Complete Database Setup
-- This will create all missing tables and fix permissions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE registration_type AS ENUM ('student', 'professional', 'speaker', 'sponsor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE attendee_status AS ENUM ('active', 'cancelled', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE referral_source AS ENUM ('church', 'instagram', 'recommendation_from_friend', 'whatsapp', 'facebook', 'flyer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE breakout_session_choice AS ENUM ('investment', 'tech', 'fashion', 'agriculture', 'foods');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create attendees table (if not exists)
CREATE TABLE IF NOT EXISTS attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(first_name)) > 0),
    last_name VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(last_name)) > 0),
    email VARCHAR(255) NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    phone VARCHAR(20) NOT NULL CHECK (phone ~ '^\+?[0-9\s\-\(\)]{10,20}$'),
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    registration_type registration_type NOT NULL,
    registration_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    payment_status payment_status NOT NULL DEFAULT 'pending',
    expectations TEXT,
    referral_source referral_source NOT NULL,
    breakout_session_choice breakout_session_choice NOT NULL,
    status attendee_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create payments table (if not exists)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_ref VARCHAR(100) NOT NULL UNIQUE,
    flutterwave_transaction_id VARCHAR(100) NOT NULL UNIQUE,
    attendee_id UUID NOT NULL REFERENCES attendees(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
    status payment_status NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50) NOT NULL,
    payment_channel VARCHAR(50) NOT NULL,
    flutterwave_response JSONB NOT NULL DEFAULT '{}',
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create sessions table (if not exists)
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

-- Create admins table (THE MISSING TABLE!)
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default admin user (CHANGE THIS EMAIL TO YOUR ACTUAL ADMIN EMAIL!)
INSERT INTO admins (email, full_name, role, is_active)
VALUES ('admin@bisumconference.org', 'Conference Administrator', 'super_admin', true)
ON CONFLICT (email) DO NOTHING;

-- DROP ALL EXISTING POLICIES TO START FRESH
DROP POLICY IF EXISTS "Allow public registration" ON attendees;
DROP POLICY IF EXISTS "Enable public registration" ON attendees;
DROP POLICY IF EXISTS "public_registration_insert" ON attendees;
DROP POLICY IF EXISTS "public_registration_select" ON attendees;
DROP POLICY IF EXISTS "Attendees can view own data" ON attendees;
DROP POLICY IF EXISTS "Admin full access to attendees" ON attendees;

DROP POLICY IF EXISTS "Allow public payment creation" ON payments;
DROP POLICY IF EXISTS "Enable public payment creation" ON payments;
DROP POLICY IF EXISTS "public_payment_insert" ON payments;
DROP POLICY IF EXISTS "public_payment_select" ON payments;
DROP POLICY IF EXISTS "Admin full access to payments" ON payments;

-- Enable Row Level Security
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create PUBLIC REGISTRATION policies (this is what fixes the permission error)
CREATE POLICY "public_can_register" ON attendees
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "public_can_view_attendees" ON attendees
    FOR SELECT
    USING (true);

CREATE POLICY "public_can_create_payments" ON payments
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "public_can_view_payments" ON payments
    FOR SELECT
    USING (true);

CREATE POLICY "public_can_view_sessions" ON sessions
    FOR SELECT
    USING (true);

-- Admin policies (now the admins table exists)
CREATE POLICY "admins_full_access_attendees" ON attendees
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE email = auth.jwt() ->> 'email'
            AND is_active = true
        )
    );

CREATE POLICY "admins_full_access_payments" ON payments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE email = auth.jwt() ->> 'email'
            AND is_active = true
        )
    );

CREATE POLICY "admins_can_view_admins" ON admins
    FOR SELECT
    USING (auth.jwt() ->> 'email' = email);

-- Grant permissions to anonymous users (CRITICAL FOR PUBLIC REGISTRATION)
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

GRANT INSERT, SELECT ON attendees TO anon;
GRANT ALL ON attendees TO authenticated;

GRANT INSERT, SELECT ON payments TO anon;
GRANT ALL ON payments TO authenticated;

GRANT SELECT ON sessions TO anon;
GRANT SELECT ON sessions TO authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Registration number generation function
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
    SELECT COUNT(*) + 1 INTO counter
    FROM attendees
    WHERE registration_number LIKE 'BISUM' || year_suffix || '%';
    reg_number := 'BISUM' || year_suffix || LPAD(counter::VARCHAR, 3, '0');
    RETURN reg_number;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate registration numbers
CREATE OR REPLACE FUNCTION auto_generate_registration_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.registration_number IS NULL OR NEW.registration_number = '' THEN
        NEW.registration_number := generate_registration_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_registration_number ON attendees;
CREATE TRIGGER trigger_auto_registration_number
    BEFORE INSERT ON attendees
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_registration_number();

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_attendees_updated_at ON attendees;
CREATE TRIGGER update_attendees_updated_at BEFORE UPDATE ON attendees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_attendees_email ON attendees(email);
CREATE INDEX IF NOT EXISTS idx_attendees_registration_number ON attendees(registration_number);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_ref ON payments(transaction_ref);
CREATE INDEX IF NOT EXISTS idx_payments_attendee_id ON payments(attendee_id);

-- Test permissions
SELECT 
    CASE 
        WHEN has_table_privilege('anon', 'attendees', 'INSERT') THEN '✅ ATTENDEES INSERT: ENABLED'
        ELSE '❌ ATTENDEES INSERT: DISABLED'
    END as attendees_permission,
    CASE 
        WHEN has_table_privilege('anon', 'payments', 'INSERT') THEN '✅ PAYMENTS INSERT: ENABLED'
        ELSE '❌ PAYMENTS INSERT: DISABLED'
    END as payments_permission,
    'All tables created successfully!' as status;
```

## 📍 Where to Run This SQL:

1. **Go to your Supabase Dashboard**
2. **Click on "SQL Editor"** (in the left sidebar)
3. **Paste the ENTIRE SQL script above**
4. **Click "Run"**

## ⚠️ IMPORTANT: Update Admin Email

In the SQL above, find this line:
```sql
VALUES ('admin@bisumconference.org', 'Conference Administrator', 'super_admin', true)
```

**Replace `admin@bisumconference.org` with your actual admin email address!**

## 🔧 Step 2: Check Your Environment Variables

Make sure your `client/.env` file looks like this:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key_here
```

## 🚀 Step 3: Restart Your Application

```bash
cd bisum-conference/client
npm run dev
```

## ✅ What This Fixes:

- ✅ Creates the missing `admins` table
- ✅ Creates all other required tables (attendees, payments, sessions)
- ✅ Sets up proper Row Level Security policies
- ✅ Grants anonymous users permission to register
- ✅ Sets up auto-generated registration numbers
- ✅ Creates all necessary indexes and triggers

## 🎯 Test Registration:

1. Open your registration page
2. Fill out the form
3. Submit it
4. You should NO LONGER see "Permission denied" error

## 🆘 If You Still Get Errors:

1. **Check the browser console** (F12 → Console) for specific error messages
2. **Look at the Supabase logs** in your dashboard under "Logs"
3. **Make sure you updated the admin email** in the SQL script
4. **Verify your environment variables** are correct

The registration should now work without any permission errors!
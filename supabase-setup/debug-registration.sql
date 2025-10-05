-- Debug Registration Issues
-- This script helps identify what's going wrong with the registration process
-- Run this in Supabase SQL Editor to debug the registration form data

-- Check the current table structure
SELECT
    'attendees table structure:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'attendees'
ORDER BY ordinal_position;

-- Check if required enum types exist and their values
SELECT
    'registration_type enum values:' as info,
    enumlabel as value
FROM pg_enum
JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
WHERE pg_type.typname = 'registration_type'
ORDER BY enumsortorder;

SELECT
    'referral_source enum values:' as info,
    enumlabel as value
FROM pg_enum
JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
WHERE pg_type.typname = 'referral_source'
ORDER BY enumsortorder;

SELECT
    'breakout_session_choice enum values:' as info,
    enumlabel as value
FROM pg_enum
JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
WHERE pg_type.typname = 'breakout_session_choice'
ORDER BY enumsortorder;

-- Check current RLS policies on attendees
SELECT
    'attendees RLS policies:' as info,
    policyname,
    cmd as policy_type,
    permissive,
    roles
FROM pg_policies
WHERE tablename = 'attendees'
ORDER BY policyname;

-- Test if we can manually insert a record (this will show us exactly what's missing)
DO $$
DECLARE
    test_id UUID;
    reg_number VARCHAR(50);
BEGIN
    -- Generate a registration number
    SELECT generate_registration_number() INTO reg_number;

    RAISE NOTICE 'Generated registration number: %', reg_number;

    -- Try to insert a minimal test record
    BEGIN
        INSERT INTO attendees (
            first_name,
            last_name,
            email,
            phone,
            registration_number,
            registration_type,
            referral_source,
            breakout_session_choice
        ) VALUES (
            'Test',
            'User',
            'test' || EXTRACT(EPOCH FROM NOW())::bigint || '@example.com',
            '+2348012345678',
            reg_number,
            'professional',
            'church',
            'tech'
        ) RETURNING id INTO test_id;

        RAISE NOTICE 'SUCCESS: Test record inserted with ID: %', test_id;

        -- Clean up
        DELETE FROM attendees WHERE id = test_id;
        RAISE NOTICE 'Test record cleaned up successfully';

    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR inserting test record: %', SQLERRM;
        RAISE NOTICE 'SQLSTATE: %', SQLSTATE;
    END;
END $$;

-- Check if the registration number generation function exists and works
SELECT
    'Testing registration number function:' as info,
    generate_registration_number() as generated_number;

-- Check current permissions
SELECT
    'Table permissions:' as info,
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'attendees';

-- Check if there are any existing attendees (to see the current data format)
SELECT
    'Existing attendees count:' as info,
    COUNT(*) as total_count
FROM attendees;

-- If there are existing records, show their structure
SELECT
    'Sample attendee data:' as info,
    first_name,
    last_name,
    email,
    registration_type,
    referral_source,
    breakout_session_choice,
    created_at
FROM attendees
ORDER BY created_at DESC
LIMIT 3;

-- Final check - show what fields are NOT NULL
SELECT
    'Required fields (NOT NULL):' as info,
    column_name
FROM information_schema.columns
WHERE table_name = 'attendees'
    AND is_nullable = 'NO'
    AND column_default IS NULL
ORDER BY column_name;

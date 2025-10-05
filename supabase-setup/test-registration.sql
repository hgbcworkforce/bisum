-- Test Registration Script
-- This script helps test if the registration system is working correctly
-- Run this in your Supabase SQL Editor to identify issues

-- First, let's check if the tables exist and their structure
DO $$
BEGIN
    RAISE NOTICE '=== CHECKING DATABASE STRUCTURE ===';
END $$;

-- Check if attendees table exists and show its structure
SELECT
    'attendees table structure:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'attendees'
ORDER BY ordinal_position;

-- Check if required enum types exist
SELECT
    'Enum types:' as info,
    typname as enum_name,
    string_agg(enumlabel, ', ' ORDER BY enumsortorder) as enum_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE typname IN ('registration_type', 'payment_status', 'referral_source', 'breakout_session_choice', 'attendee_status')
GROUP BY typname;

-- Check current RLS status
SELECT
    'RLS Status:' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    forcerowsecurity as force_rls
FROM pg_tables
WHERE tablename IN ('attendees', 'payments', 'sessions', 'session_registrations', 'admins')
ORDER BY tablename;

-- Check existing policies
SELECT
    'Current Policies:' as info,
    schemaname,
    tablename,
    policyname,
    cmd as policy_command,
    roles
FROM pg_policies
WHERE tablename IN ('attendees', 'payments', 'sessions', 'session_registrations', 'admins')
ORDER BY tablename, policyname;

-- Test basic functionality
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== TESTING BASIC FUNCTIONALITY ===';
END $$;

-- Try to insert a test record (this will show if the basic structure works)
-- We'll use a DO block to catch errors gracefully
DO $$
DECLARE
    test_id UUID;
BEGIN
    -- Generate a test registration number
    INSERT INTO attendees (
        first_name,
        last_name,
        email,
        phone,
        registration_number,
        registration_type,
        referral_source,
        breakout_session_choice,
        expectations
    ) VALUES (
        'Test',
        'User',
        'test' || EXTRACT(EPOCH FROM NOW())::bigint || '@example.com',
        '+2348012345678',
        'TEST' || EXTRACT(EPOCH FROM NOW())::bigint,
        'professional',
        'church',
        'tech',
        'Testing registration system'
    ) RETURNING id INTO test_id;

    RAISE NOTICE 'SUCCESS: Test attendee created with ID: %', test_id;

    -- Clean up the test record
    DELETE FROM attendees WHERE id = test_id;
    RAISE NOTICE 'SUCCESS: Test attendee cleaned up';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERROR: Failed to create test attendee';
    RAISE NOTICE 'Error details: % %', SQLERRM, SQLSTATE;
END $$;

-- Check if the registration number generation function exists
SELECT
    'Functions:' as info,
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines
WHERE routine_name IN ('generate_registration_number', 'update_updated_at_column')
ORDER BY routine_name;

-- Check indexes
SELECT
    'Indexes:' as info,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('attendees', 'payments', 'sessions', 'session_registrations', 'admins')
ORDER BY tablename, indexname;

-- Check admin users
SELECT
    'Admin Users:' as info,
    id,
    email,
    full_name,
    role,
    created_at
FROM admins;

-- Final summary
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== TEST COMPLETE ===';
    RAISE NOTICE 'If you see any errors above, those need to be fixed first.';
    RAISE NOTICE 'If everything looks good, try the registration form again.';
    RAISE NOTICE '';
    RAISE NOTICE 'Common issues to check:';
    RAISE NOTICE '1. Make sure all enum types exist';
    RAISE NOTICE '2. Check that RLS policies allow INSERT operations';
    RAISE NOTICE '3. Verify the admin email in policies matches your actual email';
    RAISE NOTICE '4. Ensure GRANT permissions are set correctly';
END $$;

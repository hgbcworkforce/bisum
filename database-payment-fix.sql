-- BISUM Conference Database Payment Fix
-- Fixes the registration and payment flow issues
-- Run this in your Supabase SQL Editor

-- First, let's modify the payments table to allow temporary null attendee_id
-- This will be updated once the attendee is created
ALTER TABLE payments
DROP CONSTRAINT IF EXISTS payments_attendee_id_fkey;

-- Make attendee_id nullable temporarily during payment creation
ALTER TABLE payments
ALTER COLUMN attendee_id DROP NOT NULL;

-- Re-add the foreign key constraint but allow NULL values
ALTER TABLE payments
ADD CONSTRAINT payments_attendee_id_fkey
FOREIGN KEY (attendee_id) REFERENCES attendees(id) ON DELETE CASCADE;

-- Create a function to handle payment-first registration flow
CREATE OR REPLACE FUNCTION complete_payment_registration(
    payment_transaction_ref VARCHAR,
    attendee_data JSONB
) RETURNS JSONB AS $$
DECLARE
    new_attendee_id UUID;
    payment_record RECORD;
    result JSONB;
BEGIN
    -- Get the payment record
    SELECT * INTO payment_record
    FROM payments
    WHERE transaction_ref = payment_transaction_ref;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Payment not found');
    END IF;

    -- Create the attendee record
    INSERT INTO attendees (
        first_name,
        last_name,
        email,
        phone,
        registration_type,
        expectations,
        referral_source,
        breakout_session_choice,
        payment_status,
        status
    ) VALUES (
        attendee_data->>'first_name',
        attendee_data->>'last_name',
        attendee_data->>'email',
        attendee_data->>'phone',
        (attendee_data->>'registration_type')::registration_type,
        attendee_data->>'expectations',
        (attendee_data->>'referral_source')::referral_source,
        (attendee_data->>'breakout_session_choice')::breakout_session_choice,
        'pending'::payment_status,
        'active'::attendee_status
    ) RETURNING id INTO new_attendee_id;

    -- Update the payment record with the attendee_id
    UPDATE payments
    SET attendee_id = new_attendee_id,
        updated_at = NOW()
    WHERE transaction_ref = payment_transaction_ref;

    -- Return success with attendee data
    SELECT jsonb_build_object(
        'success', true,
        'attendee_id', new_attendee_id,
        'payment_id', payment_record.id,
        'registration_number', (SELECT registration_number FROM attendees WHERE id = new_attendee_id)
    ) INTO result;

    RETURN result;

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a simpler function to link existing attendee to payment
CREATE OR REPLACE FUNCTION link_attendee_to_payment(
    payment_transaction_ref VARCHAR,
    attendee_email VARCHAR
) RETURNS JSONB AS $$
DECLARE
    attendee_record RECORD;
    payment_record RECORD;
    result JSONB;
BEGIN
    -- Get the attendee record
    SELECT * INTO attendee_record
    FROM attendees
    WHERE email = attendee_email;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Attendee not found');
    END IF;

    -- Get the payment record
    SELECT * INTO payment_record
    FROM payments
    WHERE transaction_ref = payment_transaction_ref;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Payment not found');
    END IF;

    -- Update the payment record with the attendee_id
    UPDATE payments
    SET attendee_id = attendee_record.id,
        updated_at = NOW()
    WHERE transaction_ref = payment_transaction_ref;

    -- Update attendee payment status if payment is successful
    IF payment_record.status = 'completed' THEN
        UPDATE attendees
        SET payment_status = 'completed'::payment_status,
            updated_at = NOW()
        WHERE id = attendee_record.id;
    END IF;

    -- Return success
    SELECT jsonb_build_object(
        'success', true,
        'attendee_id', attendee_record.id,
        'payment_id', payment_record.id,
        'registration_number', attendee_record.registration_number
    ) INTO result;

    RETURN result;

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for payments with attendee info (handling null attendee_id)
CREATE OR REPLACE VIEW payments_with_attendees AS
SELECT
    p.*,
    CASE
        WHEN p.attendee_id IS NOT NULL THEN
            jsonb_build_object(
                'id', a.id,
                'first_name', a.first_name,
                'last_name', a.last_name,
                'email', a.email,
                'registration_number', a.registration_number,
                'registration_type', a.registration_type
            )
        ELSE
            jsonb_build_object(
                'id', null,
                'first_name', p.flutterwave_response->>'attendeeName',
                'last_name', '',
                'email', p.flutterwave_response->>'attendeeEmail',
                'registration_number', null,
                'registration_type', p.flutterwave_response->>'registrationType'
            )
    END as attendee_info
FROM payments p
LEFT JOIN attendees a ON p.attendee_id = a.id;

-- Grant permissions for the new functions
GRANT EXECUTE ON FUNCTION complete_payment_registration(VARCHAR, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_payment_registration(VARCHAR, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION link_attendee_to_payment(VARCHAR, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION link_attendee_to_payment(VARCHAR, VARCHAR) TO anon;

-- Grant access to the new view
GRANT SELECT ON payments_with_attendees TO authenticated;
GRANT SELECT ON payments_with_attendees TO anon;

-- Update the public policies to handle null attendee_id
DROP POLICY IF EXISTS "public_can_create_payments" ON payments;
CREATE POLICY "public_can_create_payments" ON payments
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "public_can_view_payments" ON payments;
CREATE POLICY "public_can_view_payments" ON payments
    FOR SELECT
    USING (true);

-- Allow updates to payments for linking attendees
CREATE POLICY "public_can_update_payments" ON payments
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Test the new setup
DO $$
DECLARE
    test_result JSONB;
BEGIN
    -- Test that we can create a payment without attendee_id
    BEGIN
        INSERT INTO payments (
            transaction_ref,
            flutterwave_transaction_id,
            attendee_id,
            amount,
            currency,
            status,
            payment_method,
            payment_channel,
            flutterwave_response
        ) VALUES (
            'TEST_' || extract(epoch from now()),
            'FW_TEST_' || extract(epoch from now()),
            NULL, -- This should now be allowed
            2000,
            'NGN',
            'pending',
            'card',
            'web',
            '{}'
        );

        RAISE NOTICE '✅ SUCCESS: Can create payment without attendee_id';

        -- Clean up test record
        DELETE FROM payments WHERE transaction_ref LIKE 'TEST_%';

    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ FAILED: Cannot create payment without attendee_id: %', SQLERRM;
    END;
END $$;

-- Success message
SELECT
    '✅ Database payment flow fixed!' as status,
    'Payments can now be created without attendee_id' as payments_status,
    'Use complete_payment_registration() or link_attendee_to_payment() functions' as helper_functions,
    'Remember to link attendee_id after attendee creation' as important_note;

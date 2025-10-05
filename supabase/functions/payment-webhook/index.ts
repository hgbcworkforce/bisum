// Supabase Edge Function: /functions/payment-webhook/index.ts
// This function handles the payment webhook from Flutterwave.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

// --- IMPORTANT: Environment Variables ---
// You must set these in your Supabase project's Edge Function settings.
// 1. SUPABASE_URL: Your project's URL.
// 2. SUPABASE_ANON_KEY: Your project's anon key.
// 3. FLUTTERWAVE_SECRET_HASH: A secret hash you define. You must provide this same hash
//    in your Flutterwave dashboard's webhook settings for verification.

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_ANON_KEY") ?? ""
);

serve(async (req) => {
  const flutterwaveSignature = req.headers.get("verif-hash");
  const secretHash = Deno.env.get("FLUTTERWAVE_SECRET_HASH");

  // 1. Verify the webhook signature
  if (!flutterwaveSignature || flutterwaveSignature !== secretHash) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const payload = await req.json();

    // 2. Check if the payment was successful
    if (payload.event === "charge.completed" && payload.data.status === "successful") {
      const paymentData = payload.data;
      const registrationData = paymentData.meta?.registrationData;

      // 3. Ensure registration data is present
      if (!registrationData) {
        console.error("Webhook Error: Missing registration data in metadata");
        // Return 200 OK to prevent Flutterwave from retrying a webhook that will never succeed.
        return new Response("Missing registration data", { status: 200 });
      }

      // 4. Check if this transaction has already been processed
      const { data: existingPayment, error: paymentCheckError } = await supabase
        .from("payments")
        .select("id")
        .eq("flutterwave_transaction_id", paymentData.id)
        .single();

      if (paymentCheckError && paymentCheckError.code !== 'PGRST116') { // Ignore 'not found' error
        console.error("Error checking for existing payment:", paymentCheckError);
        return new Response("Internal Server Error", { status: 500 });
      }

      if (existingPayment) {
        console.log("Webhook Info: Transaction already processed.", paymentData.id);
        return new Response("Transaction already processed", { status: 200 });
      }

      // 5. Create the Attendee (Registration)
      const registrationNumber = `BISUM${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
      const { data: newAttendee, error: attendeeError } = await supabase
        .from("attendees")
        .insert({
          first_name: registrationData.firstName,
          last_name: registrationData.lastName,
          email: registrationData.email,
          phone: registrationData.phoneNumber,
          registration_type: registrationData.registrationType,
          registration_number: registrationNumber,
          expectations: registrationData.expectations,
          referral_source: registrationData.referralSource,
          breakout_session_choice: registrationData.breakoutSessionChoice,
          payment_status: 'completed' // Set payment status
        })
        .select()
        .single();

      if (attendeeError) {
        // Handle potential duplicate email error gracefully
        if (attendeeError.code === '23505') { // Unique constraint violation
          console.warn("Webhook Warning: Attendee with this email already exists.", registrationData.email);
          // Still return 200 so Flutterwave doesn't retry.
          return new Response("Attendee already exists", { status: 200 });
        }
        console.error("Error creating attendee:", attendeeError);
        return new Response("Failed to create attendee", { status: 500 });
      }

      // 6. Create the Payment Record
      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          attendee_id: newAttendee.id,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: 'completed',
          transaction_ref: paymentData.tx_ref,
          flutterwave_transaction_id: paymentData.id,
          payment_method: paymentData.payment_type,
          flutterwave_response: payload, // Store the full webhook payload for reference
          paid_at: new Date().toISOString(),
        });

      if (paymentError) {
        console.error("Error creating payment record:", paymentError);
        // This is tricky. The attendee was created but the payment record failed.
        // This requires manual intervention, but we can't fail the webhook.
        return new Response("Failed to create payment record", { status: 500 });
      }

      console.log("Successfully processed payment for:", newAttendee.email);
    }

    // 7. Acknowledge receipt of the webhook
    return new Response("Webhook received", { status: 200 });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});

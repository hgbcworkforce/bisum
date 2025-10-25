// Supabase Edge Function: /functions/verify-payment/index.ts
// This function verifies a Paystack payment and creates the registration.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_ANON_KEY") ?? "",
);

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY") ?? "";

serve(async (req) => {
  const url = new URL(req.url);
  const transactionRef = url.searchParams.get("transaction_ref");

  if (!transactionRef) {
    return new Response(
      JSON.stringify({ error: "Transaction reference is required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    // 1. Verify the transaction with Paystack
    const verificationResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${transactionRef}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!verificationResponse.ok) {
      throw new Error("Failed to verify transaction with Paystack");
    }

    const verificationData = await verificationResponse.json();

    // 2. Check if the payment was successful
    if (verificationData.data.status === "success") {
      const paymentData = verificationData.data;
      const registrationData = paymentData.metadata?.registrationData;

      if (!registrationData) {
        return new Response(
          JSON.stringify({ error: "Missing registration data in metadata" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // 3. Check if this transaction has already been processed
      const { data: existingPayment } = await supabase
        .from("payments")
        .select("id")
        .eq("transaction_ref", transactionRef)
        .single();

      if (existingPayment) {
        return new Response(
          JSON.stringify({
            success: true,
            message: "Transaction already processed",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // 4. Create the Attendee
      const registrationNumber = `BISUM${new Date().getFullYear()}${String(
        Date.now(),
      ).slice(-6)}`;
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
          payment_status: "completed",
        })
        .select()
        .single();

      if (attendeeError) {
        if (attendeeError.code === "23505") {
          return new Response(
            JSON.stringify({
              success: true,
              message: "Attendee already exists",
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
        throw attendeeError;
      }

      // 5. Create the Payment Record
      await supabase.from("payments").insert({
        attendee_id: newAttendee.id,
        amount: paymentData.amount / 100, //Paystack sends amount in kobo
        currency: paymentData.currency,
        status: "completed",
        transaction_ref: transactionRef,
        payment_method: "paystack",
        paystack_response: verificationData,
        paid_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({ success: true, data: newAttendee }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } else {
      return new Response(JSON.stringify({ error: "Payment not successful" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Verification error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

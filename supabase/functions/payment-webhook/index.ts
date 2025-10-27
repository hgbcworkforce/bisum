// Supabase Edge Function: /functions/payment-webhook/index.ts
// This function handles the payment webhook from Paystack.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
import { crypto } from "https://deno.land/std@0.185.0/crypto/mod.ts";

// --- IMPORTANT: Environment Variables ---
// You must set these in your Supabase project's Edge Function settings.
// 1. SUPABASE_URL: Your project's URL.
// 2. SUPABASE_ANON_KEY: Your project's anon key.
// 3. PAYSTACK_SECRET_KEY: Your Paystack secret key.

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_ANON_KEY") ?? "",
);

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY") ?? "";

async function verifyPaystackSignature(
  req: Request,
  payload: any,
): Promise<boolean> {
  const signature = req.headers.get("x-paystack-signature");
  if (!signature) {
    console.error("No signature found");
    return false;
  }

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(PAYSTACK_SECRET_KEY),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign", "verify"],
    );

    const signed = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(JSON.stringify(payload)),
    );

    const expectedSignature = Array.from(new Uint8Array(signed))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (signature === expectedSignature) {
      return true;
    } else {
      console.error("Invalid signature");
      return false;
    }
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}

serve(async (req) => {
  try {
    const payload = await req.json();

    if (!(await verifyPaystackSignature(req, payload))) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 2. Check if the event is payment success
    if (payload.event === "charge.success") {
      const paymentData = payload.data;
      const registrationData = paymentData.metadata?.registrationData;

      // 3. Ensure registration data is present
      if (!registrationData) {
        console.error("Webhook Error: Missing registration data in metadata");
        return new Response("Missing registration data", { status: 400 });
      }

      // 4. Check if this transaction has already been processed
      const { data: existingPayment, error: paymentCheckError } = await supabase
        .from("payments")
        .select("id")
        .eq("transaction_ref", paymentData.reference)
        .single();

      if (paymentCheckError && paymentCheckError.code !== "PGRST116") {
        // Ignore 'not found' error
        console.error(
          "Error checking for existing payment:",
          paymentCheckError,
        );
        return new Response("Internal Server Error", { status: 500 });
      }

      if (existingPayment) {
        console.log(
          "Webhook Info: Transaction already processed.",
          paymentData.reference,
        );
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
          payment_status: "completed", // Set payment status
        })
        .select()
        .single();

      if (attendeeError) {
        // Handle potential duplicate email error gracefully
        if (attendeeError.code === "23505") {
          // Unique constraint violation
          console.warn(
            "Webhook Warning: Attendee with this email already exists.",
            registrationData.email,
          );
          // Still return 200 so Paystack doesn't retry.
          return new Response("Attendee already exists", { status: 200 });
        }
        console.error("Error creating attendee:", attendeeError);
        return new Response("Failed to create attendee", { status: 500 });
      }

      // 6. Create the Payment Record
      const { error: paymentError } = await supabase.from("payments").insert({
        attendee_id: newAttendee.id,
        amount: paymentData.amount / 100, // Paystack amounts are in kobo
        currency: paymentData.currency,
        status: "completed",
        transaction_ref: paymentData.reference,
        payment_method: "paystack",
        paystack_response: payload, // Store the full webhook payload for reference
        paid_at: new Date().toISOString(),
      });

      if (paymentError) {
        console.error("Error creating payment record:", paymentError);
        // This is tricky. The attendee was created but the payment record failed.
        // This requires manual intervention, but we can't fail the webhook.
        return new Response("Failed to create payment record", { status: 500 });
      }

      // 7. Send a confirmation email using Resend
      try {
        const resendApiKey = Deno.env.get("RESEND_API_KEY");
        if (!resendApiKey) {
          console.error("RESEND_API_KEY is not set in environment variables.");
          // Don't block the webhook for email failure
        } else {
          const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { width: 90%; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
                .header { background-color: #007bff; color: white; padding: 10px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { padding: 20px; }
                .footer { margin-top: 20px; text-align: center; font-size: 0.8em; color: #888; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>BISUM Conference 2025</h1>
                </div>
                <div class="content">
                  <h2>Registration Confirmed!</h2>
                  <p>Dear ${newAttendee.first_name},</p>
                  <p>Thank you for registering for the BISUM Conference 2025! Your payment has been successfully processed and your spot is confirmed.</p>
                  <p><strong>Registration Number:</strong> ${newAttendee.registration_number}</p>
                  <p>We are thrilled to have you join us for this transformative event. Please keep this email for your records.</p>
                  <p>Further details and conference updates will be sent to you closer to the event date.</p>
                  <p>Best regards,<br>The BISUM Conference Team</p>
                </div>
                <div class="footer">
                  <p>&copy; 2025 BISUM Conference. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `;

          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: "BISUM Conference <noreply@yourdomain.com>", // IMPORTANT: Replace with your verified Resend domain
              to: [newAttendee.email],
              subject: "Registration Confirmed for BISUM Conference 2025",
              html: emailHtml,
            }),
          });

          if (!res.ok) {
            const errorBody = await res.json();
            console.error(
              "Failed to send confirmation email:",
              res.status,
              errorBody,
            );
          } else {
            console.log(
              "Successfully sent confirmation email to:",
              newAttendee.email,
            );
          }
        }
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Do not block the webhook response for email errors
      }

      console.log("Successfully processed payment for:", newAttendee.email);
    }

    // 8. Acknowledge receipt of the webhook
    return new Response("Webhook received", { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});

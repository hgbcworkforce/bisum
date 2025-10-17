import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Navigation, Footer } from "../components";
import { paymentAPI, registrationAPI, handleApiError } from "../services/supabaseService";
import { Check, AlertCircle } from "lucide-react";

const PaymentCallback = () => {
  const [status, setStatus] = useState("processing"); // processing, success, error
  const [message, setMessage] = useState("Verifying your payment...");
  const [attendeeData, setAttendeeData] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const verifyPayment = async () => {
      const params = new URLSearchParams(location.search);
      const transactionId = params.get("transaction_id");
      const txRef = params.get("tx_ref");

      if (!transactionId) {
        setStatus("error");
        setMessage("Transaction ID not found. Your payment may not have been processed correctly.");
        return;
      }

      try {
        // Verify the transaction with our backend (Supabase function)
        const verificationResult = await paymentAPI.verifyTransaction(transactionId);

        if (verificationResult.success) {
          setMessage("Payment verified successfully! Completing your registration...");

          // Retrieve registration data from session storage
          const storedData = sessionStorage.getItem("registrationData");
          if (!storedData) {
            // This can happen if the user has already been registered by the webhook
            // or if they cleared their session storage.
            if (verificationResult.message === "Transaction already processed") {
              setStatus("success");
              setMessage("Your payment has been confirmed and your registration is complete.");
              // You might want to fetch the attendee data here to display it.
            } else {
              throw new Error("Registration data not found. Please contact support.");
            }
            return;
          }

          const formData = JSON.parse(storedData);

          // Register the attendee
          const registrationResult = await registrationAPI.register(formData);

          if (registrationResult.success) {
            setAttendeeData(registrationResult.data);
            setStatus("success");
            setMessage("Registration complete! Welcome to BISUM Conference 2025.");
          } else {
            // This is a critical error. Payment was successful but registration failed.
            // This could be due to a duplicate email if the webhook processed it first.
            if (registrationResult.data?.errors?.email) {
              setStatus("success");
              setMessage("Your payment was successful and your registration is complete.");
            } else {
              throw new Error(registrationResult.message || "Failed to save your registration data.");
            }
          }
        } else {
          throw new Error(verificationResult.message || "Payment verification failed.");
        }
      } catch (error) {
        const errorInfo = handleApiError(error);
        setStatus("error");
        setMessage(errorInfo.message);
        console.error("Payment callback error:", error);
      } finally {
        // Clean up session storage
        sessionStorage.removeItem("registrationData");
      }
    };

    verifyPayment();
  }, [location]);

  const renderStatusIcon = () => {
    switch (status) {
      case "processing":
        return (
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        );
      case "success":
        return (
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
        );
      case "error":
        return (
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg text-center">
          {renderStatusIcon()}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {status === "processing" && "Processing Payment"}
            {status === "success" && "Payment Successful!"}
            {status === "error" && "An Error Occurred"}
          </h2>
          <p className="text-gray-600 mb-4">{message}</p>
          {status === "success" && attendeeData && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-gray-800">
                Your registration number is:{" "}
                <strong>{attendeeData.registrationNumber}</strong>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                A confirmation email has been sent to your email address.
              </p>
            </div>
          )}
          {status === "error" && (
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-red-800">
                If you believe this is an error, please contact our support team with your transaction reference.
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentCallback;

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Navigation, Footer } from "../components";
import {
  paymentAPI,
  registrationAPI,
  handleApiError,
  formatCurrency,
} from "../services/supabaseService";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, failed, error
  const [paymentData, setPaymentData] = useState(null);
  const [attendeeData, setAttendeeData] = useState(null);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      setStatus("verifying");
      setError(null);

      // Get parameters from URL
      const transactionId = searchParams.get("transaction_id");
      const txRef = searchParams.get("tx_ref");
      const flutterwaveStatus = searchParams.get("status");

      // Validate required parameters
      if (!transactionId || !txRef) {
        throw new Error("Missing payment verification parameters");
      }

      // Check Flutterwave status first
      if (flutterwaveStatus === "cancelled") {
        setStatus("cancelled");
        return;
      }

      if (
        flutterwaveStatus !== "successful" &&
        flutterwaveStatus !== "completed"
      ) {
        throw new Error("Payment was not completed successfully");
      }

      // Verify payment with Supabase
      const verificationResult = await paymentAPI.verify(transactionId);

      if (verificationResult.success) {
        setPaymentData(verificationResult.data);

        // Get attendee information if available
        if (verificationResult.data.attendeeId) {
          try {
            const attendeeResult = await registrationAPI.getAttendee(
              verificationResult.data.attendeeId,
            );
            if (attendeeResult.success) {
              setAttendeeData(attendeeResult.data);
            }
          } catch (attendeeError) {
            console.warn("Could not fetch attendee data:", attendeeError);
          }
        } else if (verificationResult.data.attendee) {
          // If attendee data is included in verification result
          setAttendeeData(verificationResult.data.attendee);
        }

        setStatus("success");
      } else {
        throw new Error(
          verificationResult.message || "Payment verification failed",
        );
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      const errorInfo = handleApiError(error);
      setError(errorInfo.message);
      setStatus("failed");
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    await verifyPayment();
    setIsRetrying(false);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoToRegistration = () => {
    navigate("/register");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Verifying State */}
          {status === "verifying" && (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Verifying Payment
              </h2>
              <p className="text-gray-600 mb-4">
                Please wait while we verify your payment with Flutterwave...
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  This process usually takes a few seconds. Please do not close
                  this window.
                </p>
              </div>
            </div>
          )}

          {/* Success State */}
          {status === "success" && (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Payment Successful!
              </h2>
              <p className="text-gray-600 mb-6">
                Thank you for your payment. Your registration for BISUM
                Conference 2024 is now complete.
              </p>

              {/* Payment Details */}
              {paymentData && (
                <div className="bg-gray-50 p-6 rounded-lg mb-6 text-left">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Payment Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Amount Paid:</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(paymentData.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Transaction Reference:
                      </span>
                      <span className="font-mono text-sm text-gray-900">
                        {paymentData.transactionRef}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payment Date:</span>
                      <span className="text-gray-900">
                        {formatDate(paymentData.paidAt || new Date())}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status:</span>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Attendee Details */}
              {attendeeData && (
                <div className="bg-blue-50 p-6 rounded-lg mb-6 text-left">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Registration Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Registration Number:
                      </span>
                      <span className="font-semibold text-blue-600">
                        {attendeeData.registrationNumber ||
                          attendeeData.registration_number}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Name:</span>
                      <span className="text-gray-900">
                        {attendeeData.fullName ||
                          `${attendeeData.first_name} ${attendeeData.last_name}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Email:</span>
                      <span className="text-gray-900">
                        {attendeeData.email}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-green-800">
                  📧 A confirmation email with your receipt and conference
                  details has been sent to your email address.
                </p>
              </div>

              <button
                onClick={handleGoHome}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Return to Homepage
              </button>
            </div>
          )}

          {/* Failed State */}
          {status === "failed" && (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Payment Verification Failed
              </h2>
              <p className="text-gray-600 mb-6">
                We couldn't verify your payment at this time. This could be due
                to a temporary issue.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className={`w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-lg text-white font-semibold transition-colors duration-200 ${
                    isRetrying
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isRetrying ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Retrying...
                    </>
                  ) : (
                    "Retry Verification"
                  )}
                </button>

                <button
                  onClick={handleGoHome}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Return to Homepage
                </button>
              </div>
            </div>
          )}

          {/* Cancelled State */}
          {status === "cancelled" && (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                <svg
                  className="h-8 w-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.349 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Payment Cancelled
              </h2>
              <p className="text-gray-600 mb-6">
                Your payment was cancelled. Your registration is still pending
                payment.
              </p>

              <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-yellow-800">
                  Don't worry! You can complete your payment anytime by
                  returning to the registration page.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleGoToRegistration}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Complete Payment
                </button>

                <button
                  onClick={handleGoHome}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Return to Homepage
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentCallback;

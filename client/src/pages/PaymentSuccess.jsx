import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Navigation, Footer } from "../components";
import { paymentAPI, formatCurrency } from "../services/supabaseService";
import { X, Check, Download } from "lucide-react";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const handlePaymentCallback = async () => {
      try {
        // Get parameters from URL
        const status = searchParams.get("status");
        const txRef = searchParams.get("tx_ref");
        const transactionId = searchParams.get("transaction_id");

        console.log("Payment callback params:", { status, txRef, transactionId });

        if (status !== "successful") {
          throw new Error("Payment was not successful");
        }

        if (!txRef && !transactionId) {
          throw new Error("Missing transaction reference");
        }

        // Process the successful payment
        const result = await paymentAPI.handlePaymentSuccess(txRef, transactionId);

        if (result.success) {
          setRegistrationData(result.data.attendee);
          setPaymentData(result.data.payment);
          setSuccess(true);

          // Send confirmation email (if you have email service)
          // await sendConfirmationEmail(result.data.attendee);
        } else {
          throw new Error(result.error || "Failed to process payment");
        }

      } catch (error) {
        console.error("Payment processing error:", error);
        setError(error.message || "Something went wrong processing your payment");
      } finally {
        setLoading(false);
      }
    };

    handlePaymentCallback();
  }, [searchParams]);

  const handleContinue = () => {
    navigate("/", { replace: true });
  };

  const handleDownloadReceipt = () => {
    // Create a simple receipt
    const receiptContent = `
BISUM CONFERENCE 2025 - REGISTRATION RECEIPT
==========================================

Registration Number: ${registrationData?.registrationNumber || 'N/A'}
Name: ${registrationData?.fullName || 'N/A'}
Email: ${registrationData?.email || 'N/A'}
Phone: ${registrationData?.phoneNumber || 'N/A'}
Registration Type: ${registrationData?.registrationType || 'N/A'}
Referral Source: ${registrationData?.referralSource || 'N/A'}
Breakout Session: ${registrationData?.breakoutSessionChoice || 'N/A'}

Payment Details:
Amount Paid: ${formatCurrency(paymentData?.amount || 0)}
Transaction Reference: ${paymentData?.transaction_ref || 'N/A'}
Payment Date: ${paymentData?.paid_at ? new Date(paymentData.paid_at).toLocaleDateString() : 'N/A'}

Thank you for registering for BISUM Conference 2025!
We look forward to seeing you at the event.

For any inquiries, please contact: info@bisum.hgbcinfluencers.org
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BISUM2025_Receipt_${registrationData?.registrationNumber || 'Unknown'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="py-16">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="animate-spin mx-auto w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Processing Your Payment
              </h2>
              <p className="text-gray-600">
                Please wait while we confirm your payment and complete your registration...
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="py-16">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Payment Processing Failed
              </h2>
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/registration")}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (success && registrationData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="py-16">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Success Header */}
              <div className="bg-green-50 border-b border-green-200 p-8 text-center">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Registration Successful! 🎉
                </h1>
                <p className="text-gray-600">
                  Welcome to BISUM Conference 2025
                </p>
              </div>

              {/* Registration Details */}
              <div className="p-8">
                <div className="mb-8">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      Your Registration Number
                    </h3>
                    <p className="text-2xl font-bold text-blue-600 font-mono">
                      {registrationData.registrationNumber}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Please save this number for your records
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Name:</span> {registrationData.fullName}</p>
                        <p><span className="font-medium">Email:</span> {registrationData.email}</p>
                        <p><span className="font-medium">Phone:</span> {registrationData.phoneNumber}</p>
                        <p><span className="font-medium">Registration Type:</span> {registrationData.registrationType}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Conference Details</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Referral Source:</span> {registrationData.referralSource}</p>
                        <p><span className="font-medium">Breakout Session:</span> {registrationData.breakoutSessionChoice}</p>
                        {registrationData.expectations && (
                          <p><span className="font-medium">Expectations:</span> {registrationData.expectations}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {paymentData && (
                    <div className="mt-6 bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Payment Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <p><span className="font-medium">Amount Paid:</span> {formatCurrency(paymentData.amount)}</p>
                        <p><span className="font-medium">Transaction Ref:</span> {paymentData.transaction_ref}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Next Steps */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-yellow-900 mb-2">What's Next?</h3>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• You'll receive a confirmation email shortly with your registration details</li>
                    <li>• Check your email for conference updates and schedules</li>
                    <li>• Follow us on social media for the latest news</li>
                    <li>• Arrive early on conference day with your registration number</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleDownloadReceipt}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download Receipt
                  </button>
                  <button
                    onClick={handleContinue}
                    className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Continue to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Processing...
            </h2>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;

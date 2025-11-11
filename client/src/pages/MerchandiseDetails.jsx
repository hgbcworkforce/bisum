import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { merchandiseItems } from '../data/merchandiseData';
import { formatCurrency } from '../services/supabaseService'; // Assuming this function is available

// Simulated merchandisePaymentAPI - This needs to be replaced with a real backend API
const merchandisePaymentAPI = {
  verifyPayment: async ({ transaction_ref, merchandiseId, color, size, quantity, fullName, email, phoneNumber, amount }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (transaction_ref) {
          console.log(`Simulating backend verification for: ${transaction_ref}`);
          console.log("Order details to verify:", { merchandiseId, color, size, quantity, fullName, email, phoneNumber, amount });
          resolve({ success: true, data: { message: 'Merchandise order placed successfully!' } });
        } else {
          resolve({ success: false, error: 'Invalid transaction reference.' });
        }
      }, 1500);
    });
  }
};

// Define the charge percentage
const CHARGE_PERCENTAGE = 0.02; // 2%

const MerchandiseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [merchandiseItem, setMerchandiseItem] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [timeLeft, setTimeLeft] = useState({});

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState({});
  const [orderSummary, setOrderSummary] = useState(null);

  // Payment processing states
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [currentTransactionRef, setCurrentTransactionRef] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false); // State to control success modal visibility
  const isProcessingRef = useRef(false);

  // Helper to calculate time left for sales
  const calculateTimeLeft = (targetDate) => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  // Effect to load merchandise item and set initial states
  useEffect(() => {
    const item = merchandiseItems.find((p) => p.id === id);
    if (item) {
      setMerchandiseItem(item);
      setSelectedColor(item.colors[0]);
      setCurrentImage(item.colors[0].image);
      setSelectedSize(item.sizes[0]); // Default to first size
      setTimeLeft(calculateTimeLeft(item.timeFrame));

      // Set up initial order summary
      const pricePerItem = parseFloat(item.price.replace(/[^0-9.-]+/g, ''));
      const subtotal = pricePerItem * quantity;
      const charges = subtotal * CHARGE_PERCENTAGE;
      const totalAmountWithCharges = subtotal + charges;

      setOrderSummary({
        itemName: item.name,
        color: item.colors[0].name,
        size: item.sizes[0],
        quantity: quantity,
        unitPrice: pricePerItem,
        subtotal: subtotal,
        charges: charges,
        totalAmount: totalAmountWithCharges,
      });

      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft(item.timeFrame));
      }, 1000);

      return () => clearInterval(timer);
    } else {
      navigate('/merchandise'); // Redirect if item not found
    }
  }, [id, navigate, quantity]); // Re-calculate order summary on quantity change

  // Effect to update order summary when relevant states change
  useEffect(() => {
    if (merchandiseItem && selectedColor && selectedSize && quantity > 0) {
      const pricePerItem = parseFloat(merchandiseItem.price.replace(/[^0-9.-]+/g, ''));
      const subtotal = pricePerItem * quantity;
      const charges = subtotal * CHARGE_PERCENTAGE;
      const totalAmountWithCharges = subtotal + charges;

      setOrderSummary({
        itemName: merchandiseItem.name,
        color: selectedColor.name,
        size: selectedSize,
        quantity: quantity,
        unitPrice: pricePerItem,
        subtotal: subtotal,
        charges: charges,
        totalAmount: totalAmountWithCharges,
      });
    }
  }, [selectedColor, selectedSize, quantity, merchandiseItem]);


  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setCurrentImage(color.image);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!email.trim()) newErrors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email address is invalid.';
    if (!phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required.';
    if (!selectedSize) newErrors.selectedSize = 'Please select a size.';
    if (quantity <= 0) newErrors.quantity = 'Quantity must be at least 1.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePaystackPaymentVerification = async (response) => {
    setIsProcessingPayment(true);
    try {
      // Here you would typically call your backend API to verify the payment
      // For now, we use the simulated API
      const verificationResult = await merchandisePaymentAPI.verifyPayment({
        transaction_ref: response.reference,
        merchandiseId: merchandiseItem.id,
        color: selectedColor.name,
        size: selectedSize,
        quantity: quantity,
        amount: parseFloat(orderSummary.totalAmount), // Use the total amount including charges
        fullName: fullName,
        email: email,
        phoneNumber: phoneNumber,
      });

      if (verificationResult.success) {
        setSubmitSuccess(true); // Show success modal
        setOrderSummary(null); // Clear order summary
        // Optionally navigate or show a success modal
      } else {
        const errorMessage = verificationResult.error || "Payment verification failed. Please contact support.";
        setErrors({ general: errorMessage });
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setErrors({ general: error.message || "An error occurred during payment verification." });
      alert(error.message || "An error occurred during payment verification.");
    } finally {
      setIsProcessingPayment(false);
      isProcessingRef.current = false;
    }
  };


  const handleBuyNow = async (e) => {
    e.preventDefault();

    if (isProcessingRef.current) {
      console.log("Order already being processed");
      return;
    }

    if (!validateForm()) {
      console.log('Form has errors:', errors);
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        document.getElementsByName(firstErrorField)[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setErrors({});
    isProcessingRef.current = true;

    try {
      const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

      if (!paystackPublicKey) {
        throw new Error("Payment configuration error: Paystack Public Key is missing. Please contact support.");
      }

      if (typeof PaystackPop === "undefined") {
        throw new Error("Payment system not loaded. Please refresh the page and try again. (PaystackPop not found)");
      }

      // Use the total amount from orderSummary which now includes charges
      if (!orderSummary || parseFloat(orderSummary.totalAmount) <= 0) {
        setErrors({ general: "Order summary could not be calculated or total is zero. Please check your selections." });
        isProcessingRef.current = false;
        return;
      }

      const amountInKobo = Math.round(parseFloat(orderSummary.totalAmount) * 100);
      const reference = `MERCH-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      setCurrentTransactionRef(reference);

      const handler = PaystackPop.setup({
        key: paystackPublicKey,
        email: email,
        amount: amountInKobo,
        currency: "NGN",
        ref: reference,
        metadata: {
          custom_fields: [
            {
              display_name: "Customer Name",
              variable_name: "customer_name",
              value: fullName,
            },
            {
              display_name: "Customer Phone",
              variable_name: "customer_phone",
              value: phoneNumber,
            },
            {
              display_name: "Merchandise Item",
              variable_name: "merchandise_item",
              value: merchandiseItem.name,
            },
            {
              display_name: "Color",
              variable_name: "merchandise_color",
              value: selectedColor.name,
            },
            {
              display_name: "Size",
              variable_name: "merchandise_size",
              value: selectedSize,
            },
            {
              display_name: "Quantity",
              variable_name: "merchandise_quantity",
              value: quantity,
            },
            { // Added custom field for charges
              display_name: "Processing Charges (2%)",
              variable_name: "processing_charges",
              value: formatCurrency(orderSummary.charges),
            },
          ],
          merchandise_id: merchandiseItem.id,
          selected_color: selectedColor.name,
          selected_size: selectedSize,
          order_quantity: quantity,
          order_subtotal_amount: orderSummary.subtotal, // Added subtotal
          order_charges_amount: orderSummary.charges,     // Added charges
          order_total_amount: orderSummary.totalAmount,   // Total with charges
        },
        callback: function(response) {
          handlePaystackPaymentVerification(response);
        },
        onClose: function() {
          isProcessingRef.current = false;
          console.log("Payment window closed by user");
          alert(`Payment window was closed. If you completed the payment, please wait for confirmation or contact support.\n\nTransaction Reference: ${reference}`);
        },
      });

      handler.openIframe();

    } catch (error) {
      console.error("Error initiating payment:", error);
      setErrors({ general: error.message || "Failed to initiate payment. Please try again." });
      isProcessingRef.current = false;
      alert(error.message || "Failed to initiate payment. Please try again.");
    }
  };

  const closeModalAndReset = () => {
    setSubmitSuccess(false);
    setFullName('');
    setEmail('');
    setPhoneNumber('');
    setSelectedSize(merchandiseItem?.sizes[0] || ''); // Reset to default or empty
    setQuantity(1);
    setCurrentTransactionRef('');
    navigate('/merchandise'); // Optionally navigate back to the merchandise list
  };

  if (!merchandiseItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-700">Loading merchandise details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <section className="py-20 pt-32 min-h-screen flex">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex">
          <div className="md:flex md:items-start md:space-x-8 w-full">
            <div className="md:w-1/2 lg:w-2/5 md:sticky md:top-28 self-start mr-8">
              <img
                src={currentImage}
                alt={merchandiseItem.name}
                className="w-full h-auto object-cover rounded-lg shadow-lg"
              />
              <div className="flex space-x-2 mt-4 overflow-x-auto">
                {merchandiseItem.colors.map((color) => (
                  <img
                    key={color.name}
                    src={color.image}
                    alt={color.name}
                    className={`w-20 h-20 object-cover rounded-md cursor-pointer border-2 ${
                      selectedColor?.name === color.name ? 'border-blue-500' : 'border-transparent'
                    }`}
                    onClick={() => handleColorSelect(color)}
                  />
                ))}
              </div>
            </div>

            <div className="md:w-1/2 lg:w-3/5 mt-8 md:mt-0 md:h-[calc(100vh-140px)] md:overflow-y-auto md:pr-4">
              {/* Breadcrumb */}
              <nav className="text-sm mb-8">
                <ol className="flex items-center space-x-2 text-gray-500">
                  <li>
                    <Link to="/" className="hover:text-blue-600">Home</Link>
                  </li>
                  <li>/</li>
                  <li>
                    <Link to="/merchandise" className="hover:text-blue-600">Merchandise</Link>
                  </li>
                  <li>/</li>
                  <li className="text-gray-900 font-medium">{merchandiseItem.name}</li>
                </ol>
              </nav>

              <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{merchandiseItem.name}</h1>
              <p className="text-2xl font-bold text-blue-700 mb-6">{merchandiseItem.price}</p>
              <p className="text-gray-700 mb-6">{merchandiseItem.fullDescription}</p>

              {/* Color selection */}
              {merchandiseItem.colors && merchandiseItem.colors.length > 0 && (
                <div className="mb-6">
                  <span className="text-gray-800 font-medium mr-2">Color:</span>
                  <div className="flex items-center space-x-2">
                    {merchandiseItem.colors.map((color) => (
                      <button
                        key={color.name}
                        className={`w-8 h-8 rounded-full border-2 ${
                          selectedColor?.name === color.name
                            ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2'
                            : 'border-gray-300'
                        } focus:outline-none`}
                        style={{ backgroundColor: color.name.toLowerCase().replace(' ', '') }}
                        title={color.name}
                        onClick={() => handleColorSelect(color)}
                      ></button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size selection */}
              {merchandiseItem.sizes && merchandiseItem.sizes.length > 0 && (
                <div className="mb-6">
                  <label htmlFor="size" className="block text-gray-800 font-medium mb-2">Size:</label>
                  <select
                    id="size"
                    name="selectedSize"
                    className="w-full md:w-1/2 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                  >
                    {merchandiseItem.sizes.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                  {errors.selectedSize && <p className="text-red-500 text-sm mt-1">{errors.selectedSize}</p>}
                </div>
              )}

              {/* Quantity input */}
              <div className="mb-6">
                <label htmlFor="quantity" className="block text-gray-800 font-medium mb-2">Quantity:</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="1"
                  className="w-24 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
                {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
              </div>

              {/* Time Left */}
              {timeLeft.days !== undefined && (
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-blue-800 mb-2">Order window closes in:</h4>
                  <p className="text-lg text-blue-700 font-bold">
                    {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                  </p>
                </div>
              )}

              {/* Order Summary */}
              {orderSummary && (
                <div className="bg-gray-100 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h3>
                  <p className="text-gray-700">Item: {orderSummary.itemName}</p>
                  <p className="text-gray-700">Color: {orderSummary.color}</p>
                  <p className="text-gray-700">Size: {orderSummary.size}</p>
                  <p className="text-gray-700">Quantity: {orderSummary.quantity}</p>
                  <p className="text-gray-700 mt-2">Subtotal: {formatCurrency(orderSummary.subtotal)}</p>
                  <p className="text-gray-700">Processing Charges (2%): {formatCurrency(orderSummary.charges)}</p>
                  <p className="text-lg font-bold text-blue-700 mt-4">Total: {formatCurrency(orderSummary.totalAmount)}</p>
                </div>
              )}

              {/* Customer Details Form */}
              <form onSubmit={handleBuyNow} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Your Details</h3>
                <div className="mb-4">
                  <label htmlFor="fullName" className="block text-gray-700 font-medium mb-2">Full Name:</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                </div>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email:</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div className="mb-6">
                  <label htmlFor="phoneNumber" className="block text-gray-700 font-medium mb-2">Phone Number:</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                </div>

                {errors.general && <p className="text-red-500 text-center mb-4">{errors.general}</p>}

                <button
                  type="submit"
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-colors duration-300 ${isProcessingPayment ? 'opacity-60 cursor-not-allowed' : ''}`}
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? 'Processing Payment...' : 'Pay with Paystack'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Success Modal */}
      {submitSuccess && (
        <div className="fixed inset-0backdrop-blur-lg bg-opacity-10 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center transform scale-95 animate-zoom-in">
            <div className="text-green-500 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Purchase Successful!</h2>
            <p className="text-gray-600 mb-4">
              Thank you, <span className="font-semibold">{fullName}</span>, for your purchase of the
              <span className="font-semibold"> {merchandiseItem.name}</span>.
            </p>
            {currentTransactionRef && (
              <p className="text-gray-600 mb-2">
                Your transaction reference is: <span className="font-mono font-semibold text-blue-700">{currentTransactionRef}</span>
              </p>
            )}
            <p className="text-gray-600 mb-6">
              A confirmation email has been sent to <span className="font-semibold">{email}</span> with your order details.
              If you have any questions, please contact support.
            </p>
            <button
              onClick={closeModalAndReset}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MerchandiseDetails;

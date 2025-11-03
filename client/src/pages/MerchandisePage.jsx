import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Navigation,
  Footer,
} from "../components";

import { merchandiseItems } from '../data/merchandiseData'; // Centralized merchandise data

// Placeholder for an API call to verify payment on the backend
// In a real application, this would be an actual API client service
const merchandisePaymentAPI = {
  verifyPayment: async ({ transaction_ref, merchandiseId, color, size, quantity, fullName, email, phoneNumber, amount }) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        if (transaction_ref) {
          console.log(`Simulating backend verification for: ${transaction_ref}`);
          console.log("Order details to verify:", { merchandiseId, color, size, quantity, fullName, email, phoneNumber, amount });
          // In a real app, this would call your backend to verify the payment
          // Example:
          // const response = await fetch('/api/verify-merchandise-payment', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({ transaction_ref, merchandiseId, color, size, quantity, fullName, email, phoneNumber, amount })\n          // });
          // const data = await response.json();
          // resolve(data);
          resolve({ success: true, data: { message: 'Merchandise order placed successfully!' } });
        } else {
          resolve({ success: false, error: 'Invalid transaction reference.' });
        }
      }, 1500); // Simulate network delay
    });
  }
};

const MerchandisePage = () => {
  const { id } = useParams();

  // ALL HOOKS MUST BE DECLARED UNCONDITIONALLY AT THE TOP LEVEL
  const [merchandiseItem, setMerchandiseItem] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [currentImage, setCurrentImage] = useState('');

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState({});
  const [orderSummary, setOrderSummary] = useState(null);

  // Paystack related states
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [currentTransactionRef, setCurrentTransactionRef] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const isProcessingRef = useRef(false); // To prevent double submissions/verifications

  // Effect to load merchandise item based on URL ID
  useEffect(() => {
    const item = merchandiseItems.find((item) => item.id === id);
    if (item) {
      setMerchandiseItem(item);
      setSelectedColor(item.colors[0]); // Default to the first color
      setCurrentImage(item.colors[0].image);
      setSelectedSize(item.sizes[0] || ''); // Default to the first size or empty string
    }
  }, [id]);

  // Effect to recalculate order summary
  useEffect(() => {
    if (merchandiseItem && selectedColor && selectedSize && quantity > 0 && fullName && email && phoneNumber) {
      const pricePerItem = parseFloat(merchandiseItem.price.replace(/[^0-9.-]+/g,""));
      const totalAmount = pricePerItem * quantity;
      setOrderSummary({
        itemName: merchandiseItem.name,
        color: selectedColor.name,
        size: selectedSize,
        quantity: quantity,
        unitPrice: pricePerItem.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
      });
    } else {
      setOrderSummary(null);
    }
  }, [merchandiseItem, selectedColor, selectedSize, quantity, fullName, email, phoneNumber]);

  // Handle color selection
  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setCurrentImage(color.image);
  };

  // Form validation logic
  const validateForm = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Full Name is required.';
    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid.';
    }
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone Number is required.';
    } else if (!/^\+?[\d\s-]{10,15}$/.test(phoneNumber.replace(/\s|-/g, ''))) { // Basic number validation (allows +, spaces, hyphens)
      newErrors.phoneNumber = 'Phone Number is invalid (10-15 digits, optional + prefix).';
    }
    if (!selectedSize) newErrors.selectedSize = 'Size is required.';
    if (!selectedColor) newErrors.selectedColor = 'Color is required.';
    if (quantity < 1) newErrors.quantity = 'Quantity must be at least 1.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Callback function for Paystack payment verification
  const handlePaystackPaymentVerification = useCallback(async (response) => {
    console.log("Paystack payment successful", response);

    if (isProcessingRef.current) {
      console.log("Payment verification already being processed");
      return;
    }

    isProcessingRef.current = true;
    setIsProcessingPayment(true);
    // setIsSubmitting is already true from handleBuyNow and will be set to false in finally

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Payment verification timeout. Please contact support with your transaction reference.')), 30000)
      );

      const verificationPromise = merchandisePaymentAPI.verifyPayment({
        transaction_ref: response.reference,
        merchandiseId: merchandiseItem.id, // Pass relevant data to backend
        color: selectedColor.name,
        size: selectedSize,
        quantity: quantity,
        fullName,
        email,
        phoneNumber,
        amount: orderSummary.totalAmount, // Send total amount for verification
      });

      const verificationResult = await Promise.race([verificationPromise, timeoutPromise]);

      if (verificationResult.success) {
        setSubmitSuccess(true);
        // Optionally clear form fields here or navigate
        // setFullName(''); setEmail(''); setPhoneNumber(''); setQuantity(1);
        // setSelectedColor(merchandiseItem.colors[0]); setSelectedSize(merchandiseItem.sizes[0]);
      } else {
        throw new Error(verificationResult.error || "Payment verification failed.");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      const errorMessage = error.message || "Payment verification failed. Please contact support.";
      setErrors({ payment: errorMessage });
      alert(`${errorMessage}\n\nTransaction Reference: ${response.reference}\nPlease save this reference for support.`);
    } finally {
      // setIsSubmitting(false); // Enable button
      setIsProcessingPayment(false); // Stop processing indicator
      isProcessingRef.current = false;
    }
  }, [merchandiseItem, selectedColor, selectedSize, quantity, fullName, email, phoneNumber, orderSummary]);


  // Handle Buy Now button click and Paystack initialization
  const handleBuyNow = async (e) => {
    e.preventDefault();

    if (isProcessingRef.current) {
      console.log("Order already being processed");
      return;
    }

    if (!validateForm()) {
      console.log('Form has errors:', errors);
      // Scroll to the first error field if available
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        document.getElementsByName(firstErrorField)[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // setIsSubmitting(true); // Re-enable this if you want the spinner to show before Paystack opens
    setErrors({});
    isProcessingRef.current = true; // Set ref to true immediately to prevent double clicks

    try {
      const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

      if (!paystackPublicKey) {
        throw new Error("Payment configuration error: Paystack Public Key is missing. Please contact support.");
      }

      // Check if PaystackPop is defined by the global script
      if (typeof PaystackPop === "undefined") {
        throw new Error("Payment system not loaded. Please refresh the page and try again. (PaystackPop not found)");
      }

      // Ensure orderSummary is calculated and valid before proceeding
      if (!orderSummary || parseFloat(orderSummary.totalAmount) <= 0) {
        setErrors({ general: "Order summary could not be calculated or total is zero. Please check your selections." });
        isProcessingRef.current = false; // Release the ref
        return;
      }

      const amountInKobo = Math.round(parseFloat(orderSummary.totalAmount) * 100); // Convert to kobo
      const reference = `MERCH-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      setCurrentTransactionRef(reference); // Store reference for success message

      const handler = PaystackPop.setup({
        key: paystackPublicKey,
        email: email,
        amount: amountInKobo,
        currency: "NGN", // Assuming NGN as per Registration.jsx, adjust if needed
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
          ],
          merchandise_id: merchandiseItem.id,
          selected_color: selectedColor.name,
          selected_size: selectedSize,
          order_quantity: quantity,
          order_total_amount: orderSummary.totalAmount,
        },
        callback: function(response) {
          handlePaystackPaymentVerification(response);
        },
        onClose: function() {
          // setIsSubmitting(false); // Re-enable the button if you used it
          isProcessingRef.current = false; // Release the ref
          console.log("Payment window closed by user");
          alert(`Payment window was closed. If you completed the payment, please wait for confirmation or contact support.\n\nTransaction Reference: ${reference}`);
        },
      });

      handler.openIframe();

    } catch (error) {
      console.error("Error initiating payment:", error);
      setErrors({ general: error.message || "Failed to initiate payment. Please try again." });
      // setIsSubmitting(false); // Re-enable the button if you used it
      isProcessingRef.current = false; // Release the ref
      alert(error.message || "Failed to initiate payment. Please try again.");
    }
  };

  // --- Conditional Rendering of JSX below this point ---

  // Render success message if order is placed
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-5xl font-extrabold text-green-600 mb-6">Order Placed Successfully!</h2>
        <p className="text-xl text-gray-700 mb-4">Thank you for your purchase.</p>
        <p className="text-lg text-gray-600 mb-8">
          Your transaction reference is: <span className="font-mono text-blue-700">{currentTransactionRef}</span>
        </p>
        <Link
          to="/"
          className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300 text-lg"
        >
          Back to Homepage
        </Link>
      </div>
    );
  }

  // Handle case where merchandise item is not found
  if (!merchandiseItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-700">Merchandise item not found.</p>
      </div>
    );
  }

  // Main merchandise page content
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto mt-20 px-4 py-20">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Image Gallery & Product Details */}
          <div className="lg:w-1/2">
            <img
              src={currentImage}
              alt={merchandiseItem.name}
              className="w-full h-96 object-contain rounded-lg shadow-md"
            />
            <div className="flex gap-4 mt-6 flex-wrap">
              {merchandiseItem.colors.map((color) => (
                <img
                  key={color.name}
                  src={color.image}
                  alt={color.name}
                  className={`w-24 h-24 object-cover rounded-md cursor-pointer border-2 ${
                    selectedColor && selectedColor.name === color.name ? 'border-blue-600' : 'border-transparent'
                  }`}
                  onClick={() => handleColorSelect(color)}
                />
              ))}
            </div>

            {/* Product description and price */}
            <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{merchandiseItem.name}</h1>
                <p className="text-gray-600 text-lg mb-6">{merchandiseItem.fullDescription}</p>
                <p className="text-3xl font-bold text-blue-600 mb-2">{merchandiseItem.price}</p>
                <p className="text-sm text-red-500 mb-4">
                  <span className="font-semibold">Order Deadline:</span> {merchandiseItem.timeFrame}
                </p>
            </div>
          </div>

          {/* Order Form and Summary */}
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Place Your Order</h2>
            <form onSubmit={handleBuyNow} className="bg-white p-8 rounded-lg shadow-md mb-8">
              {/* Full Name */}
              <div className="mb-4">
                <label htmlFor="fullName" className="block text-gray-700 text-sm font-bold mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.fullName ? 'border-red-500' : ''}`}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Full Name"
                />
                {errors.fullName && <p className="text-red-500 text-xs italic mt-1">{errors.fullName}</p>}
              </div>

              {/* Email */}
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.email ? 'border-red-500' : ''}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@example.com"
                />
                {errors.email && <p className="text-red-500 text-xs italic mt-1">{errors.email}</p>}
              </div>

              {/* Phone Number */}
              <div className="mb-4">
                <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-bold mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.phoneNumber ? 'border-red-500' : ''}`}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g., +2348012345678"
                />
                {errors.phoneNumber && <p className="text-red-500 text-xs italic mt-1">{errors.phoneNumber}</p>}
              </div>

              {/* Color Selection (Existing) */}
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Colors:</h3>
                <div className="flex gap-3 flex-wrap">
                  {merchandiseItem.colors.map((color) => (
                    <button
                      key={color.name}
                      type="button" // Important for buttons inside forms not to submit
                      className={`px-4 py-2 rounded-lg border-2 ${
                        selectedColor && selectedColor.name === color.name
                          ? 'border-blue-600 bg-blue-100 text-blue-800'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      } transition-colors duration-200`}
                      onClick={() => handleColorSelect(color)}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
                {errors.selectedColor && <p className="text-red-500 text-xs italic mt-1">{errors.selectedColor}</p>}
              </div>

              {/* Size Selection */}
              {merchandiseItem.sizes && merchandiseItem.sizes.length > 0 && (
                <div className="mb-4">
                  <label htmlFor="size" className="block text-gray-700 text-sm font-bold mb-2">
                    Size
                  </label>
                  <select
                    id="size"
                    name="selectedSize"
                    className={`shadow border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.selectedSize ? 'border-red-500' : ''}`}
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                  >
                    {merchandiseItem.sizes.map((sizeOption) => (
                      <option key={sizeOption} value={sizeOption}>
                        {sizeOption}
                      </option>
                    ))}
                  </select>
                  {errors.selectedSize && <p className="text-red-500 text-xs italic mt-1">{errors.selectedSize}</p>}
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <label htmlFor="quantity" className="block text-gray-700 text-sm font-bold mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="1"
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.quantity ? 'border-red-500' : ''}`}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} // Ensure min 1
                />
                {errors.quantity && <p className="text-red-500 text-xs italic mt-1">{errors.quantity}</p>}
              </div>

              {/* Order Summary */}
              {orderSummary && (
                <div className="bg-blue-50 p-6 rounded-lg shadow-inner mb-6">
                  <h3 className="text-xl font-bold text-blue-800 mb-4">Order Summary</h3>
                  <div className="flex justify-between py-1 border-b border-blue-200">
                    <span className="text-gray-700">Item:</span>
                    <span className="font-semibold">{orderSummary.itemName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-blue-200">
                    <span className="text-gray-700">Color:</span>
                    <span className="font-semibold">{orderSummary.color}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-blue-200">
                    <span className="text-gray-700">Size:</span>
                    <span className="font-semibold">{orderSummary.size}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-blue-200">
                    <span className="text-gray-700">Quantity:</span>
                    <span className="font-semibold">{orderSummary.quantity}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-blue-200">
                    <span className="text-gray-700">Unit Price:</span>
                    <span className="font-semibold">₦ {orderSummary.unitPrice}</span>
                  </div>
                  <div className="flex justify-between py-2 mt-2 text-xl font-bold text-blue-700">
                    <span>Total:</span>
                    <span>₦ {orderSummary.totalAmount}</span>
                  </div>
                </div>
              )}

              {/* Buy Now Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300 text-lg flex items-center justify-center"
                disabled={isProcessingPayment || isProcessingRef.current}
              >
                {(isProcessingPayment || isProcessingRef.current) ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Buy Now'
                )}
              </button>
              {errors.general && <p className="text-red-500 text-xs italic mt-4 text-center">{errors.general}</p>}
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MerchandisePage;

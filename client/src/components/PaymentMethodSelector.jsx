import React from 'react';

const PaymentMethodSelector = ({ currentPrice, selectedPaymentMethod, setSelectedPaymentMethod }) => {
  // All available payment channels according to Paystack API documentation
  const paymentMethods = [
    { value: 'card', label: 'Pay with Card (Debit/Credit)' },
    { value: 'bank', label: 'Pay with Bank Account (including OPay)' },
    { value: 'bank_transfer', label: 'Pay with Bank Transfer' },
    { value: 'ussd', label: 'Pay with USSD' },
    { value: 'mobile_money', label: 'Pay with Mobile Money' },
    { value: 'apple_pay', label: 'Pay with Apple Pay' },
  ];

  const handlePaymentMethodChange = (event) => {
    setSelectedPaymentMethod(event.target.value);
  };

  return (
    <div>
      <p>Select Payment Method:</p>
      <select value={selectedPaymentMethod} onChange={handlePaymentMethodChange}>
        <option value="">-- Select a payment method --</option>
        {paymentMethods.map((method) => (
          <option key={method.value} value={method.value}>
            {method.label}
          </option>
        ))}
      </select>
      <p>Current Price: {currentPrice}</p>
      <p>Selected Method: {selectedPaymentMethod}</p>
    </div>
  );
};

export default PaymentMethodSelector;

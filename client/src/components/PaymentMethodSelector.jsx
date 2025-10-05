import React from 'react';

const PaymentMethodSelector = ({ currentPrice, selectedPaymentMethod, setSelectedPaymentMethod }) => {
  const paymentMethods = [
    { value: 'card', label: 'Pay with Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'ussd', label: 'USSD' },
    { value: 'opay', label: 'OPay' }, // Added OPay
  ];

  const handlePaymentMethodChange = (event) => {
    setSelectedPaymentMethod(event.target.value);
  };

  return (
    <div>
      <p>Select Payment Method:</p>
      <select value={selectedPaymentMethod} onChange={handlePaymentMethodChange}>
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

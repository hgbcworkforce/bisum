import React from 'react';

const RegistrationFormFields = ({ formData, handleInputChange }) => {
  return (
    <div>
      <p>Registration Form:</p>
      <label htmlFor="firstName">First Name:</label>
      <input
        type="text"
        id="firstName"
        name="firstName"
        value={formData.firstName}
        onChange={handleInputChange}
      />
      <br />
      <label htmlFor="lastName">Last Name:</label>
      <input
        type="text"
        id="lastName"
        name="lastName"
        value={formData.lastName}
        onChange={handleInputChange}
      />
      <br />
      <label htmlFor="email">Email:</label>
      <input
        type="email"
        id="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
      />
      <br />
      {/* Add more form fields as needed */}
    </div>
  );
};

export default RegistrationFormFields;

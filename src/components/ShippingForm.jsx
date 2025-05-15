import React, { useState } from 'react';

export default function ShippingForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    suburb: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    console.log('Shipping form submitted:', formData);
    // TODO: send to Firestore or pass up to parent
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '2rem auto' }}>
      <h2>Shipping Details</h2>

      <label>Full Name:</label>
      <input
        type="text"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        required
      />

      <label>Phone Number:</label>
      <input
        type="tel"
        name="phoneNumber"
        value={formData.phoneNumber}
        onChange={handleChange}
        required
      />

      <label>Address Line 1:</label>
      <input
        type="text"
        name="addressLine1"
        value={formData.addressLine1}
        onChange={handleChange}
        required
      />

      <label>Address Line 2 (optional):</label>
      <input
        type="text"
        name="addressLine2"
        value={formData.addressLine2}
        onChange={handleChange}
      />

      <label>Suburb:</label>
      <input
        type="text"
        name="suburb"
        value={formData.suburb}
        onChange={handleChange}
        required
      />

      <label>City:</label>
      <input
        type="text"
        name="city"
        value={formData.city}
        onChange={handleChange}
        required
      />

      <label>Postal Code:</label>
      <input
        type="text"
        name="postalCode"
        value={formData.postalCode}
        onChange={handleChange}
        required
      />

      <label>Country:</label>
      <input
        type="text"
        name="country"
        value={formData.country}
        onChange={handleChange}
        required
      />

      <button type="submit" style={{ marginTop: '1rem' }}>Submit</button>
    </form>
  );
}

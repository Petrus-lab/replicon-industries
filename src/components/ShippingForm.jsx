// src/components/ShippingForm.jsx
import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

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
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess(''); setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess('');
    const user = auth.currentUser;
    if (!user) {
      setError('You must be logged in to save shipping info.');
      return;
    }

    try {
      await setDoc(doc(db, 'shipping', user.uid), {
        ...formData,
        uid: user.uid,
        email: user.email,
      });
      setSuccess('Shipping details saved.');
    } catch (err) {
      console.error(err);
      setError('Failed to save shipping details.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '2rem auto' }}>
      <h2>Shipping Details</h2>

      {/* fields... */}
      <label>Full Name:</label>
      <input name="fullName" value={formData.fullName} onChange={handleChange} required />

      <label>Phone Number:</label>
      <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />

      <label>Address Line 1:</label>
      <input name="addressLine1" value={formData.addressLine1} onChange={handleChange} required />

      <label>Address Line 2:</label>
      <input name="addressLine2" value={formData.addressLine2} onChange={handleChange} />

      <label>Suburb:</label>
      <input name="suburb" value={formData.suburb} onChange={handleChange} required />

      <label>City:</label>
      <input name="city" value={formData.city} onChange={handleChange} required />

      <label>Postal Code:</label>
      <input name="postalCode" value={formData.postalCode} onChange={handleChange} required />

      <label>Country:</label>
      <input name="country" value={formData.country} onChange={handleChange} required />

      {error   && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <button type="submit" style={{ marginTop: '1rem' }}>Save Shipping</button>
    </form>
  );
}

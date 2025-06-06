// src/components/ShippingForm.jsx

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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

  useEffect(() => {
    const fetchShipping = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const shipSnap = await getDoc(doc(db, 'shipping', user.uid));
        if (shipSnap.exists()) {
          const data = shipSnap.data();
          setFormData({
            fullName: data.fullName || '',
            phoneNumber: data.phoneNumber || '',
            addressLine1: data.contextAddress?.line1 || '',
            addressLine2: data.contextAddress?.line2 || '',
            suburb: data.contextAddress?.suburb || '',
            city: data.contextAddress?.city || '',
            postalCode: data.contextAddress?.postalCode || '',
            country: data.contextAddress?.country || '',
          });
        }
      } catch (err) {
        console.error('Fetch shipping error:', err);
        setError('Failed to fetch shipping info.');
      }
    };
    fetchShipping();
  }, []);

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess('');
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const user = auth.currentUser;
    if (!user) {
      setError('You must be logged in to save shipping info.');
      return;
    }
    try {
      const { addressLine1, addressLine2, suburb, city, postalCode, country } = formData;
      const fullAddress = `${addressLine1}, ${addressLine2 ? addressLine2 + ', ' : ''}${suburb}, ${city}, ${postalCode}, ${country}`;

      await setDoc(doc(db, 'shipping', user.uid), {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        contextAddress: {
          line1: addressLine1,
          line2: addressLine2,
          suburb,
          city,
          postalCode,
          country,
          fullAddress,
        },
        uid: user.uid,
        email: user.email,
      });
      setSuccess('Shipping details saved.');
    } catch (err) {
      console.error('Failed to save shipping:', err);
      setError('Failed to save shipping details.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Shipping Details</h2>

      <label>Full Name:</label>
      <input
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        required
      />

      <label>Phone Number:</label>
      <input
        name="phoneNumber"
        value={formData.phoneNumber}
        onChange={handleChange}
        required
      />

      <label>Address Line 1:</label>
      <input
        name="addressLine1"
        value={formData.addressLine1}
        onChange={handleChange}
        required
      />

      <label>Address Line 2:</label>
      <input
        name="addressLine2"
        value={formData.addressLine2}
        onChange={handleChange}
      />

      <label>Suburb:</label>
      <input
        name="suburb"
        value={formData.suburb}
        onChange={handleChange}
        required
      />

      <label>City:</label>
      <input
        name="city"
        value={formData.city}
        onChange={handleChange}
        required
      />

      <label>Postal Code:</label>
      <input
        name="postalCode"
        value={formData.postalCode}
        onChange={handleChange}
        required
      />

      <label>Country:</label>
      <input
        name="country"
        value={formData.country}
        onChange={handleChange}
        required
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <button type="submit" style={{ marginTop: '1rem' }}>
        Save Shipping
      </button>
    </form>
  );
}

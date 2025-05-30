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
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

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
    <form className="form" onSubmit={handleSubmit}>
      <h2 className="form-title">Shipping Details</h2>

      <div className="form-group">
        <label htmlFor="fullName" className="form-label">Full Name:</label>
        <input
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="phoneNumber" className="form-label">Phone Number:</label>
        <input
          id="phoneNumber"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="addressLine1" className="form-label">Address Line 1:</label>
        <input
          id="addressLine1"
          name="addressLine1"
          value={formData.addressLine1}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="addressLine2" className="form-label">Address Line 2:</label>
        <input
          id="addressLine2"
          name="addressLine2"
          value={formData.addressLine2}
          onChange={handleChange}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="suburb" className="form-label">Suburb:</label>
        <input
          id="suburb"
          name="suburb"
          value={formData.suburb}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="city" className="form-label">City:</label>
        <input
          id="city"
          name="city"
          value={formData.city}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="postalCode" className="form-label">Postal Code:</label>
        <input
          id="postalCode"
          name="postalCode"
          value={formData.postalCode}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="country" className="form-label">Country:</label>
        <input
          id="country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>

      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">{success}</p>}

      <div className="form-group">
        <button type="submit" className="form-button">Save Shipping</button>
      </div>
    </form>
  );
}

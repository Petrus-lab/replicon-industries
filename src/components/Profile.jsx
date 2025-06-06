// src/components/Profile.jsx

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Profile() {
  const [formData, setFormData] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    province: '',
    postalCode: '',
    country: '',
    defaultFinish: '',
    defaultPrintQuality: '',
  });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const profileSnap = await getDoc(doc(db, 'profiles', user.uid));
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setFormData({
            fullName: data.fullName || '',
            addressLine1: data.billingAddress?.line1 || '',
            addressLine2: data.billingAddress?.line2 || '',
            city: data.billingAddress?.city || '',
            province: data.billingAddress?.province || '',
            postalCode: data.billingAddress?.postalCode || '',
            country: data.billingAddress?.country || '',
            defaultFinish: data.defaultPostProcessing || '',
            defaultPrintQuality: data.defaultPrintQuality || '',
          });
        }
      } catch (err) {
        console.error('Fetch profile error:', err);
        setError('Failed to fetch profile.');
      }
    };
    fetchProfile();
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
      setError('You must be logged in to save your profile.');
      return;
    }
    try {
      const { addressLine1, addressLine2, city, province, postalCode, country } = formData;
      const fullAddress = `${addressLine1}, ${addressLine2 ? addressLine2 + ', ' : ''}${city}, ${province}, ${postalCode}, ${country}`;

      await setDoc(doc(db, 'profiles', user.uid), {
        fullName: formData.fullName,
        billingAddress: {
          line1: addressLine1,
          line2: addressLine2,
          city,
          province,
          postalCode,
          country,
          fullAddress,
        },
        defaultPostProcessing: formData.defaultFinish,
        defaultPrintQuality: formData.defaultPrintQuality,
      });
      setSuccess('Profile saved.');
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError('Failed to save profile.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Profile</h2>

      <label>Full Name:</label>
      <input
        name="fullName"
        value={formData.fullName}
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

      <label>City:</label>
      <input
        name="city"
        value={formData.city}
        onChange={handleChange}
        required
      />

      <label>Province:</label>
      <input
        name="province"
        value={formData.province}
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

      <label>Default Finish:</label>
      <select
        name="defaultFinish"
        value={formData.defaultFinish}
        onChange={handleChange}
        required
      >
        <option value="">-- Select --</option>
        <option value="raw">Raw</option>
        <option value="supports_removed">Supports Removed</option>
        <option value="ready_to_go">Ready to Go</option>
      </select>

      <label>Default Print Quality:</label>
      <select
        name="defaultPrintQuality"
        value={formData.defaultPrintQuality}
        onChange={handleChange}
        required
      >
        <option value="">-- Select --</option>
        <option value="draft">Draft</option>
        <option value="fit_check">Fit Check</option>
        <option value="prototype">Prototype</option>
        <option value="production">Production</option>
      </select>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <button type="submit">Save Profile</button>
    </form>
  );
}

// ✅ FILE: src/components/Profile.jsx
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Profile() {
  const [userEmail, setUserEmail] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    phoneNumber: '',
    billingAddressLine1: '',
    billingAddressLine2: '',
    billingSuburb: '',
    billingCity: '',
    billingPostalCode: '',
    billingCountry: '',
    defaultPrintQuality: '',
    defaultFinish: '',
  });
  const [status, setStatus] = useState('');

  useEffect(() => {
    return auth.onAuthStateChanged(async user => {
      if (!user) return;
      setUserEmail(user.email || '');
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        setProfileData(snap.data());
      }
    });
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    if (status) setStatus('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus('');
    const user = auth.currentUser;
    if (!user) {
      setStatus('You must be logged in.');
      return;
    }
    try {
      await setDoc(doc(db, 'users', user.uid), profileData, { merge: true });
      setStatus('Profile saved successfully.');
    } catch {
      setStatus('Error saving profile.');
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2 className="form-title">My Profile</h2>

      <p><strong>Email:</strong> {userEmail}</p>

      <div className="form-group">
        <label htmlFor="name" className="form-label">Name:</label>
        <input
          id="name"
          name="name"
          type="text"
          value={profileData.name}
          onChange={handleChange}
          className="form-input quarter-width"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="phoneNumber" className="form-label">Phone Number:</label>
        <input
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          value={profileData.phoneNumber}
          onChange={handleChange}
          className="form-input quarter-width"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="billingAddressLine1" className="form-label">Billing Address Line 1:</label>
        <input
          id="billingAddressLine1"
          name="billingAddressLine1"
          type="text"
          value={profileData.billingAddressLine1}
          onChange={handleChange}
          className="form-input quarter-width"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="billingAddressLine2" className="form-label">Billing Address Line 2:</label>
        <input
          id="billingAddressLine2"
          name="billingAddressLine2"
          type="text"
          value={profileData.billingAddressLine2}
          onChange={handleChange}
          className="form-input quarter-width"
        />
      </div>

      <div className="form-group">
        <label htmlFor="billingSuburb" className="form-label">Suburb:</label>
        <input
          id="billingSuburb"
          name="billingSuburb"
          type="text"
          value={profileData.billingSuburb}
          onChange={handleChange}
          className="form-input quarter-width"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="billingCity" className="form-label">City:</label>
        <input
          id="billingCity"
          name="billingCity"
          type="text"
          value={profileData.billingCity}
          onChange={handleChange}
          className="form-input quarter-width"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="billingPostalCode" className="form-label">Postal Code:</label>
        <input
          id="billingPostalCode"
          name="billingPostalCode"
          type="text"
          value={profileData.billingPostalCode}
          onChange={handleChange}
          className="form-input quarter-width"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="billingCountry" className="form-label">Country:</label>
        <input
          id="billingCountry"
          name="billingCountry"
          type="text"
          value={profileData.billingCountry}
          onChange={handleChange}
          className="form-input quarter-width"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="defaultPrintQuality" className="form-label">Default Print Quality:</label>
        <select
          id="defaultPrintQuality"
          name="defaultPrintQuality"
          value={profileData.defaultPrintQuality}
          onChange={handleChange}
          className="form-select quarter-width"
          required
        >
          <option value="">Select quality</option>
          <option value="Draft">Draft</option>
          <option value="Fit Check">Fit Check</option>
          <option value="Prototype">Prototype</option>
          <option value="Production">Production</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="defaultFinish" className="form-label">Default Post-Processing:</label>
        <select
          id="defaultFinish"
          name="defaultFinish"
          value={profileData.defaultFinish}
          onChange={handleChange}
          className="form-select quarter-width"
          required
        >
          <option value="">Select finish</option>
          <option value="raw">Raw</option>
          <option value="supports_removed">Supports Removed</option>
          <option value="ready_to_go">Ready to Go</option>
        </select>
      </div>

      {status && <p className="form-error">{status}</p>}

      <div className="form-group">
        <button type="submit" className="form-button quarter-width">
          Save Profile
        </button>
      </div>
    </form>
  );
}

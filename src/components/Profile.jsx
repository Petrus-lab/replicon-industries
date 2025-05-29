// ✅ FILE: src/components/Profile.jsx
// UPDATED: removed “Quality” suffix from Default Print Quality options

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [userData, setUserData] = useState({
    name: '',
    phoneNumber: '',
    defaultFinish: '',
    defaultPrintQuality: ''
  });
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/');
        return;
      }
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setUserData(snap.data());
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = e => {
    setUserData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setStatus('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;
    try {
      const ref = doc(db, 'users', user.uid);
      await updateDoc(ref, {
        name: userData.name,
        phoneNumber: userData.phoneNumber,
        defaultFinish: userData.defaultFinish,
        defaultPrintQuality: userData.defaultPrintQuality
      });
      setStatus('Profile updated.');
    } catch (err) {
      console.error(err);
      setStatus('Failed to update profile.');
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2 className="form-title">Profile</h2>

      <label htmlFor="name" className="form-label">Name:</label>
      <input
        id="name"
        name="name"
        value={userData.name}
        onChange={handleChange}
        className="form-input half-width"
        required
      />

      <label htmlFor="phoneNumber" className="form-label">Phone Number:</label>
      <input
        id="phoneNumber"
        name="phoneNumber"
        value={userData.phoneNumber}
        onChange={handleChange}
        className="form-input half-width"
        required
      />

      <label htmlFor="defaultPrintQuality" className="form-label">Default Print Quality:</label>
      <select
        id="defaultPrintQuality"
        name="defaultPrintQuality"
        value={userData.defaultPrintQuality}
        onChange={handleChange}
        className="form-select half-width"
        required
      >
        <option value="">Select quality</option>
        <option value="Draft Quality">Draft</option>
        <option value="Fit Check Quality">Fit Check</option>
        <option value="Prototype">Prototype</option>
        <option value="Production Quality">Production</option>
      </select>

      <label htmlFor="defaultFinish" className="form-label">Default Post-Processing:</label>
      <select
        id="defaultFinish"
        name="defaultFinish"
        value={userData.defaultFinish}
        onChange={handleChange}
        className="form-select half-width"
        required
      >
        <option value="">Select finish</option>
        <option value="raw">Raw</option>
        <option value="supports_removed">Supports Removed</option>
        <option value="ready_to_go">Ready to Go</option>
      </select>

      {status && <p className="form-error">{status}</p>}

      <button type="submit" className="form-button">Save Profile</button>
    </form>
  );
}

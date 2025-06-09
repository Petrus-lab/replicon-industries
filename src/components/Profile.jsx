// src/components/Profile.jsx

import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const Profile = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    contact: '',
    billingAddress: '',
    finish: '',
    quality: ''
  });
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, 'profiles', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfileData(docSnap.data());
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    try {
      setStatus('Saving...');
      await setDoc(doc(db, 'profiles', user.uid), profileData);
      setStatus('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      setStatus('Failed to update profile.');
    }
  };

  return (
    <div className="section-container">
      <h2 className="section-heading">Your Profile</h2>
      <form onSubmit={handleSubmit} className="form-vertical">
        <label className="form-label">Full Name:</label>
        <input
          type="text"
          name="name"
          value={profileData.name}
          onChange={handleChange}
          className="form-control form-control-narrow"
        />

        <label className="form-label">Contact Number:</label>
        <input
          type="text"
          name="contact"
          value={profileData.contact}
          onChange={handleChange}
          className="form-control form-control-narrow"
        />

        <label className="form-label">Billing Address:</label>
        <input
          type="text"
          name="billingAddress"
          value={profileData.billingAddress}
          onChange={handleChange}
          className="form-control form-control-narrow"
        />

        <label className="form-label">Default Post Processing:</label>
        <select
          name="finish"
          value={profileData.finish}
          onChange={handleChange}
          className="form-control form-control-narrow"
        >
          <option value="raw">raw</option>
          <option value="supports_removed">supports_removed</option>
          <option value="ready_to_go">ready_to_go</option>
        </select>

        <label className="form-label">Default Print Quality:</label>
        <select
          name="quality"
          value={profileData.quality}
          onChange={handleChange}
          className="form-control form-control-narrow"
        >
          <option value="draft">draft</option>
          <option value="fit_check">fit_check</option>
          <option value="prototype">prototype</option>
          <option value="production">production</option>
        </select>

        <button type="submit" className="button-primary">Save Changes</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
};

export default Profile;

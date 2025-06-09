import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    contact: '',
    billingAddress: '',
    finish: '',
    quality: '',
  });

  const finishOptions = ['raw', 'supports_removed', 'ready_to_go'];
  const qualityOptions = ['draft', 'fit_check', 'prototype', 'production'];

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, 'profiles', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          name: data.name || '',
          contact: data.contact || '',
          billingAddress: typeof data.billingAddress === 'string' ? data.billingAddress : '',
          finish: data.finish || '',
          quality: data.quality || '',
        });
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const sanitizedProfile = {
      ...profile,
      billingAddress:
        typeof profile.billingAddress === 'string'
          ? profile.billingAddress
          : JSON.stringify(profile.billingAddress),
    };

    await setDoc(doc(db, 'profiles', user.uid), sanitizedProfile);
    alert('Profile updated.');
  };

  return (
    <div className="section-container">
      <h2 className="section-heading">Your Profile</h2>
      <form onSubmit={handleSubmit} className="form-vertical">
        <label className="form-label">Full Name:</label>
        <input
          type="text"
          name="name"
          value={profile.name}
          onChange={handleChange}
          placeholder="Full Name"
          className="form-control form-control-narrow"
        />

        <label className="form-label">Contact Info:</label>
        <input
          type="text"
          name="contact"
          value={profile.contact}
          onChange={handleChange}
          placeholder="Contact Info"
          className="form-control form-control-narrow"
        />

        <label className="form-label">Billing Address:</label>
        <textarea
          name="billingAddress"
          value={profile.billingAddress}
          onChange={handleChange}
          placeholder="Billing Address"
          className="form-control form-control-narrow"
        />

        <label className="form-label">Default Post Processing:</label>
        <select
          name="finish"
          value={profile.finish}
          onChange={handleChange}
          className="form-control form-control-narrow"
        >
          {finishOptions.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        <label className="form-label">Default Print Quality:</label>
        <select
          name="quality"
          value={profile.quality}
          onChange={handleChange}
          className="form-control form-control-narrow"
        >
          {qualityOptions.map((q) => (
            <option key={q} value={q}>
              {q}
            </option>
          ))}
        </select>

        <button type="submit" className="button-primary">
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default Profile;

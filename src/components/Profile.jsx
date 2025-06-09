import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    contact: '',
    billingAddress: '',
    shippingAddress: '',
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
        setProfile({ ...profile, ...docSnap.data() });
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

    await setDoc(doc(db, 'profiles', user.uid), profile);
    alert('Profile updated.');
  };

  return (
    <div className="section-container">
      <h2 className="section-heading">Your Profile</h2>
      <form onSubmit={handleSubmit} className="form-vertical">
        <input
          type="text"
          name="name"
          value={profile.name}
          onChange={handleChange}
          placeholder="Full Name"
          className="form-control"
        />
        <input
          type="text"
          name="contact"
          value={profile.contact}
          onChange={handleChange}
          placeholder="Contact Info"
          className="form-control"
        />
        <textarea
          name="billingAddress"
          value={profile.billingAddress}
          onChange={handleChange}
          placeholder="Billing Address"
          className="form-control"
        />
        <textarea
          name="shippingAddress"
          value={profile.shippingAddress}
          onChange={handleChange}
          placeholder="Shipping Address"
          className="form-control"
        />

        <label className="form-label">Default Post Processing:</label>
        <select
          name="finish"
          value={profile.finish}
          onChange={handleChange}
          className="form-control"
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
          className="form-control"
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

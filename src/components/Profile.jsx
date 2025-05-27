// ✅ FILE: src/components/Profile.jsx

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({
    name: '',
    contactNumber: '',
    address: '',
    suburb: '',
    city: '',
    zip: '',
    country: '',
    defaultPostProcess: 'raw',  // renamed field
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async u => {
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (snap.exists()) {
          const d = snap.data();
          setProfileData({
            name: d.name || '',
            contactNumber: d.contactNumber || '',
            address: d.defaultShipping?.address || '',
            suburb: d.defaultShipping?.suburb || '',
            city: d.defaultShipping?.city || '',
            zip: d.defaultShipping?.zip || '',
            country: d.defaultShipping?.country || '',
            defaultPostProcess: d.printPreferences?.defaultFinish || 'raw',
          });
        }
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleChange = e => {
    setProfileData(pd => ({ ...pd, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      name: profileData.name,
      contactNumber: profileData.contactNumber,
      defaultShipping: {
        address: profileData.address,
        suburb: profileData.suburb,
        city: profileData.city,
        zip: profileData.zip,
        country: profileData.country,
      },
      printPreferences: {
        defaultFinish: profileData.defaultPostProcess,
      },
    }, { merge: true });
    alert('Profile saved.');
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: '1rem', maxWidth: 600, margin: 'auto' }}>
      <h2>User Profile</h2>
      <input name="name"        value={profileData.name}        onChange={handleChange} placeholder="Name" />
      <input name="contactNumber" value={profileData.contactNumber} onChange={handleChange} placeholder="Contact Number" />
      <input name="address"     value={profileData.address}     onChange={handleChange} placeholder="Address" />
      <input name="suburb"      value={profileData.suburb}      onChange={handleChange} placeholder="Suburb" />
      <input name="city"        value={profileData.city}        onChange={handleChange} placeholder="City" />
      <input name="zip"         value={profileData.zip}         onChange={handleChange} placeholder="Postal Code" />
      <input name="country"     value={profileData.country}     onChange={handleChange} placeholder="Country" />

      <label>Default Post–Processing Finish:</label>
      <select
        name="defaultPostProcess"
        value={profileData.defaultPostProcess}
        onChange={handleChange}
      >
        <option value="raw">Raw (As Printed)</option>
        <option value="supports_removed">Supports Removed</option>
        <option value="ready_to_go">Ready to Go</option>
      </select>

      <button onClick={handleSave}>Save Profile</button>
    </div>
  );
}

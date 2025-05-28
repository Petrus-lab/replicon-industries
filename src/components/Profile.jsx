// ✅ FILE: src/components/Profile.jsx
// UPDATED: Match ShippingForm label styling (bold, 0.9rem, margin)

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const PRINT_QUALITIES = [
  'Draft Quality',
  'Fit Check Quality',
  'Prototype',
  'Production Quality'
];

const POST_PROCESSES = [
  { value: 'raw',             label: 'Raw (As Printed)' },
  { value: 'supports_removed', label: 'Supports Removed' },
  { value: 'ready_to_go',     label: 'Ready to Go' }
];

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
    defaultPrintQuality: PRINT_QUALITIES[0],
    defaultPostProcess: POST_PROCESSES[0].value,
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
            defaultPrintQuality: d.printPreferences?.defaultPrintQuality || PRINT_QUALITIES[0],
            defaultPostProcess:  d.printPreferences?.defaultFinish        || POST_PROCESSES[0].value,
          });
        }
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setProfileData(pd => ({ ...pd, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    await setDoc(
      doc(db, 'users', user.uid),
      {
        email: user.email,
        name: profileData.name,
        contactNumber: profileData.contactNumber,
        defaultShipping: {
          address: profileData.address,
          suburb:  profileData.suburb,
          city:    profileData.city,
          zip:     profileData.zip,
          country: profileData.country,
        },
        printPreferences: {
          defaultPrintQuality: profileData.defaultPrintQuality,
          defaultFinish:       profileData.defaultPostProcess,
        },
      },
      { merge: true }
    );
    alert('Profile saved.');
  };

  if (loading) return <p>Loading...</p>;

  const labelStyle = {
    fontWeight: 'bold',
    fontSize: '0.9rem',
    margin: '0.4rem 0 0.2rem'
  };

  const inputStyle = {
    padding: '6px',
    borderRadius: '4px',
    border: '1px solid #ccc'
  };

  return (
    <div style={{ padding: '1rem', maxWidth: 600, margin: 'auto', fontFamily: 'sans-serif' }}>
      <h2>User Profile</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        <label style={labelStyle}>Name</label>
        <input
          name="name"
          value={profileData.name}
          onChange={handleChange}
          style={inputStyle}
        />

        <label style={labelStyle}>Contact Number</label>
        <input
          name="contactNumber"
          value={profileData.contactNumber}
          onChange={handleChange}
          style={inputStyle}
        />

        <label style={labelStyle}>Address</label>
        <input
          name="address"
          value={profileData.address}
          onChange={handleChange}
          style={inputStyle}
        />

        <label style={labelStyle}>Suburb</label>
        <input
          name="suburb"
          value={profileData.suburb}
          onChange={handleChange}
          style={inputStyle}
        />

        <label style={labelStyle}>City</label>
        <input
          name="city"
          value={profileData.city}
          onChange={handleChange}
          style={inputStyle}
        />

        <label style={labelStyle}>Postal Code</label>
        <input
          name="zip"
          value={profileData.zip}
          onChange={handleChange}
          style={inputStyle}
        />

        <label style={labelStyle}>Country</label>
        <input
          name="country"
          value={profileData.country}
          onChange={handleChange}
          style={inputStyle}
        />

        <label style={labelStyle}>Default Print Quality</label>
        <select
          name="defaultPrintQuality"
          value={profileData.defaultPrintQuality}
          onChange={handleChange}
          style={inputStyle}
        >
          {PRINT_QUALITIES.map((q, i) => (
            <option key={i} value={q}>{q}</option>
          ))}
        </select>

        <label style={labelStyle}>Default Post–Processing Finish</label>
        <select
          name="defaultPostProcess"
          value={profileData.defaultPostProcess}
          onChange={handleChange}
          style={inputStyle}
        >
          {POST_PROCESSES.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

        <button
          onClick={handleSave}
          style={{ marginTop: '1rem', padding: '8px 12px' }}
        >
          Save Profile
        </button>

      </div>
    </div>
  );
}

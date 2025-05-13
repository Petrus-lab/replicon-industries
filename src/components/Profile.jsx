// ✅ FILE: src/components/Profile.jsx

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({
    name: '',
    contactNumber: '',
    address: '',
    city: '',
    suburb: '',
    zip: '',
    country: '',
    defaultFinish: 'raw',
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setProfileData({
            name: data.name || '',
            contactNumber: data.contactNumber || '',
            address: data.defaultShipping?.address || '',
            city: data.defaultShipping?.city || '',
            suburb: data.defaultShipping?.suburb || '',
            zip: data.defaultShipping?.zip || '',
            country: data.defaultShipping?.country || '',
            defaultFinish: data.printPreferences?.defaultFinish || 'raw',
          });
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      email: user.email,
      name: profileData.name,
      contactNumber: profileData.contactNumber,
      defaultShipping: {
        address: profileData.address,
        city: profileData.city,
        suburb: profileData.suburb,
        zip: profileData.zip,
        country: profileData.country,
      },
      printPreferences: {
        defaultFinish: profileData.defaultFinish,
      },
    }, { merge: true });
    alert('Profile updated successfully!');
  };

  if (!user) return <div>Loading user info...</div>;

  return (
    <div>
      <h2>User Profile Management</h2>
      <input name="name" value={profileData.name} onChange={handleChange} placeholder="Name" />
      <input name="contactNumber" value={profileData.contactNumber} onChange={handleChange} placeholder="Contact Number" />
      <input name="address" value={profileData.address} onChange={handleChange} placeholder="Address" />
      <input name="suburb" value={profileData.suburb} onChange={handleChange} placeholder="Suburb" />
      <input name="city" value={profileData.city} onChange={handleChange} placeholder="City" />
      <input name="zip" value={profileData.zip} onChange={handleChange} placeholder="Postal Code" />
      <input name="country" value={profileData.country} onChange={handleChange} placeholder="Country" />
      
      <label>Default Print Finish:</label>
      <select name="defaultFinish" value={profileData.defaultFinish} onChange={handleChange}>
        <option value="raw">Raw (As Printed)</option>
        <option value="supports_removed">Supports Removed</option>
        <option value="ready_to_go">Ready to Go</option>
      </select>

      <button onClick={handleSave}>Save Profile</button>
    </div>
  );
};

export default Profile;

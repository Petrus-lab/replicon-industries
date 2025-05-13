// ✅ FILE: src/components/AdminUserProfileViewer.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const AdminUserProfileViewer = ({ userId }) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setProfile(userSnap.data());
      } else {
        setProfile(null);
      }
    };

    if (userId) loadUserProfile();
  }, [userId]);

  if (profile === null) return <p>No profile data found for this user.</p>;

  return (
    <div>
      <h2>Admin View: User Profile</h2>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Name:</strong> {profile.name || 'Not Provided'}</p>
      <p><strong>Contact Number:</strong> {profile.contactNumber || 'Not Provided'}</p>
      <p><strong>Address:</strong></p>
      <div style={{ paddingLeft: '1rem' }}>
        <p>{profile.defaultShipping?.address || 'N/A'}</p>
        <p>{profile.defaultShipping?.suburb || 'N/A'}</p>
        <p>{profile.defaultShipping?.city || 'N/A'}</p>
        <p>{profile.defaultShipping?.zip || 'N/A'}</p>
        <p>{profile.defaultShipping?.country || 'N/A'}</p>
      </div>
      <p><strong>Default Print Finish:</strong> {profile.printPreferences?.defaultFinish || 'Not Set'}</p>
    </div>
  );
};

export default AdminUserProfileViewer;

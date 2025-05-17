// ✅ FILE: src/components/Profile.jsx

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('Not authenticated.');
          setLoading(false);
          return;
        }

        const profileRef = doc(db, 'users', user.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          setProfile(profileSnap.data());
        } else {
          // Create a default profile if not found
          const defaultProfile = {
            email: user.email,
            name: '',
            phoneNumber: '',
            defaultFinish: 'raw',
          };
          await setDoc(profileRef, defaultProfile);
          setProfile(defaultProfile);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load profile.');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto' }}>
      <h2>My Profile</h2>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Name:</strong> {profile.name || 'Not set'}</p>
      <p><strong>Phone Number:</strong> {profile.phoneNumber || 'Not set'}</p>
      <p><strong>Default Finish:</strong> {profile.defaultFinish}</p>
    </div>
  );
}

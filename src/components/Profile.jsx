// ✅ FILE: src/components/Profile.jsx

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const finishes = ['raw', 'supports_removed', 'ready_to_go'];

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

  const handleChange = (field) => (e) => {
    setProfile({ ...profile, [field]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const user = auth.currentUser;
      const profileRef = doc(db, 'users', user.uid);
      await setDoc(profileRef, profile, { merge: true });
      setSaving(false);
    } catch (err) {
      console.error(err);
      setError('Failed to save profile.');
      setSaving(false);
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto' }}>
      <h2>My Profile</h2>

      <p><strong>Email:</strong> {profile.email}</p>

      <label>Name:</label>
      <input
        type="text"
        value={profile.name}
        onChange={handleChange('name')}
        style={{ width: '100%', marginBottom: '1rem' }}
      />

      <label>Phone Number:</label>
      <input
        type="text"
        value={profile.phoneNumber}
        onChange={handleChange('phoneNumber')}
        style={{ width: '100%', marginBottom: '1rem' }}
      />

      <label>Default Finish:</label>
      <select
        value={profile.defaultFinish}
        onChange={handleChange('defaultFinish')}
        style={{ width: '100%', marginBottom: '1rem' }}
      >
        {finishes.map(finish => (
          <option key={finish} value={finish}>
            {finish.replace('_', ' ')}
          </option>
        ))}
      </select>

      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}

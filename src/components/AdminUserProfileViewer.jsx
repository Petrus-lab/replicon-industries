// ✅ FILE: src/components/AdminUserProfileViewer.jsx

import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function AdminUserProfileViewer() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProfiles(users);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load user profiles.');
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  if (loading) return <p>Loading user profiles...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto' }}>
      <h2>Admin - User Profiles</h2>
      {profiles.length === 0 && <p>No users found.</p>}
      {profiles.map(user => (
        <div key={user.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Name:</strong> {user.name || 'Not set'}</p>
          <p><strong>Phone Number:</strong> {user.phoneNumber || 'Not set'}</p>
          <p><strong>Default Finish:</strong> {user.defaultFinish || 'Not set'}</p>
        </div>
      ))}
    </div>
  );
}

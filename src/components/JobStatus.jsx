// src/components/JobStatus.jsx

import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from 'firebase/firestore';

export default function JobStatus() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyJobs = async () => {
      const user = auth.currentUser;
      if (!user) {
        setError('You must be signed in.');
        setLoading(false);
        return;
      }

      try {
        // Query jobs where uid == currentUser.uid, most recent first
        const jobsRef = collection(db, 'jobs');
        const q = query(
          jobsRef,
          where('uid', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const myJobs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setJobs(myJobs);
      } catch (err) {
        console.error('JobStatus fetch error:', err);
        setError('Failed to load your jobs.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyJobs();
  }, []);

  if (loading) {
    return <p style={{ padding: '2rem' }}>Loading your jobs…</p>;
  }

  if (error) {
    return <p style={{ color: 'red', padding: '2rem' }}>{error}</p>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Your Jobs</h2>
      {jobs.length === 0 ? (
        <p>You have no jobs yet.</p>
      ) : (
        <ul>
          {jobs.map(job => (
            <li key={job.id} style={{ marginBottom: '1rem' }}>
              <strong>File:</strong> {job.fileName || '—'}<br />
              <strong>Status:</strong> {job.status || '—'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

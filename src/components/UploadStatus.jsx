// src/components/UploadStatus.jsx
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';

export default function UploadStatus() {
  const [jobs, setJobs]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    // Query only by UID (no orderBy to avoid composite index requirement)
    const q = query(
      collection(db, 'jobs'),
      where('uid', '==', user.uid)
    );

    const unsub = onSnapshot(
      q,
      snapshot => {
        // Map and sort locally by createdAt descending
        const list = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const ta = a.createdAt?.toDate ? a.createdAt.toDate() : 0;
            const tb = b.createdAt?.toDate ? b.createdAt.toDate() : 0;
            return tb - ta;
          });
        setJobs(list);
        setLoading(false);
      },
      error => {
        console.error('Error fetching job status:', error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  if (loading) return <p>Loading your jobs...</p>;
  if (!jobs.length) return <p>You have no print jobs yet.</p>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2>Your Print Job Status</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {jobs.map(job => (
          <li key={job.id} style={{ 
            border: '1px solid #ccc', 
            borderRadius: 4, 
            padding: '1rem', 
            marginBottom: '1rem' 
          }}>
            <p><strong>File Name:</strong> {job.fileName}</p>
            <p><strong>Material:</strong> {job.filamentType}</p>
            <p><strong>Finish:</strong> {job.finish}</p>
            <p><strong>Color:</strong> {job.color}</p>
            <p><strong>Status:</strong> {job.status}</p>
            {job.shippingAddress && (
              <>
                <p><strong>Shipping Address:</strong></p>
                <div style={{ paddingLeft: '1rem' }}>
                  <div>{job.shippingAddress.addressLine1}</div>
                  <div>{job.shippingAddress.suburb}</div>
                  <div>{job.shippingAddress.city}</div>
                  <div>{job.shippingAddress.postalCode}</div>
                  <div>{job.shippingAddress.country}</div>
                </div>
              </>
            )}
            {job.createdAt?.toDate && (
              <p>
                <strong>Requested:</strong>{' '}
                {job.createdAt.toDate().toLocaleString()}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

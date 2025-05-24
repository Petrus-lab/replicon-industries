// src/components/UploadStatus.jsx
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

export default function UploadStatus() {
  const [jobs, setJobs]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) { setLoading(false); return; }

    const q = query(
      collection(db, 'jobs'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, snap => {
      setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, e => {
      console.error(e);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) return <p>Loading your jobs...</p>;
  if (!jobs.length) return <p>No jobs found.</p>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Your Print Job Status</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {jobs.map(job => (
          <li key={job.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
            <p><strong>File:</strong> {job.fileName}</p>
            <p><strong>Material:</strong> {job.filamentType}</p>
            <p><strong>Finish:</strong> {job.finish}</p> {/* ← added */}
            <p><strong>Color:</strong> {job.color}</p>
            <p><strong>Status:</strong> {job.status}</p>
            {job.shippingAddress && (
              <>
                <p><strong>Shipping:</strong></p>
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
              <p><strong>Requested:</strong> {job.createdAt.toDate().toLocaleString()}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

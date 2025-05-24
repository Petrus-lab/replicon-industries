// src/components/UploadStatus.jsx
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

export default function UploadStatus() {
  const [jobs, setJobs]         = useState([]);
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    // Subscribe to this user's jobs
    const jobsQ = query(
      collection(db, 'jobs'),
      where('uid', '==', user.uid)
    );
    const unsubJobs = onSnapshot(jobsQ, snap => {
      setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, err => {
      console.error('Error loading jobs:', err);
      setLoading(false);
    });

    // Subscribe to this user's orders
    const ordersQ = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );
    const unsubOrders = onSnapshot(ordersQ, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err => {
      console.error('Error loading orders:', err);
    });

    return () => {
      unsubJobs();
      unsubOrders();
    };
  }, []);

  const handlePay = async job => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        jobId: job.id,
        material: job.filamentType,
        color: job.color,
        finish: job.finish,
        cost: job.cost || 0,
        fileUrl: '',            // no real URL yet
        status: 'pending',
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Payment simulation failed:', err);
    }
  };

  if (loading) return <p>Loading your jobs...</p>;
  if (!jobs.length) return <p>You have no print jobs yet.</p>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2>Your Print Job Status</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {jobs.map(job => {
          const paid = orders.some(o => o.jobId === job.id);
          return (
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
              {job.createdAt?.toDate && (
                <p>
                  <strong>Requested:</strong>{' '}
                  {job.createdAt.toDate().toLocaleString()}
                </p>
              )}
              {!paid ? (
                <button onClick={() => handlePay(job)} style={{ marginTop: '0.5rem' }}>
                  Pay (simulate)
                </button>
              ) : (
                <p style={{ color: 'green', marginTop: '0.5rem' }}>
                  ✓ Order Created
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

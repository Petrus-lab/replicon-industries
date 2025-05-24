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
  const [jobs, setJobs]           = useState([]);
  const [orders, setOrders]       = useState([]);
  const [paidJobs, setPaidJobs]   = useState(new Set());
  const [loadingJobs, setLoadingJobs]     = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoadingJobs(false);
      setLoadingOrders(false);
      return;
    }

    // Subscribe to jobs
    const jobsQ = query(collection(db, 'jobs'), where('uid', '==', user.uid));
    const unsubJobs = onSnapshot(jobsQ, snap => {
      setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingJobs(false);
    }, err => {
      console.error('Error loading jobs:', err);
      setLoadingJobs(false);
    });

    // Subscribe to orders
    const ordersQ = query(collection(db, 'orders'), where('userId', '==', user.uid));
    const unsubOrders = onSnapshot(ordersQ, snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(list);
      // Track which jobs have orders
      setPaidJobs(new Set(list.map(o => o.jobId)));
      setLoadingOrders(false);
    }, err => {
      console.error('Error loading orders:', err);
      setLoadingOrders(false);
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
      // Create an order
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        jobId: job.id,
        material: job.filamentType,
        color: job.color,
        finish: job.finish,
        cost: job.cost || 0,
        fileUrl: '',        // placeholder
        status: 'pending',
        createdAt: serverTimestamp()
      });
      // Optimistically mark paid
      setPaidJobs(prev => new Set(prev).add(job.id));
    } catch (err) {
      console.error('Payment simulation failed:', err);
    }
  };

  if (loadingJobs || loadingOrders) return <p>Loading your jobs...</p>;
  if (jobs.length === 0) return <p>You have no print jobs yet.</p>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2>Your Print Job Status</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {jobs.map(job => {
          const paid = paidJobs.has(job.id);
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
                <button
                  onClick={() => handlePay(job)}
                  style={{ marginTop: '0.5rem' }}
                >
                  Pay (simulate)
                </button>
              ) : (
                <button
                  disabled
                  style={{ marginTop: '0.5rem', backgroundColor: '#d3ffd3' }}
                >
                  Paid ✓
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

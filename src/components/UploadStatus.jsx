// ✅ FILE: src/components/UploadStatus.jsx

import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';

export default function UploadStatus() {
  const [jobs, setJobs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Subscribe to this user's jobs
    const jobsQ = query(
      collection(db, 'jobs'),
      where('uid', '==', user.uid)
    );
    const unsubJobs = onSnapshot(jobsQ, snap => {
      setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Subscribe to this user's orders
    const ordersQ = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );
    const unsubOrders = onSnapshot(ordersQ, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    setLoading(false);
    return () => {
      unsubJobs();
      unsubOrders();
    };
  }, []);

  const handlePay = async (job) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      // 1) Create an order document (permits create via new rule)
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        jobId: job.id,
        fileName: job.fileName,
        filamentType: job.filamentType,
        color: job.color,
        cost: job.cost,
        status: 'Paid',
        createdAt: serverTimestamp()
      });

      // 2) Update the job status to "Paid"
      await updateDoc(doc(db, 'jobs', job.id), {
        status: 'Paid'
      });
    } catch (err) {
      console.error('Payment simulation failed:', err);
      alert('Payment simulation failed: ' + err.message);
    }
  };

  if (loading) return <p>Loading your jobs & orders…</p>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Your Jobs</h2>
      <ul>
        {jobs.map(job => (
          <li key={job.id} style={{ marginBottom: '1rem' }}>
            <strong>{job.fileName}</strong> — Status: {job.status}
            {job.status === 'Uploaded' && (
              <button
                onClick={() => handlePay(job)}
                style={{ marginLeft: '1rem' }}
              >
                Pay
              </button>
            )}
          </li>
        ))}
      </ul>

      <h2>Your Orders</h2>
      <ul>
        {orders.map(ord => (
          <li key={ord.id} style={{ marginBottom: '1rem' }}>
            <strong>{ord.fileName}</strong> — Status: {ord.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

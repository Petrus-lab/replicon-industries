// ✅ FILE: src/components/UploadStatus.jsx
// RESTORED: Original card‐style cosmetics + working “Pay” button

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

    const jobsQ = query(collection(db, 'jobs'), where('uid', '==', user.uid));
    const unsubJobs = onSnapshot(jobsQ, snap => {
      setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const ordersQ = query(collection(db, 'orders'), where('userId', '==', user.uid));
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

      // create order
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

      // update job status
      await updateDoc(doc(db, 'jobs', job.id), { status: 'Paid' });
    } catch (err) {
      console.error('Payment simulation failed:', err);
      alert('Payment failed: ' + err.message);
    }
  };

  if (loading) return <p>Loading…</p>;

  const listStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0
  };

  const itemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    marginBottom: '0.5rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    background: '#fafafa'
  };

  const sectionStyle = { maxWidth: 600, margin: '2rem auto' };

  return (
    <div style={sectionStyle}>
      <h2>Your Jobs</h2>
      <ul style={listStyle}>
        {jobs.map(job => (
          <li key={job.id} style={itemStyle}>
            <div>
              <strong>{job.fileName}</strong><br/>
              Status: {job.status}
            </div>
            {job.status === 'Uploaded' && (
              <button onClick={() => handlePay(job)}>
                Pay
              </button>
            )}
          </li>
        ))}
      </ul>

      <h2>Your Orders</h2>
      <ul style={listStyle}>
        {orders.map(ord => (
          <li key={ord.id} style={itemStyle}>
            <div>
              <strong>{ord.fileName}</strong><br/>
              Status: {ord.status}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ✅ FILE: src/components/UploadStatus.jsx
// REFACTORED: Logical grid layout for Jobs & Orders, preserved “Pay” functionality

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

      // Create order
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

      // Update job status
      await updateDoc(doc(db, 'jobs', job.id), { status: 'Paid' });
    } catch (err) {
      console.error('Payment simulation failed:', err);
      alert('Payment failed: ' + err.message);
    }
  };

  if (loading) return <p>Loading your jobs and orders…</p>;

  // Styles
  const sectionStyle = {
    maxWidth: 700,
    margin: '2rem auto',
    padding: '1rem',
    fontFamily: 'sans-serif'
  };
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: '3fr 1fr 1fr',
    gap: '1rem',
    alignItems: 'center',
    marginBottom: '2rem'
  };
  const headerStyle = {
    fontWeight: 'bold',
    borderBottom: '2px solid #333',
    padding: '0.5rem 0'
  };
  const rowStyle = {
    padding: '0.75rem 0',
    borderBottom: '1px solid #ccc'
  };
  const buttonStyle = {
    padding: '6px 12px',
    cursor: 'pointer',
    border: '1px solid #007bff',
    borderRadius: '4px',
    background: '#007bff',
    color: '#fff'
  };

  return (
    <div style={sectionStyle}>
      {/* Jobs Section */}
      <h2>Your Jobs</h2>
      <div style={gridStyle}>
        <div style={headerStyle}>File Name</div>
        <div style={headerStyle}>Status</div>
        <div style={headerStyle}>Action</div>
        {jobs.map(job => (
          <React.Fragment key={job.id}>
            <div style={rowStyle}>{job.fileName}</div>
            <div style={rowStyle}>{job.status}</div>
            <div style={rowStyle}>
              {job.status === 'Uploaded' && (
                <button
                  style={buttonStyle}
                  onClick={() => handlePay(job)}
                >
                  Pay
                </button>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Orders Section */}
      <h2>Your Orders</h2>
      <div style={gridStyle}>
        <div style={headerStyle}>File Name</div>
        <div style={headerStyle}>Status</div>
        <div style={headerStyle}></div>
        {orders.map(order => (
          <React.Fragment key={order.id}>
            <div style={rowStyle}>{order.fileName}</div>
            <div style={rowStyle}>{order.status}</div>
            <div style={rowStyle}></div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

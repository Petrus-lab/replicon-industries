// ✅ FILE: src/components/UploadStatus.jsx

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc
} from 'firebase/firestore';

export default function UploadStatus() {
  const [jobs, setJobs]       = useState([]);
  const [orders, setOrders]   = useState([]);
  const [error, setError]     = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Listen for this user's jobs
    const jobsCol    = collection(db, 'jobs');
    const jobsQ      = query(jobsCol, where('uid', '==', user.uid));
    const unsubscribeJobs = onSnapshot(jobsQ, snapshot => {
      const jobList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setJobs(jobList);
    });

    // Listen for this user's orders
    const ordersCol = collection(db, 'orders');
    const ordersQ   = query(ordersCol, where('userId', '==', user.uid));
    const unsubscribeOrders = onSnapshot(ordersQ, snapshot => {
      const orderList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(orderList);
    });

    return () => {
      unsubscribeJobs();
      unsubscribeOrders();
    };
  }, []);

  const handlePay = async (orderId) => {
    setError('');
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: 'Paid' });
    } catch (err) {
      console.error('Payment simulation failed:', err);
      setError('Payment simulation failed: ' + err.message);
    }
  };

  return (
    <div className="form" style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2 className="form-title">Your Status</h2>

      {error && (
        <p style={{ color: 'red' }}>{error}</p>
      )}

      <section className="form-group">
        <h3 className="form-subtitle">Your Jobs</h3>
        {jobs.length === 0 ? (
          <p>You have no jobs yet.</p>
        ) : (
          <ul className="status-list">
            {jobs.map(job => (
              <li key={job.id} className="status-item">
                <p><strong>File:</strong> {job.fileName}</p>
                <p><strong>Status:</strong> {job.status}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="form-group" style={{ marginTop: '2rem' }}>
        <h3 className="form-subtitle">Your Orders</h3>
        {orders.length === 0 ? (
          <p>You have no orders yet.</p>
        ) : (
          <ul className="status-list">
            {orders.map(order => (
              <li key={order.id} className="status-item">
                <p><strong>Material:</strong> {order.material}</p>
                <p><strong>Color:</strong> {order.color}</p>
                <p><strong>Cost:</strong> {order.cost}</p>
                <p><strong>Status:</strong> {order.status}</p>
                {order.status !== 'Paid' && (
                  <button
                    onClick={() => handlePay(order.id)}
                    className="form-button"
                    style={{ marginTop: '0.5rem' }}
                  >
                    Pay
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

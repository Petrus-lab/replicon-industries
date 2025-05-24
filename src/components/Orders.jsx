// src/components/Orders.jsx
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';

export default function Orders() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    // Listen for real orders in /orders
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );

    const unsub = onSnapshot(q, snap => {
      const list = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const ta = a.createdAt?.toDate ? a.createdAt.toDate() : 0;
          const tb = b.createdAt?.toDate ? b.createdAt.toDate() : 0;
          return tb - ta;
        });
      setOrders(list);
      setLoading(false);
    }, err => {
      console.error('Error fetching orders:', err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) return <p>Loading your orders...</p>;
  if (!orders.length) return <p>You have no orders yet.</p>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2>Your Orders</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {orders.map(o => (
          <li key={o.id} style={{
            border: '1px solid #ccc',
            borderRadius: 4,
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <p><strong>Order ID:</strong> {o.id}</p>
            {o.jobId && <p><strong>From Job:</strong> {o.jobId}</p>}
            <p><strong>Material:</strong> {o.material}</p>
            <p><strong>Finish:</strong> {o.finish}</p>
            <p><strong>Color:</strong> {o.color}</p>
            <p><strong>Cost:</strong> ${ (o.cost || 0).toFixed(2) }</p>
            <p><strong>Status:</strong> {o.status}</p>
            {o.createdAt?.toDate && (
              <p>
                <strong>Ordered:</strong>{' '}
                {o.createdAt.toDate().toLocaleString()}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

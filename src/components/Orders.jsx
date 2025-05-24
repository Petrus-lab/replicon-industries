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

    // Listen for orders belonging to this user
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );

    const unsub = onSnapshot(q, snapshot => {
      const list = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        // optional: sort by cost or any other field
        .sort((a, b) => {
          // Sort by creation order if you added createdAt
          const ta = a.createdAt?.toDate ? a.createdAt.toDate() : 0;
          const tb = b.createdAt?.toDate ? b.createdAt.toDate() : 0;
          return tb - ta;
        });
      setOrders(list);
      setLoading(false);
    }, error => {
      console.error('Error fetching orders:', error);
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
            <p><strong>Material:</strong> {o.material}</p>
            <p><strong>Color:</strong> {o.color}</p>
            <p><strong>Finish:</strong> {o.finish || 'N/A'}</p>
            <p><strong>Cost:</strong> ${o.cost.toFixed(2)}</p>
            {o.fileUrl && (
              <p>
                <strong>File:</strong>{' '}
                <a href={o.fileUrl} target="_blank" rel="noopener noreferrer">
                  View
                </a>
              </p>
            )}
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

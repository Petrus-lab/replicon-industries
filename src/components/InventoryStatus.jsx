// ✅ FILE: src/components/InventoryStatus.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function InventoryStatus() {
  const [redItems, setRedItems]       = useState([]); // stockLevel ≤ 0
  const [orangeItems, setOrangeItems] = useState([]); // 0 < stockLevel ≤ reorderThreshold
  const [allClear, setAllClear]       = useState(false);

  useEffect(() => {
    // Subscribe to real-time updates on the "inventory" collection
    const unsubscribe = onSnapshot(collection(db, 'inventory'), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (docs.length === 0) {
        setRedItems([]);
        setOrangeItems([]);
        setAllClear(true);
        return;
      }

      const reds = [];
      const oranges = [];

      docs.forEach((docItem) => {
        const qty = Number(docItem.stockLevel);
        const thr = Number(docItem.reorderThreshold);
        if (isNaN(qty) || isNaN(thr)) return;

        if (qty <= 0) {
          reds.push(docItem);
        } else if (qty > 0 && qty <= thr) {
          oranges.push(docItem);
        }
      });

      // Sort reds by earliest arrivalDate first
      reds.sort((a, b) => {
        const dateA = a.arrivalDate?.toDate
          ? a.arrivalDate.toDate()
          : new Date(a.arrivalDate);
        const dateB = b.arrivalDate?.toDate
          ? b.arrivalDate.toDate()
          : new Date(b.arrivalDate);
        return dateA - dateB;
      });

      // Sort oranges by lowest stockLevel first
      oranges.sort((a, b) => Number(a.stockLevel) - Number(b.stockLevel));

      setRedItems(reds);
      setOrangeItems(oranges);
      setAllClear(reds.length === 0 && oranges.length === 0);
    });

    return () => unsubscribe();
  }, []);

  return (
    <section className="form-group">
      <h3 className="form-title">Inventory Status</h3>

      {allClear ? (
        <div
          className="status-panel status-green"
          style={{
            border: '2px solid #28a745',
            backgroundColor: '#d4edda',
            padding: '1rem',
            borderRadius: '4px',
            marginTop: '1rem'
          }}
        >
          ✅ Inventory is up to date
        </div>
      ) : (
        <>
          {redItems.length > 0 && (
            <div
              className="status-panel status-red"
              style={{
                border: '2px solid #dc3545',
                backgroundColor: '#f8d7da',
                padding: '1rem',
                borderRadius: '4px',
                marginTop: '1rem'
              }}
            >
              <h4 className="status-title" style={{ color: '#721c24' }}>
                Out of Stock
              </h4>
              <ul className="status-list">
                {redItems.map((docItem) => {
                  const arrivedDate = docItem.arrivalDate?.toDate
                    ? docItem.arrivalDate.toDate().toLocaleDateString()
                    : new Date(docItem.arrivalDate).toLocaleDateString();

                  return (
                    <li key={docItem.id} style={{ marginBottom: '0.5rem' }}>
                      {docItem.material} / {docItem.color} / {docItem.finish} — Arrived:{' '}
                      {arrivedDate}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {orangeItems.length > 0 && (
            <div
              className="status-panel status-orange"
              style={{
                border: '2px solid #fd7e14',
                backgroundColor: '#fff3cd',
                padding: '1rem',
                borderRadius: '4px',
                marginTop: '1rem'
              }}
            >
              <h4 className="status-title" style={{ color: '#856404' }}>
                Below Reorder Threshold
              </h4>
              <ul className="status-list">
                {orangeItems.map((docItem) => (
                  <li key={docItem.id} style={{ marginBottom: '0.5rem' }}>
                    {docItem.material} / {docItem.color} / {docItem.finish} — Qty:{' '}
                    {docItem.stockLevel} (Threshold: {docItem.reorderThreshold})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}

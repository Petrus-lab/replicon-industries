// ✅ FILE: src/components/InventoryStatus.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function InventoryStatus() {
  const [redItems, setRedItems]       = useState([]); // qtyInStock ≤ 0
  const [orangeItems, setOrangeItems] = useState([]); // 0 < qtyInStock < reorderThreshold
  const [allClear, setAllClear]       = useState(false);

  useEffect(() => {
    // Subscribe to real-time updates on the "inventory" collection
    const unsub = onSnapshot(collection(db, 'inventory'), (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      if (docs.length === 0) {
        // No items at all → consider inventory "up to date"
        setRedItems([]);
        setOrangeItems([]);
        setAllClear(true);
        return;
      }

      // 1. Filter out items that have no qtyInStock or reorderThreshold fields (optional guard)
      const sanitized = docs.filter((item) => {
        return (
          typeof item.qtyInStock === 'number' &&
          typeof item.reorderThreshold === 'number' &&
          item.arrivalDate
        );
      });

      // 2. Build arrays:

      // Out of Stock: qtyInStock ≤ 0
      const reds = sanitized
        .filter((item) => item.qtyInStock <= 0)
        .sort((a, b) => {
          // Sort by earliest arrivalDate first
          // Ensure arrivalDate string is converted to Date
          const dateA = new Date(a.arrivalDate);
          const dateB = new Date(b.arrivalDate);
          return dateA - dateB;
        });

      // Below Reorder Threshold: 0 < qtyInStock < reorderThreshold
      const oranges = sanitized
        .filter(
          (item) =>
            item.qtyInStock > 0 && item.qtyInStock < item.reorderThreshold
        )
        .sort((a, b) => a.qtyInStock - b.qtyInStock);

      setRedItems(reds);
      setOrangeItems(oranges);
      setAllClear(reds.length === 0 && oranges.length === 0);
    });

    // Clean up listener on unmount
    return () => unsub();
  }, []);

  return (
    <section className="form-group">
      <h3 className="form-title">Inventory Status</h3>

      {allClear ? (
        <div className="status-panel status-green">
          ✅ Inventory is up to date
        </div>
      ) : (
        <>
          {redItems.length > 0 && (
            <div className="status-section">
              <h4 className="status-title status-red">Out of Stock</h4>
              <ul className="status-list">
                {redItems.map((item) => (
                  <li key={item.id}>
                    {item.material} / {item.color} / {item.finish} — Arrived:{' '}
                    {new Date(item.arrivalDate).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {orangeItems.length > 0 && (
            <div className="status-section">
              <h4 className="status-title status-orange">
                Below Reorder Threshold
              </h4>
              <ul className="status-list">
                {orangeItems.map((item) => (
                  <li key={item.id}>
                    {item.material} / {item.color} / {item.finish} — Qty:{' '}
                    {item.qtyInStock} (Threshold: {item.reorderThreshold})
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

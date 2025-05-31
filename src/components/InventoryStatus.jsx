// ✅ FILE: src/components/InventoryStatus.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function InventoryStatus() {
  const [redItems, setRedItems]       = useState([]); // stockLevel ≤ 0
  const [orangeItems, setOrangeItems] = useState([]); // 0 < stockLevel < reorderThreshold
  const [allClear, setAllClear]       = useState(false);

  useEffect(() => {
    // Subscribe to real-time updates on the "inventory" collection
    const unsubscribe = onSnapshot(collection(db, 'inventory'), (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      if (docs.length === 0) {
        // No inventory items at all → show “up to date”
        setRedItems([]);
        setOrangeItems([]);
        setAllClear(true);
        return;
      }

      // Filter out any documents missing the expected numeric fields
      const sanitized = docs.filter((docItem) => {
        return (
          typeof docItem.stockLevel === 'number' &&
          typeof docItem.reorderThreshold === 'number' &&
          docItem.arrivalDate
        );
      });

      // 1) Out of Stock: stockLevel ≤ 0
      const reds = sanitized
        .filter((docItem) => docItem.stockLevel <= 0)
        .sort((a, b) => {
          // Sort by earliest arrivalDate first
          const dateA = a.arrivalDate.toDate
            ? a.arrivalDate.toDate()
            : new Date(a.arrivalDate);
          const dateB = b.arrivalDate.toDate
            ? b.arrivalDate.toDate()
            : new Date(b.arrivalDate);
          return dateA - dateB;
        });

      // 2) Below Reorder Threshold: 0 < stockLevel < reorderThreshold
      const oranges = sanitized
        .filter(
          (docItem) =>
            docItem.stockLevel > 0 && docItem.stockLevel < docItem.reorderThreshold
        )
        .sort((a, b) => a.stockLevel - b.stockLevel);

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
        <div className="status-panel status-green">
          ✅ Inventory is up to date
        </div>
      ) : (
        <>
          {redItems.length > 0 && (
            <div className="status-section">
              <h4 className="status-title status-red">Out of Stock</h4>
              <ul className="status-list">
                {redItems.map((docItem) => {
                  const arrivedDate = docItem.arrivalDate.toDate
                    ? docItem.arrivalDate.toDate().toLocaleDateString()
                    : new Date(docItem.arrivalDate).toLocaleDateString();

                  return (
                    <li key={docItem.id}>
                      {docItem.material} / {docItem.color} / {docItem.finish} — Arrived: {arrivedDate}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {orangeItems.length > 0 && (
            <div className="status-section">
              <h4 className="status-title status-orange">Below Reorder Threshold</h4>
              <ul className="status-list">
                {orangeItems.map((docItem) => (
                  <li key={docItem.id}>
                    {docItem.material} / {docItem.color} / {docItem.finish} — Qty: {docItem.stockLevel} (Threshold: {docItem.reorderThreshold})
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

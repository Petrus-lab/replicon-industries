// ✅ FILE: src/components/InventoryStatus.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function InventoryStatus() {
  const [redItems, setRedItems]       = useState([]);
  const [orangeItems, setOrangeItems] = useState([]);
  const [allClear, setAllClear]       = useState(false);

  useEffect(() => {
    // Subscribe to real-time updates on the inventory collection
    const unsub = onSnapshot(collection(db, 'inventory'), snapshot => {
      const rawItems = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      if (rawItems.length === 0) {
        setRedItems([]);
        setOrangeItems([]);
        setAllClear(true);
        return;
      }

      // Dynamically detect field names
      const sample     = rawItems[0];
      const qtyKey     = Object.keys(sample).find(k => /qty/i.test(k))          || 'qtyInStock';
      const thrKey     = Object.keys(sample).find(k => /reorder/i.test(k))      || 'reorderThreshold';
      const dateKey    = Object.keys(sample).find(k => /arrival|date/i.test(k)) || 'arrivalDate';

      // Normalize items
      const items = rawItems.map(item => ({
        ...item,
        qty:       Number(item[qtyKey]       ?? 0),
        threshold: Number(item[thrKey]       ?? 0),
        arrival:   item[dateKey]
      }));

      // Out of stock (qty ≤ 0), oldest arrival first
      const reds = items
        .filter(i => i.qty <= 0)
        .sort((a, b) => new Date(a.arrival) - new Date(b.arrival));

      // Below threshold (0 < qty < threshold), lowest qty first
      const oranges = items
        .filter(i => i.qty > 0 && i.qty < i.threshold)
        .sort((a, b) => a.qty - b.qty);

      setRedItems(reds);
      setOrangeItems(oranges);
      setAllClear(reds.length === 0 && oranges.length === 0);
    });

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
                {redItems.map(item => (
                  <li key={item.id}>
                    {item.material} / {item.color} / {item.finish} — Arrived: {new Date(item.arrival).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {orangeItems.length > 0 && (
            <div className="status-section">
              <h4 className="status-title status-orange">Below Reorder Threshold</h4>
              <ul className="status-list">
                {orangeItems.map(item => (
                  <li key={item.id}>
                    {item.material} / {item.color} / {item.finish} — Qty: {item.qty} (Threshold: {item.threshold})
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

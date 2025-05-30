// ✅ FILE: src/components/InventoryStatus.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function InventoryStatus() {
  const [redItems, setRedItems]       = useState([]);
  const [orangeItems, setOrangeItems] = useState([]);
  const [allClear, setAllClear]       = useState(false);

  useEffect(() => {
    const fetchInventory = async () => {
      const snap = await getDocs(collection(db, 'inventory'));
      const rawItems = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      if (rawItems.length === 0) {
        setAllClear(true);
        return;
      }

      // Dynamically detect field names
      const sample     = rawItems[0];
      const qtyKey     = Object.keys(sample).find(k => /qty/i.test(k))            || 'qtyInStock';
      const thrKey     = Object.keys(sample).find(k => /reorder/i.test(k))        || 'reorderThreshold';
      const dateKey    = Object.keys(sample).find(k => /arrival|date/i.test(k))   || 'arrivalDate';

      // Normalize items with numeric qty & threshold
      const items = rawItems.map(item => ({
        ...item,
        qty:       Number(item[qtyKey]       ?? 0),
        threshold: Number(item[thrKey]       ?? 0),
        arrival:   item[dateKey]
      }));

      // Out of stock (qty ≤ 0), sort by oldest arrival
      const reds = items
        .filter(i => i.qty <= 0)
        .sort((a, b) => new Date(a.arrival) - new Date(b.arrival));

      // Below reorder threshold (0 < qty < threshold), sort by lowest qty
      const oranges = items
        .filter(i => i.qty > 0 && i.qty < i.threshold)
        .sort((a, b) => a.qty - b.qty);

      setRedItems(reds);
      setOrangeItems(oranges);
      setAllClear(reds.length === 0 && oranges.length === 0);
    };

    fetchInventory();
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

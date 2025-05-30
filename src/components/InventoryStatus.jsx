// ✅ FILE: src/components/InventoryStatus.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function InventoryStatus() {
  const [redItems, setRedItems]         = useState([]);
  const [orangeItems, setOrangeItems]   = useState([]);
  const [allClear, setAllClear]         = useState(false);

  useEffect(() => {
    const fetchInventory = async () => {
      const snap = await getDocs(collection(db, 'inventory'));
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Out of stock (qtyInStock ≤ 0), sort by oldest arrivalDate first
      const reds = items
        .filter(i => i.qtyInStock <= 0)
        .sort((a, b) => new Date(a.arrivalDate) - new Date(b.arrivalDate));

      // Below reorderThreshold (0 < qty < reorderThreshold), sort by lowest qty first
      const oranges = items
        .filter(i => i.qtyInStock > 0 && i.qtyInStock < i.reorderThreshold)
        .sort((a, b) => a.qtyInStock - b.qtyInStock);

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
        <div style={{ background: '#d4edda', padding: '1rem', borderRadius: 4 }}>
          ✅ Inventory is up to date
        </div>
      ) : (
        <>
          {redItems.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: '#721c24' }}>Out of Stock</h4>
              <ul>
                {redItems.map(item => (
                  <li key={item.id}>
                    {item.material} / {item.color} / {item.finish} — Arrived: {new Date(item.arrivalDate).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {orangeItems.length > 0 && (
            <div>
              <h4 style={{ color: '#856404' }}>Below Reorder Threshold</h4>
              <ul>
                {orangeItems.map(item => (
                  <li key={item.id}>
                    {item.material} / {item.color} / {item.finish} — Qty: {item.qtyInStock} (Threshold: {item.reorderThreshold})
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

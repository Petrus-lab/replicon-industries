// ✅ FILE: src/components/InventoryManager.jsx
// FINAL: Resupply deletes old batch if qty 0 + full row/column alignment

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection, doc, getDoc, addDoc, updateDoc, deleteDoc, onSnapshot
} from 'firebase/firestore';

const ROLL_SIZES = ['1kg', '3kg', '5kg', '10kg'];

export default function InventoryManager() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    material: '', color: '', finish: '',
    stockLevel: 0, reorderThreshold: 0,
    supplier: '', orderNumber: '', arrivalDate: '',
    rollSize: '', preRollPrice: 0
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'inventory'), (snap) => {
      const cleaned = snap.docs
        .filter((doc) => doc.exists() && doc.id)
        .map((doc) => ({ id: doc.id, ...doc.data() }));
      setItems(cleaned);
    });
    return unsub;
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({
      ...prev,
      [name]: ['stockLevel', 'reorderThreshold', 'preRollPrice'].includes(name)
        ? Math.max(0, Number(value))
        : value
    }));
  };

  const handleAdd = async () => {
    const {
      material, color, finish,
      stockLevel, reorderThreshold,
      supplier, orderNumber, arrivalDate,
      rollSize, preRollPrice
    } = newItem;

    if (!material || !color || !finish || !supplier || !orderNumber || !arrivalDate || !rollSize) {
      setError('All fields must be filled out.');
      return;
    }

    if (stockLevel < 0 || reorderThreshold < 0 || preRollPrice < 0) {
      setError('Numeric values cannot be negative.');
      return;
    }

    await addDoc(collection(db, 'inventory'), newItem);
    setNewItem({
      material: '', color: '', finish: '',
      stockLevel: 0, reorderThreshold: 0,
      supplier: '', orderNumber: '', arrivalDate: '',
      rollSize: '', preRollPrice: 0
    });
    setError('');
  };

  const handleUpdate = async (id, field, value) => {
    const ref = doc(db, 'inventory', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const safeValue = ['stockLevel', 'reorderThreshold', 'preRollPrice'].includes(field)
      ? Math.max(0, Number(value))
      : value;

    await updateDoc(ref, { [field]: safeValue });

    if (field === 'stockLevel' && safeValue === 0) {
      const current = snap.data();
      const hasNewerBatch = items.some(i =>
        i.id !== id &&
        i.material === current.material &&
        i.color === current.color &&
        i.finish === current.finish &&
        i.rollSize === current.rollSize &&
        new Date(i.arrivalDate) > new Date(current.arrivalDate)
      );
      if (hasNewerBatch) {
        await deleteDoc(ref);
        console.log(`Deleted [${id}] — replaced by newer batch.`);
      }
    }
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'inventory', id));
  };

  const handleResupply = async (item) => {
    const qty = parseInt(prompt('Enter Quantity:'), 10);
    const preRollPrice = parseFloat(prompt('Enter Pre-roll Price:'));
    const rollSize = prompt(`Select Roll Size (${ROLL_SIZES.join(', ')}):`, item.rollSize || '1kg');
    const supplier = prompt('Enter Supplier:', item.supplier);
    const orderNumber = prompt('Enter Order Number:');
    const arrivalDate = prompt(
      'Enter Arrival Date (YYYY-MM-DD):',
      new Date().toISOString().split('T')[0]
    );

    if (
      !orderNumber || !supplier || isNaN(qty) || isNaN(preRollPrice) ||
      !arrivalDate || !rollSize || !ROLL_SIZES.includes(rollSize)
    ) return;

    await addDoc(collection(db, 'inventory'), {
      material: item.material,
      color: item.color,
      finish: item.finish,
      stockLevel: Math.max(0, qty),
      reorderThreshold: item.reorderThreshold,
      supplier,
      orderNumber,
      arrivalDate,
      rollSize,
      preRollPrice: Math.max(0, preRollPrice)
    });

    // ✅ Delete the old batch if stockLevel was 0
    if (item.stockLevel === 0) {
      await deleteDoc(doc(db, 'inventory', item.id));
      console.log(`Deleted zero-stock batch [${item.id}] after resupply.`);
    }
  };

  const rowColor = (stock, threshold) =>
    stock <= 0 ? '#f5c6cb' :
    stock <= threshold ? '#ffe8a1' :
    '#c3e6cb';

  const sorted = [...items].sort((a, b) => {
    const prio = (x) =>
      x.stockLevel <= 0 ? 0 : x.stockLevel <= x.reorderThreshold ? 1 : 2;
    const pa = prio(a), pb = prio(b);
    if (pa !== pb) return pa - pb;
    if (pa === 0) return new Date(a.arrivalDate) - new Date(b.arrivalDate);
    return a.stockLevel - b.stockLevel;
  });

  return (
    <div style={{ maxWidth: 1220, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2>Inventory Manager</h2>

      {/* Add Form */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(11, 1fr) 1fr auto',
        gap: '0.5rem',
        alignItems: 'end',
        marginBottom: '1rem'
      }}>
        {[
          ['material', 'Material'],
          ['color', 'Color'],
          ['finish', 'Finish'],
          ['stockLevel', 'Qty'],
          ['rollSize', 'Roll Size'],
          ['preRollPrice', 'Pre-roll Price'],
          ['reorderThreshold', 'Reorder Threshold'],
          ['supplier', 'Supplier'],
          ['orderNumber', 'Order #'],
          ['arrivalDate', 'Arrival Date']
        ].map(([key, label]) => (
          <div key={key} style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{label}</label>
            {key === 'rollSize' ? (
              <select
                name={key}
                value={newItem[key]}
                onChange={handleChange}
                style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="">Select</option>
                {ROLL_SIZES.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            ) : (
              <input
                name={key}
                type={
                  ['stockLevel', 'reorderThreshold', 'preRollPrice'].includes(key)
                    ? 'number' : key === 'arrivalDate' ? 'date' : 'text'
                }
                value={newItem[key]}
                onChange={handleChange}
                style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            )}
          </div>
        ))}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', fontSize: '0.85rem', visibility: 'hidden' }}>Add</label>
          <button onClick={handleAdd} style={{ height: '100%' }}>Add</button>
        </div>
        <div /> {/* Empty column for delete button */}
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Inventory Items */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {sorted.map(item => (
          <li key={item.id} style={{
            backgroundColor: rowColor(item.stockLevel, item.reorderThreshold),
            display: 'grid',
            gridTemplateColumns: 'repeat(11, 1fr) 1fr auto',
            gap: '0.5rem',
            padding: '1rem',
            borderRadius: 6,
            marginBottom: '1rem',
            alignItems: 'center'
          }}>
            <div>{item.material}</div>
            <div>{item.color}</div>
            <div>{item.finish}</div>
            <input type="number" min="0" value={item.stockLevel}
              onChange={e => handleUpdate(item.id, 'stockLevel', Number(e.target.value))} />
            <select value={item.rollSize}
              onChange={e => handleUpdate(item.id, 'rollSize', e.target.value)}>
              {ROLL_SIZES.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <input type="number" min="0" value={item.preRollPrice}
              onChange={e => handleUpdate(item.id, 'preRollPrice', Number(e.target.value))} />
            <input type="number" min="0" value={item.reorderThreshold}
              onChange={e => handleUpdate(item.id, 'reorderThreshold', Number(e.target.value))} />
            <input type="text" value={item.supplier}
              onChange={e => handleUpdate(item.id, 'supplier', e.target.value)} />
            <input type="text" value={item.orderNumber}
              onChange={e => handleUpdate(item.id, 'orderNumber', e.target.value)} />
            <input type="date" value={item.arrivalDate}
              onChange={e => handleUpdate(item.id, 'arrivalDate', e.target.value)} />
            <button onClick={() => handleResupply(item)}>Resupply</button>
            <button onClick={() => handleDelete(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

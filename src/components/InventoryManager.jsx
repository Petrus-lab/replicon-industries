// ✅ FILE: src/components/InventoryManager.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';

export default function InventoryManager() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    material: '',
    color: '',
    finish: '',
    stockLevel: 0,
    rollSize: '',
    preRollPrice: 0,
    reorderThreshold: 0,
    supplier: '',
    orderNumber: '',
    arrivalDate: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'inventory'), (snap) => {
      const clean = snap.docs
        .filter((doc) => doc.exists() && doc.id)
        .map((doc) => ({ id: doc.id, ...doc.data() }));
      setItems(clean);
    });
    return unsub;
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({
      ...prev,
      [name]: ['stockLevel', 'preRollPrice', 'reorderThreshold'].includes(name)
        ? Number(value)
        : value
    }));
  };

  const handleAdd = async () => {
    const {
      material,
      color,
      finish,
      rollSize,
      supplier,
      orderNumber,
      arrivalDate
    } = newItem;

    if (
      !material ||
      !color ||
      !finish ||
      !rollSize ||
      !supplier ||
      !orderNumber ||
      !arrivalDate
    ) {
      setError('All fields are required.');
      return;
    }

    try {
      await addDoc(collection(db, 'inventory'), newItem);
      setNewItem({
        material: '',
        color: '',
        finish: '',
        stockLevel: 0,
        rollSize: '',
        preRollPrice: 0,
        reorderThreshold: 0,
        supplier: '',
        orderNumber: '',
        arrivalDate: ''
      });
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to add item.');
    }
  };

  const handleUpdate = async (id, field, value) => {
    try {
      const ref = doc(db, 'inventory', id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        console.warn('Document no longer exists:', id);
        return;
      }

      await updateDoc(ref, { [field]: value });

      if (field === 'stockLevel' && value === 0) {
        const item = snap.data();
        const newer = items.find(
          (i) =>
            i.material === item.material &&
            i.color === item.color &&
            i.finish === item.finish &&
            i.rollSize === item.rollSize &&
            new Date(i.arrivalDate) > new Date(item.arrivalDate)
        );
        if (newer) await deleteDoc(ref);
      }
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'inventory', id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleResupply = async (item) => {
    const orderNumber = prompt('New Order Number:');
    const supplier = prompt('Supplier:');
    const qty = parseInt(prompt('Quantity:'), 10);
    const arrivalDate = prompt(
      'Arrival Date (YYYY-MM-DD):',
      new Date().toISOString().split('T')[0]
    );
    const rollSize = prompt('Roll Size (1kg, 3kg, 5kg):');
    const preRollPrice = parseFloat(prompt('Pre-roll Price:'));

    if (
      !orderNumber ||
      !supplier ||
      isNaN(qty) ||
      !arrivalDate ||
      !rollSize ||
      isNaN(preRollPrice)
    )
      return;

    try {
      await addDoc(collection(db, 'inventory'), {
        material: item.material,
        color: item.color,
        finish: item.finish,
        stockLevel: qty,
        reorderThreshold: item.reorderThreshold,
        supplier,
        orderNumber,
        arrivalDate,
        rollSize,
        preRollPrice
      });
    } catch (err) {
      console.error('Resupply failed:', err);
    }
  };

  const rowColor = (stock, threshold) =>
    stock <= 0 ? '#f5c6cb' : stock <= threshold ? '#ffe8a1' : '#c3e6cb';

  const sorted = [...items].sort((a, b) => {
    const prio = (x) =>
      x.stockLevel <= 0 ? 0 : x.stockLevel <= x.reorderThreshold ? 1 : 2;
    const pa = prio(a),
      pb = prio(b);
    if (pa !== pb) return pa - pb;
    if (pa === 0) return new Date(a.arrivalDate) - new Date(b.arrivalDate);
    return a.stockLevel - b.stockLevel;
  });

  return (
    <div style={{ maxWidth: 1100, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2>Inventory Manager</h2>

      {/* Add Item Form */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(11, 1fr) auto',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}
      >
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
          <div key={key}>
            <label>{label}</label>
            {key === 'rollSize' ? (
              <select
                name={key}
                value={newItem[key]}
                onChange={handleChange}
              >
                <option value="">Select</option>
                {['1kg', '3kg', '5kg'].map((kg) => (
                  <option key={kg} value={kg}>
                    {kg}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name={key}
                type={
                  key.includes('Price') ||
                  key.includes('Threshold') ||
                  key.includes('Level')
                    ? 'number'
                    : key === 'arrivalDate'
                    ? 'date'
                    : 'text'
                }
                value={newItem[key]}
                onChange={handleChange}
              />
            )}
          </div>
        ))}
        <button onClick={handleAdd}>Add Item</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Inventory Display */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {sorted.map((item) => (
          <li
            key={item.id}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(11, 1fr) auto auto',
              backgroundColor: rowColor(
                item.stockLevel,
                item.reorderThreshold
              ),
              padding: '1rem',
              borderRadius: 4,
              marginBottom: '1rem',
              gap: '0.5rem',
              alignItems: 'center'
            }}
          >
            <div>{item.material}</div>
            <div>{item.color}</div>
            <div>{item.finish}</div>
            <input
              type="number"
              value={item.stockLevel}
              onChange={(e) =>
                handleUpdate(item.id, 'stockLevel', Number(e.target.value))
              }
            />
            <select
              value={item.rollSize}
              onChange={(e) =>
                handleUpdate(item.id, 'rollSize', e.target.value)
              }
            >
              {['1kg', '3kg', '5kg'].map((kg) => (
                <option key={kg} value={kg}>
                  {kg}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={item.preRollPrice}
              onChange={(e) =>
                handleUpdate(item.id, 'preRollPrice', Number(e.target.value))
              }
            />
            <input
              type="number"
              value={item.reorderThreshold}
              onChange={(e) =>
                handleUpdate(
                  item.id,
                  'reorderThreshold',
                  Number(e.target.value)
                )
              }
            />
            <input
              type="text"
              value={item.supplier}
              onChange={(e) =>
                handleUpdate(item.id, 'supplier', e.target.value)
              }
            />
            <input
              type="text"
              value={item.orderNumber}
              onChange={(e) =>
                handleUpdate(item.id, 'orderNumber', e.target.value)
              }
            />
            <input
              type="date"
              value={item.arrivalDate}
              onChange={(e) =>
                handleUpdate(item.id, 'arrivalDate', e.target.value)
              }
            />
            <button onClick={() => handleResupply(item)}>Resupply</button>
            <button onClick={() => handleDelete(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

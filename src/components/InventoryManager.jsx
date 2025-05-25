// src/components/InventoryManager.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  doc,
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
    reorderThreshold: 0,
    supplier: '',
    arrivalDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'inventory'),
      snap => {
        setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      err => {
        console.error('Error loading inventory:', err);
        setError('Failed to load inventory.');
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]:
        name === 'stockLevel' || name === 'reorderThreshold'
          ? Number(value)
          : value
    }));
  };

  const handleAdd = async () => {
    const { material, color, finish, supplier, arrivalDate } = newItem;
    if (!material || !color || !finish || !supplier || !arrivalDate) {
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
        reorderThreshold: 0,
        supplier: '',
        arrivalDate: ''
      });
      setError('');
    } catch {
      setError('Failed to add item.');
    }
  };

  const handleUpdate = async (id, field, value) => {
    try {
      await updateDoc(doc(db, 'inventory', id), { [field]: value });
    } catch (err) {
      console.error('Error updating item:', err);
    }
  };

  const handleDelete = async id => {
    try {
      await deleteDoc(doc(db, 'inventory', id));
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const stockColor = (stock, threshold) => {
    if (stock <= 0) return 'red';
    if (stock <= threshold) return 'orange';
    return 'green';
  };

  if (loading) return <p>Loading inventory…</p>;
  if (error)   return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2>Inventory Manager</h2>

      {/* Add New Item */}
      <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
        <h3>Add New Item</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr) auto',
          gap: '0.5rem'
        }}>
          <input
            name="material"
            placeholder="Material (e.g. PLA)"
            value={newItem.material}
            onChange={handleChange}
          />
          <input
            name="color"
            placeholder="Color (e.g. Red)"
            value={newItem.color}
            onChange={handleChange}
          />
          <input
            name="finish"
            placeholder="Finish (matte/glossy/…)”"
            value={newItem.finish}
            onChange={handleChange}
          />
          <input
            name="stockLevel"
            type="number"
            placeholder="Quantity in Stock"
            value={newItem.stockLevel}
            onChange={handleChange}
          />
          <input
            name="reorderThreshold"
            type="number"
            placeholder="Reorder Threshold"
            value={newItem.reorderThreshold}
            onChange={handleChange}
          />
          <input
            name="supplier"
            placeholder="Supplier"
            value={newItem.supplier}
            onChange={handleChange}
          />
          <input
            name="arrivalDate"
            type="date"
            placeholder="Arrival Date"
            value={newItem.arrivalDate}
            onChange={handleChange}
          />
          <button onClick={handleAdd}>Add Item</button>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>

      {/* List & Manage Items */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map(item => (
          <li key={item.id} style={{
            border: '1px solid #ddd',
            borderRadius: 4,
            padding: '1rem',
            marginBottom: '1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr) 80px',
            columnGap: '0.5rem',
            alignItems: 'center'
          }}>
            <div>{item.material}</div>
            <div>{item.color}</div>
            <div>{item.finish}</div>

            <input
              type="number"
              value={item.stockLevel}
              onChange={e => handleUpdate(item.id, 'stockLevel', Number(e.target.value))}
              style={{
                width: '100%',
                color: stockColor(item.stockLevel, item.reorderThreshold)
              }}
            />

            <input
              type="number"
              value={item.reorderThreshold}
              onChange={e => handleUpdate(item.id, 'reorderThreshold', Number(e.target.value))}
              style={{ width: '100%' }}
            />

            <input
              type="text"
              value={item.supplier}
              onChange={e => handleUpdate(item.id, 'supplier', e.target.value)}
            />

            <input
              type="date"
              value={item.arrivalDate}
              onChange={e => handleUpdate(item.id, 'arrivalDate', e.target.value)}
            />

            <button onClick={() => handleDelete(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// src/components/InventoryManager.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
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
    orderNumber: '',
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
    const {
      material, color, finish,
      supplier, orderNumber, arrivalDate
    } = newItem;
    if (!material || !color || !finish || !supplier || !orderNumber || !arrivalDate) {
      setError('All fields are required.');
      return;
    }
    try {
      await addDoc(collection(db, 'inventory'), newItem);
      setNewItem({
        material:'', color:'', finish:'',
        stockLevel:0, reorderThreshold:0,
        supplier:'', orderNumber:'', arrivalDate:''
      });
      setError('');
    } catch {
      setError('Failed to add item.');
    }
  };

  const handleUpdate = async (id, field, value) => {
    // grab original item details before update
    const original = items.find(i => i.id === id);
    if (!original) return;

    try {
      // update the field
      await updateDoc(doc(db, 'inventory', id), { [field]: value });

      // if stockLevel set to zero, check for newer batch
      if (field === 'stockLevel' && value === 0) {
        const newerQ = query(
          collection(db, 'inventory'),
          where('material','==',original.material),
          where('color','==',original.color),
          where('finish','==',original.finish),
          where('arrivalDate','>', original.arrivalDate)
        );
        const snap = await getDocs(newerQ);
        if (snap.docs.length > 0) {
          await deleteDoc(doc(db, 'inventory', id));
        }
      }
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

  const handleResupply = async item => {
    const orderNumber = prompt('New Order Number:');
    if (!orderNumber) return;
    const supplier = prompt('Supplier for new batch:');
    if (!supplier) return;
    const qtyStr = prompt('Quantity in stock for new batch:');
    const qty = parseInt(qtyStr, 10);
    if (isNaN(qty) || qty < 0) {
      alert('Invalid quantity');
      return;
    }
    const arrivalDate = prompt(
      'Arrival Date (YYYY-MM-DD):',
      new Date().toISOString().split('T')[0]
    );
    if (!arrivalDate) return;
    try {
      await addDoc(collection(db, 'inventory'), {
        material: item.material,
        color: item.color,
        finish: item.finish,
        stockLevel: qty,
        reorderThreshold: item.reorderThreshold,
        supplier,
        orderNumber,
        arrivalDate
      });
    } catch (err) {
      console.error('Error adding resupply batch:', err);
    }
  };

  const rowColor = (stock, threshold) => {
    if (stock <= 0) return '#f5c6cb';
    if (stock <= threshold) return '#ffe8a1';
    return '#c3e6cb';
  };

  if (loading) return <p>Loading inventory…</p>;
  if (error)   return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ maxWidth: 920, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2>Inventory Manager</h2>

      {/* Add New Item */}
      <div style={{
        marginBottom: '1.5rem',
        borderBottom: '1px solid #ccc',
        paddingBottom: '1rem'
      }}>
        <h3>Add New Item</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns:
            '1fr 1fr 1fr 100px 150px 1fr 1fr 120px auto',
          gap: '0.5rem'
        }}>
          {[
            ['material','Material'],
            ['color','Color'],
            ['finish','Finish'],
            ['stockLevel','Qty in Stock'],
            ['reorderThreshold','Reorder Threshold'],
            ['supplier','Supplier'],
            ['orderNumber','Order Number'],
            ['arrivalDate','Arrival Date']
          ].map(([name,label]) => (
            <div key={name}>
              <label style={{ whiteSpace:'nowrap' }}>{label}</label>
              <input
                name={name}
                type={
                  name === 'arrivalDate' ? 'date'
                  : name.includes('Level')||name.includes('Threshold') ? 'number'
                  : 'text'
                }
                min={name.includes('Level')||name.includes('Threshold')?0:undefined}
                step={name.includes('Level')||name.includes('Threshold')?1:undefined}
                value={newItem[name]}
                onChange={handleChange}
                style={{ width:'100%' }}
              />
            </div>
          ))}
          <button onClick={handleAdd} style={{ height: '2.5rem' }}>
            Add Item
          </button>
        </div>
        {error && <p style={{ color:'red' }}>{error}</p>}
      </div>

      {/* List & Manage Items */}
      <ul style={{ listStyle:'none', padding:0 }}>
        {items.sort((a,b) => {
          const prio = x =>
            x.stockLevel <= 0 ? 0 :
            x.stockLevel <= x.reorderThreshold ? 1 :
            2;
          const pa = prio(a), pb = prio(b);
          if (pa !== pb) return pa - pb;
          if (pa === 0) {
            const da = new Date(a.arrivalDate).getTime();
            const db_ = new Date(b.arrivalDate).getTime();
            return da - db_;
          }
          return a.stockLevel - b.stockLevel;
        }).map(item => (
          <li key={item.id} style={{
            backgroundColor: rowColor(item.stockLevel, item.reorderThreshold),
            border:'1px solid #ddd',
            borderRadius:4,
            padding:'1rem',
            marginBottom:'1rem',
            display:'grid',
            gridTemplateColumns:
              '1fr 1fr 1fr 100px 150px 1fr 1fr 120px 80px 80px',
            columnGap:'0.5rem',
            alignItems:'center'
          }}>
            <div>{item.material}</div>
            <div>{item.color}</div>
            <div>{item.finish}</div>
            <input
              type="number"
              min="0" step="1"
              value={item.stockLevel}
              onChange={e =>
                handleUpdate(item.id,'stockLevel',Number(e.target.value))
              }
              style={{ width:'100%', height:'2rem' }}
            />
            <input
              type="number"
              min="0" step="1"
              value={item.reorderThreshold}
              onChange={e =>
                handleUpdate(item.id,'reorderThreshold',Number(e.target.value))
              }
              style={{ width:'100%', height:'2rem' }}
            />
            <input
              type="text"
              value={item.supplier}
              onChange={e =>
                handleUpdate(item.id,'supplier',e.target.value)
              }
              style={{ height:'2rem' }}
            />
            <input
              type="text"
              value={item.orderNumber}
              onChange={e =>
                handleUpdate(item.id,'orderNumber',e.target.value)
              }
              style={{ height:'2rem' }}
            />
            <input
              type="date"
              value={item.arrivalDate}
              onChange={e =>
                handleUpdate(item.id,'arrivalDate',e.target.value)
              }
              style={{ height:'2rem' }}
            />

            <button onClick={() => handleResupply(item)}>
              Resupply
            </button>
            <button onClick={() => handleDelete(item.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// src/components/UploadForm.jsx
import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp, getDoc, doc, onSnapshot } from 'firebase/firestore';

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [material, setMaterial] = useState('');
  const [color, setColor] = useState('');
  const [finish, setFinish] = useState('');
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [materials, setMaterials] = useState([]);
  const [colors, setColors] = useState([]);
  const [finishes, setFinishes] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'inventory'), snap => {
      const inStock = snap.docs.map(doc => doc.data()).filter(i => i.stockLevel > 0);
      setInventory(inStock);
      setMaterials([...new Set(inStock.map(i => i.material))]);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!material) return setColors([]);
    const options = inventory.filter(i => i.material === material);
    setColors([...new Set(options.map(i => i.color))]);
  }, [material, inventory]);

  useEffect(() => {
    if (!material || !color) return setFinishes([]);
    const options = inventory.filter(i => i.material === material && i.color === color);
    setFinishes([...new Set(options.map(i => i.finish))]);
  }, [color, material, inventory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !material || !color || !finish) {
      return setError('Please complete all fields');
    }
    try {
      const user = auth.currentUser;
      const pricingSnap = await getDoc(doc(db, 'settings', 'pricing'));
      const markupSnap = await getDoc(doc(db, 'settings', 'markupSettings'));
      const baseCosts = pricingSnap.exists() ? pricingSnap.data().baseCosts : {};
      const markup = markupSnap.exists() ? markupSnap.data().markupSettings : 0;
      const cost = +(baseCosts[material] * (1 + markup)).toFixed(2);
      await addDoc(collection(db, 'jobs'), {
        uid: user.uid,
        email: user.email,
        fileName: file.name,
        filamentType: material,
        color,
        finish,
        cost,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setSuccess(`Job uploaded. Estimated cost: $${cost}`);
      setFile(null); setMaterial(''); setColor(''); setFinish('');
    } catch (err) {
      console.error(err);
      setError('Upload failed.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '2rem auto' }}>
      <h2>Upload Your 3D Print</h2>
      <input type="file" accept=".stl,.obj" onChange={e => setFile(e.target.files[0])} />
      <label>Material:</label>
      <select value={material} onChange={e => setMaterial(e.target.value)}>
        <option value="">-- select --</option>
        {materials.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
      <label>Color:</label>
      <select value={color} onChange={e => setColor(e.target.value)} disabled={!material}>
        <option value="">-- select --</option>
        {colors.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <label>Finish:</label>
      <select value={finish} onChange={e => setFinish(e.target.value)} disabled={!color}>
        <option value="">-- select --</option>
        {finishes.map(f => <option key={f} value={f}>{f}</option>)}
      </select>
      <button type="submit" style={{ marginTop: '1rem' }}>Submit</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </form>
  );
}

// ✅ FILE: src/components/UploadForm.jsx

import React, { useState, useEffect } from 'react';
import { db, storage, auth } from '../firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [material, setMaterial] = useState('');
  const [color, setColor] = useState('');
  const [inv, setInv] = useState([]);
  const [finishes, setFinishes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Load inventory with stock > 0 once
  useEffect(() => {
    (async () => {
      const snap = await getDocs(
        query(collection(db, 'inventory'), where('stockLevel', '>', 0))
      );
      setInv(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    })();
  }, []);

  const materials = Array.from(new Set(inv.map(i => i.material)));
  const colors = material
    ? Array.from(new Set(inv.filter(i=>i.material===material).map(i=>i.color)))
    : [];

  // When material & color chosen, derive finishes
  useEffect(() => {
    if (!material || !color) {
      setFinishes([]);
      return;
    }
    const list = inv
      .filter(i => i.material===material && i.color===color)
      .map(i => i.finish);
    setFinishes(Array.from(new Set(list)));
  }, [material, color, inv]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!auth.currentUser) {
      setError('Sign in to upload.');
      return;
    }
    if (!file || !material || !color || !finishes.length) {
      setError('All fields required.');
      return;
    }
    setUploading(true);
    try {
      const user = auth.currentUser;
      const sRef = ref(storage, `uploads/${user.uid}/${file.name}`);
      await uploadBytes(sRef, file);
      const url = await getDownloadURL(sRef);

      await addDoc(collection(db, 'jobs'), {
        uid: user.uid,
        email: user.email,
        fileName: file.name,
        filamentType: material,
        color,
        finish: finishes[0], // or let user pick one via another select
        cost: 0,
        status: 'Uploaded',
        fileUrl: url,
        createdAt: serverTimestamp()
      });

      alert('Upload successful!');
      setFile(null);
      setMaterial('');
      setColor('');
    } catch (err) {
      console.error(err);
      setError('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Upload Print Job</h2>
      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
        <input type="file" accept=".stl" onChange={e=>setFile(e.target.files[0]||null)} />

        <select value={material} onChange={e=>{ setMaterial(e.target.value); setColor(''); }}>
          <option value="">Select Material</option>
          {materials.map((m,i)=><option key={i} value={m}>{m}</option>)}
        </select>

        <select value={color} onChange={e=>setColor(e.target.value)} disabled={!material}>
          <option value="">Select Color</option>
          {colors.map((c,i)=><option key={i} value={c}>{c}</option>)}
        </select>

        <select value={finishes[0]||''} onChange={e=>{/* optional: allow user pick finish */}}>
          <option value="">Select Finish</option>
          {finishes.map((f,i)=><option key={i} value={f}>{f}</option>)}
        </select>

        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading…' : 'Submit'}
        </button>

        {error && <p style={{ color:'red' }}>{error}</p>}
      </form>
    </div>
  );
}

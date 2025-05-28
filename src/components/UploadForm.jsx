// ✅ FILE: src/components/UploadForm.jsx
// ENHANCED: add “Print Quality” + “Post‐Processing” fields, defaulting to user profile

import React, { useState, useEffect } from 'react';
import { db, storage, auth } from '../firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  getDoc,
  doc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const PRINT_QUALITIES = [
  'Draft Quality',
  'Fit Check Quality',
  'Prototype',
  'Production Quality'
];

const POST_PROCESSES = [
  { value: 'raw',            label: 'Raw (As Printed)' },
  { value: 'supports_removed', label: 'Supports Removed' },
  { value: 'ready_to_go',    label: 'Ready to Go' }
];

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [material, setMaterial] = useState('');
  const [color, setColor] = useState('');
  const [inv, setInv] = useState([]);
  const [finishes, setFinishes] = useState([]);

  const [printQuality, setPrintQuality] = useState(PRINT_QUALITIES[0]);
  const [defaultPostProcess, setDefaultPostProcess] = useState('raw');
  const [postProcess, setPostProcess] = useState('raw');

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // 1) Load inventory (stock > 0)
  useEffect(() => {
    (async () => {
      const snap = await getDocs(
        query(collection(db, 'inventory'), where('stockLevel', '>', 0))
      );
      setInv(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    })();
  }, []);

  // 2) Load user default post-process from profile
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const dp = snap.data().printPreferences?.defaultFinish || 'raw';
          setDefaultPostProcess(dp);
          setPostProcess(dp);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    })();
  }, []);

  // Derived dropdown options
  const materials = Array.from(new Set(inv.map(i => i.material)));
  const colors   = material
    ? Array.from(new Set(inv.filter(i => i.material === material).map(i => i.color)))
    : [];

  // Derive finishes (inventory finish) after material+color
  useEffect(() => {
    if (!material || !color) {
      setFinishes([]);
      return;
    }
    const list = inv
      .filter(i => i.material === material && i.color === color)
      .map(i => i.finish);
    setFinishes(Array.from(new Set(list)));
  }, [material, color, inv]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const user = auth.currentUser;
    if (!user) {
      setError('You must be signed in to upload.');
      return;
    }
    if (!file || !material || !color || !finishes.length) {
      setError('File, Material, Color, and Finish are required.');
      return;
    }

    setUploading(true);
    try {
      // 3) Upload file to Storage
      const storageRef = ref(storage, `uploads/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      // 4) Create job document
      await addDoc(collection(db, 'jobs'), {
        uid:           user.uid,
        email:         user.email,
        fileName:      file.name,
        filamentType:  material,
        color,
        finish:        finishes[0],       // inventory finish
        printQuality,                   // new field
        postProcess,                    // new field
        cost:          0,
        status:        'Uploaded',
        fileUrl,
        createdAt:     serverTimestamp()
      });

      alert('Upload successful!');
      // Reset form
      setFile(null);
      setMaterial('');
      setColor('');
      setPrintQuality(PRINT_QUALITIES[0]);
      setPostProcess(defaultPostProcess);
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
      <form onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        <input
          type="file"
          accept=".stl"
          onChange={e => setFile(e.target.files[0] ?? null)}
        />

        <select
          value={material}
          onChange={e => { setMaterial(e.target.value); setColor(''); }}
        >
          <option value="">Select Material</option>
          {materials.map((m,i) => <option key={i} value={m}>{m}</option>)}
        </select>

        <select
          value={color}
          onChange={e => setColor(e.target.value)}
          disabled={!material}
        >
          <option value="">Select Color</option>
          {colors.map((c,i) => <option key={i} value={c}>{c}</option>)}
        </select>

        <select
          value={finishes[0] || ''}
          onChange={e => {}}
          disabled
        >
          <option value="">
            {finishes[0] ? `Finish: ${finishes[0]}` : 'Select Material & Color'}
          </option>
        </select>

        <select
          value={printQuality}
          onChange={e => setPrintQuality(e.target.value)}
        >
          {PRINT_QUALITIES.map((q,i) => (
            <option key={i} value={q}>{q}</option>
          ))}
        </select>

        <select
          value={postProcess}
          onChange={e => setPostProcess(e.target.value)}
        >
          {POST_PROCESSES.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading…' : 'Submit'}
        </button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}

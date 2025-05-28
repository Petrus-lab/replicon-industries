// ✅ FILE: src/components/UploadForm.jsx
// UPDATED: Match ShippingForm label styling (bold, 0.9rem, margin)

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
  { value: 'raw',             label: 'Raw (As Printed)' },
  { value: 'supports_removed', label: 'Supports Removed' },
  { value: 'ready_to_go',     label: 'Ready to Go' }
];

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [material, setMaterial] = useState('');
  const [color, setColor] = useState('');
  const [inv, setInv] = useState([]);
  const [finishes, setFinishes] = useState([]);

  const [defaultPrintQuality, setDefaultPrintQuality] = useState(PRINT_QUALITIES[0]);
  const [printQuality, setPrintQuality] = useState(PRINT_QUALITIES[0]);

  const [defaultPostProcess, setDefaultPostProcess] = useState('raw');
  const [postProcess, setPostProcess] = useState('raw');

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Load inventory once
  useEffect(() => {
    (async () => {
      const snap = await getDocs(
        query(collection(db, 'inventory'), where('stockLevel', '>', 0))
      );
      setInv(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    })();
  }, []);

  // Load user defaults
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const prefs = snap.data().printPreferences || {};
          setDefaultPrintQuality(prefs.defaultPrintQuality || PRINT_QUALITIES[0]);
          setPrintQuality(prefs.defaultPrintQuality || PRINT_QUALITIES[0]);
          setDefaultPostProcess(prefs.defaultFinish || 'raw');
          setPostProcess(prefs.defaultFinish || 'raw');
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const materials = Array.from(new Set(inv.map(i => i.material)));
  const colors = material
    ? Array.from(new Set(inv.filter(i => i.material === material).map(i => i.color)))
    : [];

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

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    const user = auth.currentUser;
    if (!user) {
      setError('Sign in to upload.');
      return;
    }
    if (!file || !material || !color || !finishes.length) {
      setError('Please complete all dropdowns and select a file.');
      return;
    }

    setUploading(true);
    try {
      const storageRef = ref(storage, `uploads/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'jobs'), {
        uid:           user.uid,
        email:         user.email,
        fileName:      file.name,
        filamentType:  material,
        color,
        finish:        finishes[0],
        printQuality,
        postProcess,
        cost:          0,
        status:        'Uploaded',
        fileUrl,
        createdAt:     serverTimestamp()
      });

      alert('Upload successful!');
      setFile(null);
      setMaterial('');
      setColor('');
      setPrintQuality(defaultPrintQuality);
      setPostProcess(defaultPostProcess);
    } catch (err) {
      console.error(err);
      setError('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const labelStyle = {
    fontWeight: 'bold',
    fontSize: '0.9rem',
    margin: '0.4rem 0 0.2rem'
  };

  const inputStyle = {
    padding: '6px',
    borderRadius: '4px',
    border: '1px solid #ccc'
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2>Upload Print Job</h2>
      <form onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        <label style={labelStyle}>STL File</label>
        <input
          type="file"
          accept=".stl"
          onChange={e => setFile(e.target.files[0] ?? null)}
        />

        <label style={labelStyle}>Material</label>
        <select
          value={material}
          onChange={e => { setMaterial(e.target.value); setColor(''); }}
          style={inputStyle}
        >
          <option value="">Select Material</option>
          {materials.map((m, i) => <option key={i} value={m}>{m}</option>)}
        </select>

        <label style={labelStyle}>Color</label>
        <select
          value={color}
          onChange={e => setColor(e.target.value)}
          disabled={!material}
          style={inputStyle}
        >
          <option value="">Select Color</option>
          {colors.map((c, i) => <option key={i} value={c}>{c}</option>)}
        </select>

        <label style={labelStyle}>Available Finish</label>
        <input
          type="text"
          value={finishes[0] ? finishes[0] : 'Select Material & Color'}
          disabled
          style={inputStyle}
        />

        <label style={labelStyle}>Print Quality</label>
        <select
          value={printQuality}
          onChange={e => setPrintQuality(e.target.value)}
          style={inputStyle}
        >
          {PRINT_QUALITIES.map((q, i) => (
            <option key={i} value={q}>{q}</option>
          ))}
        </select>

        <label style={labelStyle}>Post–Processing Finish</label>
        <select
          value={postProcess}
          onChange={e => setPostProcess(e.target.value)}
          style={inputStyle}
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

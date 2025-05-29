// ✅ FILE: src/components/UploadForm.jsx
// REFACTORED: uses global.css classes only—no inline styles

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
  { value: 'raw',              label: 'Raw (As Printed)' },
  { value: 'supports_removed', label: 'Supports Removed' },
  { value: 'ready_to_go',      label: 'Ready to Go' }
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

  // Load user defaults once
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    (async () => {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const prefs = snap.data().printPreferences || {};
        const dpq = prefs.defaultPrintQuality || PRINT_QUALITIES[0];
        const dpp = prefs.defaultFinish      || 'raw';
        setDefaultPrintQuality(dpq);
        setPrintQuality(dpq);
        setDefaultPostProcess(dpp);
        setPostProcess(dpp);
      }
    })();
  }, []);

  // Derive material/color/finish lists
  const materials = Array.from(new Set(inv.map(i => i.material)));
  const colors    = material
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
      setError('Complete all fields and select a file.');
      return;
    }

    setUploading(true);
    try {
      // Storage upload
      const storageRef = ref(storage, `uploads/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      // Firestore write
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
      // reset
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

  return (
    <div className="form-container">
      <h2 className="form-title">Upload Print Job</h2>
      <form onSubmit={handleSubmit} className="form">
        <label className="form-label">STL File:</label>
        <input
          type="file"
          accept=".stl"
          onChange={e => setFile(e.target.files[0] ?? null)}
          className="form-input"
        />

        <label className="form-label">Material:</label>
        <select
          value={material}
          onChange={e => { setMaterial(e.target.value); setColor(''); }}
          className="form-select"
        >
          <option value="">Select Material</option>
          {materials.map((m,i) => <option key={i} value={m}>{m}</option>)}
        </select>

        <label className="form-label">Color:</label>
        <select
          value={color}
          onChange={e => setColor(e.target.value)}
          disabled={!material}
          className="form-select"
        >
          <option value="">Select Color</option>
          {colors.map((c,i) => <option key={i} value={c}>{c}</option>)}
        </select>

        <label className="form-label">Available Finish:</label>
        <input
          type="text"
          value={finishes[0] || 'Select Material & Color'}
          disabled
          className="form-input"
        />

        <label className="form-label">Print Quality:</label>
        <select
          value={printQuality}
          onChange={e => setPrintQuality(e.target.value)}
          className="form-select"
        >
          {PRINT_QUALITIES.map((q,i) => <option key={i} value={q}>{q}</option>)}
        </select>

        <label className="form-label">Post–Processing Finish:</label>
        <select
          value={postProcess}
          onChange={e => setPostProcess(e.target.value)}
          className="form-select"
        >
          {POST_PROCESSES.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" disabled={uploading} className="form-button">
          {uploading ? 'Uploading…' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

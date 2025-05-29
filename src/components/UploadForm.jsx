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

  useEffect(() => {
    (async () => {
      const snap = await getDocs(
        query(collection(db, 'inventory'), where('stockLevel', '>', 0))
      );
      setInv(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    })();
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    (async () => {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const prefs = snap.data().printPreferences || {};
        const dpq = prefs.defaultPrintQuality || PRINT_QUALITIES[0];
        const dpp = prefs.defaultFinish || 'raw';
        setDefaultPrintQuality(dpq);
        setPrintQuality(dpq);
        setDefaultPostProcess(dpp);
        setPostProcess(dpp);
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
        uid:            user.uid,
        email:          user.email,
        fileName:       file.name,
        filamentType:   material,
        color,
        finish:         finishes[0],
        printQuality,
        postProcess,
        cost:           0,
        status:         'Uploaded',
        fileUrl,
        createdAt:      serverTimestamp()
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

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto' }}>
      <h2>Upload Print Job</h2>

      <label>STL File:</label>
      <input
        type="file"
        accept=".stl"
        onChange={e => setFile(e.target.files[0] ?? null)}
        style={{ display: 'block', marginBottom: '0.75rem', width: '100%' }}
      />

      <label>Material:</label>
      <select
        value={material}
        onChange={e => { setMaterial(e.target.value); setColor(''); }}
        style={{ display: 'block', marginBottom: '0.75rem', width: '100%' }}
      >
        <option value="">Select Material</option>
        {materials.map((m,i) => <option key={i} value={m}>{m}</option>)}
      </select>

      <label>Color:</label>
      <select
        value={color}
        onChange={e => setColor(e.target.value)}
        disabled={!material}
        style={{ display: 'block', marginBottom: '0.75rem', width: '100%' }}
      >
        <option value="">Select Color</option>
        {colors.map((c,i) => <option key={i} value={c}>{c}</option>)}
      </select>

      <label>Available Finish:</label>
      <input
        type="text"
        value={finishes[0] ? finishes[0] : 'Select Material & Color'}
        disabled
        style={{ display: 'block', marginBottom: '0.75rem', width: '100%' }}
      />

      <label>Print Quality:</label>
      <select
        value={printQuality}
        onChange={e => setPrintQuality(e.target.value)}
        style={{ display: 'block', marginBottom: '0.75rem', width: '100%' }}
      >
        {PRINT_QUALITIES.map((q,i) => <option key={i} value={q}>{q}</option>)}
      </select>

      <label>Post–Processing Finish:</label>
      <select
        value={postProcess}
        onChange={e => setPostProcess(e.target.value)}
        style={{ display: 'block', marginBottom: '1rem', width: '100%' }}
      >
        {POST_PROCESSES.map(p => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>

      <button type="submit" onClick={handleSubmit}>
        {uploading ? 'Uploading…' : 'Submit'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

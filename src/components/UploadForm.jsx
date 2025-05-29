// ✅ FILE: src/components/UploadForm.jsx
// UPDATED: removed "Quality" suffix from the Print Quality dropdown options

import React, { useState, useEffect } from 'react';
import { db, storage, auth } from '../firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  doc,
  getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function UploadForm() {
  const [file, setFile]                     = useState(null);
  const [material, setMaterial]             = useState('');
  const [color, setColor]                   = useState('');
  const [finish, setFinish]                 = useState('');
  const [printQuality, setPrintQuality]     = useState('');
  const [postProcessing, setPostProcessing] = useState('');
  const [inventory, setInventory]           = useState([]);
  const [defaultQuality, setDefaultQuality]       = useState('');
  const [defaultProcessing, setDefaultProcessing] = useState('');
  const [status, setStatus]                 = useState('');

  // 1) Fetch inventory
  useEffect(() => {
    (async () => {
      const snap = await getDocs(
        query(collection(db, 'inventory'), where('stockLevel', '>', 0))
      );
      setInventory(snap.docs.map(d => d.data()));
    })();
  }, []);

  // 2) Fetch user defaults via getDoc()
  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return;
    (async () => {
      const userSnap = await getDoc(doc(db, 'users', u.uid));
      if (userSnap.exists()) {
        const d = userSnap.data();
        setDefaultQuality(d.defaultPrintQuality || '');
        setDefaultProcessing(d.defaultFinish || '');
      }
    })();
  }, []);

  // 3) Dropdown options
  const materials = Array.from(new Set(inventory.map(i => i.material)));
  const colors = material
    ? Array.from(new Set(
        inventory.filter(i => i.material === material).map(i => i.color)
      ))
    : [];
  const finishes = material && color
    ? Array.from(new Set(
        inventory
          .filter(i => i.material === material && i.color === color)
          .map(i => i.finish)
      ))
    : [];

  // 4) Submit handler
  const handleSubmit = async e => {
    e.preventDefault();
    setStatus('');

    const user = auth.currentUser;
    if (!user || !file || !material || !color || !finish) {
      setStatus('Please complete all required fields.');
      return;
    }

    try {
      // upload to Storage
      const storageRef = ref(storage, `uploads/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      // write to Firestore
      await addDoc(collection(db, 'jobs'), {
        uid:            user.uid,
        email:          user.email,
        fileName:       file.name,
        filamentType:   material,
        color,
        finish,
        printQuality:   printQuality || defaultQuality,
        postProcessing: postProcessing || defaultProcessing,
        fileUrl:        url,
        cost:           0,
        status:         'Uploaded',
        createdAt:      serverTimestamp()
      });

      setStatus('Upload successful.');
      // reset fields
      setFile(null);
      setMaterial('');
      setColor('');
      setFinish('');
      setPrintQuality('');
      setPostProcessing('');
    } catch (err) {
      console.error(err);
      setStatus('Upload failed: ' + err.message);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2 className="form-title">Upload 3D Print Job</h2>

      <label htmlFor="file" className="form-label">3D File:</label>
      <input
        id="file"
        type="file"
        accept=".stl"
        onChange={e => setFile(e.target.files[0])}
        className="form-input half-width"
        required
      />

      <label htmlFor="material" className="form-label">Material:</label>
      <select
        id="material"
        value={material}
        onChange={e => setMaterial(e.target.value)}
        className="form-select half-width"
        required
      >
        <option value="">Select material</option>
        {materials.map((m,i) => <option key={i} value={m}>{m}</option>)}
      </select>

      <label htmlFor="color" className="form-label">Color:</label>
      <select
        id="color"
        value={color}
        onChange={e => setColor(e.target.value)}
        className="form-select half-width"
        required
      >
        <option value="">Select color</option>
        {colors.map((c,i) => <option key={i} value={c}>{c}</option>)}
      </select>

      <label htmlFor="finish" className="form-label">Finish:</label>
      <select
        id="finish"
        value={finish}
        onChange={e => setFinish(e.target.value)}
        className="form-select half-width"
        required
      >
        <option value="">Select finish</option>
        {finishes.map((f,i) => <option key={i} value={f}>{f}</option>)}
      </select>

      <label htmlFor="printQuality" className="form-label">Print Quality:</label>
      <select
        id="printQuality"
        value={printQuality}
        onChange={e => setPrintQuality(e.target.value)}
        className="form-select half-width"
      >
        <option value="">Use default ({defaultQuality})</option>
        <option value="Draft Quality">Draft</option>
        <option value="Fit Check Quality">Fit Check</option>
        <option value="Prototype">Prototype</option>
        <option value="Production Quality">Production</option>
      </select>

      <label htmlFor="postProcessing" className="form-label">Post-Processing:</label>
      <select
        id="postProcessing"
        value={postProcessing}
        onChange={e => setPostProcessing(e.target.value)}
        className="form-select half-width"
      >
        <option value="">Use default ({defaultProcessing})</option>
        <option value="raw">Raw</option>
        <option value="supports_removed">Supports Removed</option>
        <option value="ready_to_go">Ready to Go</option>
      </select>

      {status && <p className="form-error">{status}</p>}

      <button type="submit" className="form-button">Submit Job</button>
    </form>
  );
}

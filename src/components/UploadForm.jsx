// src/components/UploadForm.jsx
import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [material, setMaterial] = useState('');
  const [color, setColor] = useState('');
  const [finish, setFinish] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const materials = ['PLA', 'ABS', 'PETG', 'Nylon', 'TPU'];
  const colors    = ['Black', 'White', 'Red', 'Blue', 'Green', 'Gray'];
  const finishes  = ['Raw', 'Supports Removed', 'Ready to Go'];

  const handleFileChange = e => {
    setFile(e.target.files[0]);
    setSuccess('');
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!file || !material || !color || !finish) {
      setError('Please complete all fields before submitting.');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated.');

      // Create a new job in Firestore
      await addDoc(collection(db, 'jobs'), {
        uid: user.uid,
        email: user.email,
        fileName: file.name,
        filamentType: material,
        color,
        finish,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setSuccess('Your job was uploaded successfully!');
      setFile(null);
      setMaterial('');
      setColor('');
      setFinish('');
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload job. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '2rem auto' }}>
      <h2>Upload Your 3D File</h2>

      <label>File (STL or OBJ):</label>
      <input
        type="file"
        accept=".stl,.obj"
        onChange={handleFileChange}
        required
      />

      <label>Material:</label>
      <select
        value={material}
        onChange={e => setMaterial(e.target.value)}
        required
      >
        <option value="">-- Select Material --</option>
        {materials.map(m => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      <label>Color:</label>
      <select
        value={color}
        onChange={e => setColor(e.target.value)}
        required
      >
        <option value="">-- Select Color --</option>
        {colors.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <label>Finish:</label>
      <select
        value={finish}
        onChange={e => setFinish(e.target.value)}
        required
      >
        <option value="">-- Select Finish --</option>
        {finishes.map(f => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <button type="submit" style={{ marginTop: '1rem' }}>
        Submit Job
      </button>
    </form>
  );
}

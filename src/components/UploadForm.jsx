// src/components/UploadForm.jsx

import React, { useState, useEffect } from 'react';
import { auth, db, storage, functions } from '../firebase';
import { collection, addDoc, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [material, setMaterial] = useState('');
  const [color, setColor] = useState('');
  const [finish, setFinish] = useState('');
  const [postProcessing, setPostProcessing] = useState('');
  const [quality, setQuality] = useState('');
  const [status, setStatus] = useState('');
  const [materials, setMaterials] = useState([]);
  const [colors, setColors] = useState([]);
  const [availableFinishes, setAvailableFinishes] = useState([]);
  const [qualityOptions, setQualityOptions] = useState(['draft', 'fit_check', 'prototype', 'production']);
  const [postProcessingOptions, setPostProcessingOptions] = useState(['raw', 'supports_removed', 'ready_to_go']);
  const generateStardate = httpsCallable(functions, "generateStardateJobId");


  useEffect(() => {
    const fetchPricingData = async () => {
      const settingsRef = doc(db, 'settings', 'pricing');
      const snapshot = await getDoc(settingsRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setMaterials(data.availableMaterials || []);
        setColors(data.availableColors || []);
        setAvailableFinishes(data.availableFinishes || []);
      }
    };

    fetchPricingData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      setStatus('Upload failed: You must be logged in to upload.');
      return;
    }

    if (!file || !material || !color || !finish || !quality || !postProcessing) {
      setStatus('All fields are required.');
      return;
    }

    try {
      setStatus('Uploading...');
      const user = auth.currentUser;
      const uid = user.uid;
      const email = user.email;

      // 🔒 Generate Stardate and VisualRef via Firebase Callable Function
      const generateStardateJobId = httpsCallable(functions, 'generateStardateJobId');
      const stardateResult = await generateStardateJobId();
      const { stardate, visualRef } = stardateResult.data;

      // Upload file to Firebase Storage
      const timestamp = Date.now();
      const storageRef = ref(storage, `uploads/${uid}/${timestamp}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Save job document
      const jobData = {
        uid,
        email,
        fileName: file.name,
        fileUrl: downloadURL,
        material,
        color,
        finish,
        postProcessing,
        quality,
        stardate,
        visualRef,
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'jobs'), jobData);

      setStatus('Upload successful!');
      // Reset form
      setFile(null);
      setMaterial('');
      setColor('');
      setFinish('');
      setPostProcessing('');
      setQuality('');
    } catch (error) {
      console.error(error);
      setStatus(`Upload failed: ${error.message}`);
    }
  };

  return (
    <div className="section-container">
      <h2 className="section-heading">Upload a 3D Print Job</h2>
      <form onSubmit={handleSubmit}>
        <label className="form-label">Select File:</label>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} className="form-control form-control-narrow" />

        <label className="form-label">Material:</label>
        <select value={material} onChange={(e) => setMaterial(e.target.value)} className="form-control form-control-narrow">
          <option value="">Select</option>
          {materials.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <label className="form-label">Color:</label>
        <select value={color} onChange={(e) => setColor(e.target.value)} className="form-control form-control-narrow">
          <option value="">Select</option>
          {colors.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <label className="form-label">Finish:</label>
        <select value={finish} onChange={(e) => setFinish(e.target.value)} className="form-control form-control-narrow">
          <option value="">Select</option>
          {availableFinishes.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <label className="form-label">Post Processing:</label>
        <select value={postProcessing} onChange={(e) => setPostProcessing(e.target.value)} className="form-control form-control-narrow">
          <option value="">Select</option>
          {postProcessingOptions.map((option) => (
            <option key={option} value={option}>{option.replace(/_/g, ' ')}</option>
          ))}
        </select>

        <label className="form-label">Print Quality:</label>
        <select value={quality} onChange={(e) => setQuality(e.target.value)} className="form-control form-control-narrow">
          <option value="">Select</option>
          {qualityOptions.map((option) => (
            <option key={option} value={option}>{option.replace(/_/g, ' ')}</option>
          ))}
        </select>

        <button type="submit" className="button-primary">Submit</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
};

export default UploadForm;

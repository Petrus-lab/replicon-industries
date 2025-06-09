import React, { useEffect, useState } from 'react';
import { auth, db, storage } from '../firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';

const UploadForm = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState('');

  const [materialOptions, setMaterialOptions] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const [materialFinishOptions, setMaterialFinishOptions] = useState([]);

  const [material, setMaterial] = useState('');
  const [color, setColor] = useState('');
  const [materialFinish, setMaterialFinish] = useState('');
  const [postProcessing, setPostProcessing] = useState('');
  const [quality, setQuality] = useState('');

  const postProcessingOptions = ['raw', 'supports_removed', 'ready_to_go'];
  const qualityOptions = ['draft', 'fit_check', 'prototype', 'production'];

  const [inventoryMap, setInventoryMap] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const profileSnap = await getDoc(doc(db, 'profiles', user.uid));
      const profile = profileSnap.exists() ? profileSnap.data() : {};

      const snapshot = await getDocs(
        query(collection(db, 'inventory'), where('stockLevel', '>', 0))
      );

      const tempMap = {};
      snapshot.forEach((doc) => {
        const { material, color, finish } = doc.data();
        if (!tempMap[material]) tempMap[material] = {};
        if (!tempMap[material][color]) tempMap[material][color] = new Set();
        tempMap[material][color].add(finish);
      });

      const materials = Object.keys(tempMap);
      setInventoryMap(tempMap);
      setMaterialOptions(materials);

      const defaultMaterial = profile.material && materials.includes(profile.material)
        ? profile.material
        : materials[0] || '';

      const defaultPostProcessing = profile.finish && postProcessingOptions.includes(profile.finish)
        ? profile.finish
        : postProcessingOptions[0];

      const defaultQuality = profile.quality && qualityOptions.includes(profile.quality)
        ? profile.quality
        : qualityOptions[0];

      setPostProcessing(defaultPostProcessing);
      setQuality(defaultQuality);
      setMaterial(defaultMaterial);
      updateColorsAndFinishes(defaultMaterial, profile.color, profile.materialFinish, tempMap);
    };

    fetchData();
  }, []);

  const updateColorsAndFinishes = (mat, profileColor = '', profileFinish = '', map = inventoryMap) => {
    const colorSet = Object.keys(map[mat] || {});
    setColorOptions(colorSet);

    const color = colorSet.includes(profileColor) ? profileColor : colorSet[0] || '';
    setColor(color);

    const finishes = Array.from(map[mat]?.[color] || []);
    setMaterialFinishOptions(finishes);
    setMaterialFinish(finishes.includes(profileFinish) ? profileFinish : finishes[0] || '');
  };

  const handleMaterialChange = (value) => {
    setMaterial(value);
    updateColorsAndFinishes(value);
  };

  const handleColorChange = (value) => {
    setColor(value);
    const finishes = Array.from(inventoryMap[material]?.[value] || []);
    setMaterialFinishOptions(finishes);
    setMaterialFinish(finishes[0] || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !selectedFile) {
      setStatus('Missing file or user session');
      return;
    }

    try {
      setStatus('Uploading...');
      const storageRef = ref(
        storage,
        `print_jobs/${user.uid}/${Date.now()}_${selectedFile.name}`
      );
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      uploadTask.on(
        'state_changed',
        null,
        (error) => setStatus('Upload failed: ' + error.message),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, 'jobs'), {
            uid: user.uid,
            fileUrl: downloadURL,
            fileName: selectedFile.name,
            material,
            color,
            materialFinish,
            finish: postProcessing,
            quality,
            status: 'Uploaded',
            createdAt: serverTimestamp(),
          });
          setStatus('Upload successful!');
          setSelectedFile(null);
        }
      );
    } catch (err) {
      console.error(err);
      setStatus('Upload failed: ' + err.message);
    }
  };

  return (
    <div className="section-container">
      <h2 className="section-heading">Upload 3D Print Job</h2>
      <form onSubmit={handleSubmit} className="form-vertical">
        <label className="form-label">Select File:</label>
        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          className="form-control form-control-narrow"
        />

        <label className="form-label">Material:</label>
        <select value={material} onChange={(e) => handleMaterialChange(e.target.value)} className="form-control form-control-narrow">
          {materialOptions.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <label className="form-label">Color:</label>
        <select value={color} onChange={(e) => handleColorChange(e.target.value)} className="form-control form-control-narrow">
          {colorOptions.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <label className="form-label">Finish:</label>
        <select value={materialFinish} onChange={(e) => setMaterialFinish(e.target.value)} className="form-control form-control-narrow" disabled={materialFinishOptions.length === 1}>
          {materialFinishOptions.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <label className="form-label">Post-Processing:</label>
        <select value={postProcessing} onChange={(e) => setPostProcessing(e.target.value)} className="form-control form-control-narrow">
          {postProcessingOptions.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <label className="form-label">Default Print Quality:</label>
        <select value={quality} onChange={(e) => setQuality(e.target.value)} className="form-control form-control-narrow">
          {qualityOptions.map((q) => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>

        <button type="submit" className="button-primary">Upload</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
};

export default UploadForm;
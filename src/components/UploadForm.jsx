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

      // Load inventory
      const snapshot = await getDocs(
        query(collection(db, 'inventory'), where('stockLevel', '>', 0))
      );

      const tempMap = {};
      snapshot.forEach((doc) => {
        const { material, color, finish } = doc.data();
        if (!tempMap[material]) {
          tempMap[material] = { colors: new Set(), finishes: new Set() };
        }
        tempMap[material].colors.add(color);
        tempMap[material].finishes.add(finish);
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
      updateDependentFields(defaultMaterial, profile.color, profile.materialFinish, tempMap);
    };

    fetchData();
  }, []);

  const updateDependentFields = (selectedMaterial, profileColor, profileMaterialFinish, map) => {
    const colors = [...(map[selectedMaterial]?.colors || [])];
    const finishes = [...(map[selectedMaterial]?.finishes || [])];

    setColorOptions(colors);
    setMaterialFinishOptions(finishes);

    setColor(colors.includes(profileColor) ? profileColor : colors[0] || '');
    setMaterialFinish(finishes.includes(profileMaterialFinish) ? profileMaterialFinish : finishes[0] || '');
  };

  const handleMaterialChange = (value) => {
    setMaterial(value);
    updateDependentFields(value, '', '', inventoryMap);
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
        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          className="form-control form-control-narrow"
        />

        <select value={material} onChange={(e) => handleMaterialChange(e.target.value)} className="form-control form-control-narrow">
          {materialOptions.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select value={color} onChange={(e) => setColor(e.target.value)} className="form-control form-control-narrow">
          {colorOptions.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select value={materialFinish} onChange={(e) => setMaterialFinish(e.target.value)} className="form-control form-control-narrow">
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

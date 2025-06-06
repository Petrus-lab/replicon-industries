// src/components/UploadForm.jsx

import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export default function UploadForm() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [materialOptions, setMaterialOptions] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const [finishOptions, setFinishOptions] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedFinish, setSelectedFinish] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // fetch inventory to populate material/color lists
    const fetchSettings = async () => {
      const pricingSnap = await getDocs(collection(db, 'settings'));
      pricingSnap.forEach(docSnap => {
        if (docSnap.id === 'pricing') {
          setMaterialOptions(docSnap.data().availableMaterials || []);
          setColorOptions(docSnap.data().availableColors || []);
          setFinishOptions(['raw', 'supports_removed', 'ready_to_go']);
        }
      });
    };
    fetchSettings();
  }, []);

  const handleFileChange = e => {
    setSelectedFile(e.target.files[0]);
    setProgress(0);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please choose a file to upload.');
      return;
    }
    if (!selectedMaterial || !selectedColor || !selectedFinish) {
      setError('All fields are required.');
      return;
    }

    setError('');
    setSuccess('');

    try {
      const user = auth.currentUser;
      if (!user) {
        setError('You must be logged in to upload.');
        return;
      }

      // 1) Upload file to Storage
      const storageRef = ref(storage, `print_jobs/${user.uid}/${Date.now()}_${selectedFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      uploadTask.on('state_changed',
        snapshot => {
          const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(Math.floor(pct));
        },
        err => {
          console.error('Upload error:', err);
          setError('Failed to upload file.');
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // 2) Create a new job document in Firestore
          await addDoc(collection(db, 'jobs'), {
            uid: user.uid,
            email: user.email,
            material: selectedMaterial,
            color: selectedColor,
            finish: selectedFinish,
            quantity,
            fileName: selectedFile.name,
            fileUrl: downloadURL,
            cost: 0,
            status: 'Uploaded',
            createdAt: new Date(),
          });

          setSuccess('Upload successful!');
          setSelectedFile(null);
          setProgress(0);
          setSelectedMaterial('');
          setSelectedColor('');
          setSelectedFinish('');
          setQuantity(1);
        }
      );
    } catch (err) {
      console.error('UploadForm submit error:', err);
      setError('Something went wrong.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Upload Print Job</h2>

      <label>Material:</label>
      <select
        value={selectedMaterial}
        onChange={e => setSelectedMaterial(e.target.value)}
        required
      >
        <option value="">-- Select Material --</option>
        {materialOptions.map(mat => (
          <option key={mat} value={mat}>{mat}</option>
        ))}
      </select>

      <label>Color:</label>
      <select
        value={selectedColor}
        onChange={e => setSelectedColor(e.target.value)}
        required
      >
        <option value="">-- Select Color --</option>
        {colorOptions.map(col => (
          <option key={col} value={col}>{col}</option>
        ))}
      </select>

      <label>Finish:</label>
      <select
        value={selectedFinish}
        onChange={e => setSelectedFinish(e.target.value)}
        required
      >
        <option value="">-- Select Finish --</option>
        {finishOptions.map(fin => (
          <option key={fin} value={fin}>{fin}</option>
        ))}
      </select>

      <label>Quantity:</label>
      <input
        type="number"
        value={quantity}
        min="1"
        onChange={e => setQuantity(Number(e.target.value))}
        required
      />

      <label>File:</label>
      <input type="file" onChange={handleFileChange} required />

      {progress > 0 && <p>Upload Progress: {progress}%</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <button type="submit">Upload</button>
    </form>
  );
}

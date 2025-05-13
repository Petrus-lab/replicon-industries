// Path: src/components/UploadForm.jsx

import React, { useState, useEffect } from 'react';
import { db, storage, auth } from '../firebase';
import { getDoc, doc, collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [filamentType, setFilamentType] = useState('');
  const [color, setColor] = useState('');
  const [cost, setCost] = useState(0);
  const [markup, setMarkup] = useState(1.2); // Default markup (20%)
  const [isAdmin, setIsAdmin] = useState(false);

  // ✅ Fetch admin status and markup settings on load
  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdTokenResult();
        setIsAdmin(!!token.claims.admin);

        if (token.claims.admin) {
          const markupDocRef = doc(db, 'settings', 'markupSettings');
          const markupDoc = await getDoc(markupDocRef);
          if (markupDoc.exists()) {
            setMarkup(markupDoc.data().markup);
          }
        }
      }
    };

    fetchUserInfo();
  }, []);

  const calculateCost = () => {
    const baseCost = 10; // Example base cost
    return baseCost * markup;
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleFilamentTypeChange = (e) => setFilamentType(e.target.value);
  const handleColorChange = (e) => setColor(e.target.value);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file || !filamentType || !color) {
      alert('Please fill in all fields and select a file.');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        alert('You must be logged in to upload a job.');
        return;
      }

      const filePath = `uploads/${user.uid}/${file.name}`;
      const fileRef = ref(storage, filePath);
      await uploadBytes(fileRef, file);

      const jobCost = calculateCost();
      setCost(jobCost);

      await addDoc(collection(db, 'jobs'), {
        uid: user.uid,
        email: user.email,
        fileName: file.name,
        filamentType,
        color,
        cost: jobCost,
        createdAt: new Date()
      });

      alert('✅ File uploaded and job created successfully!');
      setFile(null);
      setFilamentType('');
      setColor('');
      setCost(0);

    } catch (error) {
      console.error("Upload failed:", error);
      alert('❌ Upload failed. Please check the console for details.');
    }
  };

  return (
    <div>
      <h2>Upload Print Job</h2>
      <form onSubmit={handleUpload}>
        <input type="file" onChange={handleFileChange} required />
        <select value={filamentType} onChange={handleFilamentTypeChange} required>
          <option value="">Select Filament Type</option>
          <option value="PLA">PLA</option>
          <option value="ABS">ABS</option>
        </select>
        <input
          type="text"
          placeholder="Color (e.g., Black)"
          value={color}
          onChange={handleColorChange}
          required
        />

        {isAdmin && (
          <div>
            <label>Markup Percentage:</label>
            <input
              type="number"
              value={markup * 100}
              onChange={(e) => setMarkup(e.target.value / 100)}
              step="0.1"
              min="1.0"
              max="100.0"
            />
            <span>%</span>
          </div>
        )}

        <button type="submit">Submit Print Job</button>
      </form>

      {cost > 0 && <div><h3>Estimated Job Cost: ${cost.toFixed(2)}</h3></div>}
    </div>
  );
};

export default UploadForm;

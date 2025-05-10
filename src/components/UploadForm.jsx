// Path: src/components/UploadForm.jsx

import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase'; // Import Firebase and Firebase Authentication
import { getDoc, doc } from 'firebase/firestore';

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [filamentType, setFilamentType] = useState('');
  const [color, setColor] = useState('');
  const [cost, setCost] = useState(0);
  const [markup, setMarkup] = useState(1.2); // Default markup value
  const [isAdmin, setIsAdmin] = useState(false); // Check if the user is an admin

  // Check if the user is an admin and fetch markup value
  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdTokenResult();
        setIsAdmin(token.claims.admin); // Check if the user has the 'admin' claim
        
        if (token.claims.admin) {
          // Fetch markup from Firestore if user is admin
          const markupDocRef = doc(db, 'settings', 'markupSettings');
          const markupDoc = await getDoc(markupDocRef);
          if (markupDoc.exists()) {
            setMarkup(markupDoc.data().markup); // Set markup value
          }
        }
      }
    };

    fetchUserInfo();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFilamentTypeChange = (e) => {
    setFilamentType(e.target.value);
  };

  const handleColorChange = (e) => {
    setColor(e.target.value);
  };

  const calculateCost = () => {
    const baseCost = 10; // Example base cost
    return baseCost * markup; // Apply markup to base cost
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !filamentType || !color) {
      alert('Please fill in all fields');
      return;
    }

    // Calculate job cost
    const jobCost = calculateCost();
    setCost(jobCost);

    // Upload file to Firebase Storage and save data to Firestore
    // Continue with your file upload and Firestore save logic here...
  };

  return (
    <div>
      <h2>Upload Job</h2>
      <form onSubmit={handleUpload}>
        <input type="file" onChange={handleFileChange} required />
        <select onChange={handleFilamentTypeChange} value={filamentType} required>
          <option value="">Select Filament Type</option>
          <option value="PLA">PLA</option>
          <option value="ABS">ABS</option>
        </select>
        <input
          type="text"
          placeholder="Color"
          value={color}
          onChange={handleColorChange}
          required
        />
        
        {/* Only show the markup field if the user is an admin */}
        {isAdmin && (
          <div>
            <label>Markup Percentage</label>
            <input
              type="number"
              value={markup * 100} // Convert to percentage
              onChange={(e) => setMarkup(e.target.value / 100)} // Convert back to multiplier
              step="0.1"
              min="1.0"
              max="10.0"
            />
            <span>%</span>
          </div>
        )}

        <button type="submit">Upload</button>
      </form>
      {cost > 0 && <div><h3>Estimated Job Cost: ${cost}</h3></div>}
    </div>
  );
};

export default UploadForm;

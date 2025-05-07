import React, { useState } from 'react';
import { storage, db } from '../firebase';
import { ref, uploadBytes } from 'firebase/storage';
import { addDoc, collection, Timestamp } from 'firebase/firestore';

function UploadForm({ user }) {
  const [file, setFile] = useState(null);
  const [filamentType, setFilamentType] = useState('');
  const [color, setColor] = useState('');
  const [cost, setCost] = useState('');

  const handleUpload = async () => {
    if (!file || !filamentType || !color || !cost) {
      alert('Please fill in all fields and select a file.');
      return;
    }

    try {
      const fileRef = ref(storage, `uploads/${user.uid}/${file.name}`);
      await uploadBytes(fileRef, file);
      console.log('✅ File uploaded to storage');

      await addDoc(collection(db, 'jobs'), {
        uid: user.uid,
        email: user.email,
        fileName: file.name,
        filamentType,
        color,
        cost: parseFloat(cost),
        createdAt: Timestamp.now()
      });

      alert('✅ File uploaded and job created!');
      setFile(null);
      setFilamentType('');
      setColor('');
      setCost('');
    } catch (err) {
      console.error('❌ Upload failed:', err);
      alert('Upload failed. Check console for details.');
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>Upload 3D File</h3>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <input
        type="text"
        placeholder="Filament Type (e.g., PLA)"
        value={filamentType}
        onChange={(e) => setFilamentType(e.target.value)}
      />
      <input
        type="text"
        placeholder="Color (e.g., Black)"
        value={color}
        onChange={(e) => setColor(e.target.value)}
      />
      <input
        type="number"
        placeholder="Estimated Cost (e.g., 50)"
        value={cost}
        onChange={(e) => setCost(e.target.value)}
      />
      <button onClick={handleUpload}>Submit Print Job</button>
    </div>
  );
}

export default UploadForm;

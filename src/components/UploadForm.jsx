import React, { useState } from 'react';

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [material, setMaterial] = useState('');
  const [color, setColor] = useState('');
  const [finish, setFinish] = useState('');
  const [error, setError] = useState('');

  const materials = ['PLA', 'ABS', 'PETG', 'Nylon', 'TPU'];
  const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Gray'];
  const finishes = ['Raw', 'Supports Removed', 'Ready to Go'];

  const handleFileChange = e => setFile(e.target.files[0]);
  const handleMaterialChange = e => setMaterial(e.target.value);
  const handleColorChange = e => setColor(e.target.value);
  const handleFinishChange = e => setFinish(e.target.value);

  const handleSubmit = e => {
    e.preventDefault();
    if (!file || !material || !color || !finish) {
      setError('Please complete all fields before submitting.');
      return;
    }

    setError('');
    console.log('File:', file);
    console.log('Material:', material);
    console.log('Color:', color);
    console.log('Finish:', finish);
    // TODO: Send to Firestore or upload service
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '2rem auto' }}>
      <h2>Upload Your 3D File</h2>

      <label>Upload File (STL or OBJ):</label>
      <input type="file" accept=".stl,.obj" onChange={handleFileChange} required />

      <label>Select Material:</label>
      <select value={material} onChange={handleMaterialChange} required>
        <option value="">-- Select Material --</option>
        {materials.map(m => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      <label>Select Color:</label>
      <select value={color} onChange={handleColorChange} required>
        <option value="">-- Select Color --</option>
        {colors.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <label>Select Finish:</label>
      <select value={finish} onChange={handleFinishChange} required>
        <option value="">-- Select Finish --</option>
        {finishes.map(f => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button type="submit" style={{ marginTop: '1rem' }}>Submit</button>
    </form>
  );
}

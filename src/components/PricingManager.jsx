// src/components/PricingManager.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function PricingManager() {
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [markup, setMarkup] = useState(0);

  const [newMaterial, setNewMaterial] = useState('');
  const [newColor, setNewColor] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Firestore document references
  const pricingRef = doc(db, 'settings', 'pricing');
  const markupRef  = doc(db, 'settings', 'markupSettings');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Fetch pricing settings
        const pricingSnap = await getDoc(pricingRef);
        if (pricingSnap.exists()) {
          const data = pricingSnap.data();
          setAvailableMaterials(data.availableMaterials || []);
          setAvailableColors(data.availableColors || []);
        }

        // Fetch markup settings
        const markupSnap = await getDoc(markupRef);
        if (markupSnap.exists()) {
          const data = markupSnap.data();
          setMarkup(data.markupSettings ?? 0);
        }
      } catch (err) {
        console.error('Error loading pricing settings:', err);
        setError('Failed to load settings.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleAddMaterial = () => {
    if (!newMaterial.trim()) return;
    setAvailableMaterials(prev => [...prev, newMaterial.trim()]);
    setNewMaterial('');
  };

  const handleRemoveMaterial = mat => {
    setAvailableMaterials(prev => prev.filter(m => m !== mat));
  };

  const handleAddColor = () => {
    if (!newColor.trim()) return;
    setAvailableColors(prev => [...prev, newColor.trim()]);
    setNewColor('');
  };

  const handleRemoveColor = col => {
    setAvailableColors(prev => prev.filter(c => c !== col));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      // Save pricing arrays
      await setDoc(pricingRef, {
        availableMaterials,
        availableColors
      }, { merge: true });

      // Save markup number
      await setDoc(markupRef, {
        markupSettings: Number(markup)
      }, { merge: true });
    } catch (err) {
      console.error('Error saving pricing settings:', err);
      setError('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading settings...</p>;
  if (error)   return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Pricing Manager</h2>

      <section style={{ marginBottom: '1.5rem' }}>
        <h3>Materials</h3>
        <ul>
          {availableMaterials.map(mat => (
            <li key={mat}>
              {mat}{' '}
              <button onClick={() => handleRemoveMaterial(mat)}>Remove</button>
            </li>
          ))}
        </ul>
        <input
          type="text"
          placeholder="New material"
          value={newMaterial}
          onChange={e => setNewMaterial(e.target.value)}
        />
        <button onClick={handleAddMaterial}>Add Material</button>
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h3>Colors</h3>
        <ul>
          {availableColors.map(col => (
            <li key={col}>
              {col}{' '}
              <button onClick={() => handleRemoveColor(col)}>Remove</button>
            </li>
          ))}
        </ul>
        <input
          type="text"
          placeholder="New color"
          value={newColor}
          onChange={e => setNewColor(e.target.value)}
        />
        <button onClick={handleAddColor}>Add Color</button>
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h3>Markup Percentage</h3>
        <input
          type="number"
          min="0"
          step="0.1"
          value={markup}
          onChange={e => setMarkup(e.target.value)}
        />{' '}
        %
      </section>

      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Settings'}
      </button>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
    </div>
  );
}

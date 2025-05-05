import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

function PricingManager() {
  const [baseCost, setBaseCost] = useState('');
  const [markup, setMarkup] = useState('');

  useEffect(() => {
    const fetchPricing = async () => {
      const docRef = doc(db, 'config', 'pricing');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBaseCost(data.baseCost || '');
        setMarkup(data.markup || '');
      }
    };
    fetchPricing();
  }, []);

  const handleSave = async () => {
    await setDoc(doc(db, 'config', 'pricing'), {
      baseCost,
      markup
    });
    alert('Pricing settings saved.');
  };

  return (
    <div>
      <h3>Pricing Settings</h3>
      <input
        type="number"
        placeholder="Base production cost"
        value={baseCost}
        onChange={(e) => setBaseCost(e.target.value)}
      />
      <input
        type="number"
        placeholder="Markup (%)"
        value={markup}
        onChange={(e) => setMarkup(e.target.value)}
      />
      <button onClick={handleSave}>Save Settings</button>
    </div>
  );
}

export default PricingManager;

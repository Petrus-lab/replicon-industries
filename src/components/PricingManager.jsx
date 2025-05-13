// ✅ FILE: src/components/PricingManager.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function PricingManager() {
  const [baseCost, setBaseCost] = useState('');
  const [markupPercentage, setMarkupPercentage] = useState('');

  // ✅ Fetch existing pricing on load
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const pricingDocRef = doc(db, 'settings', 'markupSettings');
        const pricingSnap = await getDoc(pricingDocRef);
        if (pricingSnap.exists()) {
          const data = pricingSnap.data();
          setBaseCost(data.baseCost || '');
          setMarkupPercentage(data.markup ? data.markup * 100 : '');
        }
      } catch (error) {
        console.error('❌ Failed to fetch pricing settings:', error);
      }
    };
    fetchPricing();
  }, []);

  // ✅ Save updated pricing
  const handleSave = async () => {
    try {
      await setDoc(doc(db, 'settings', 'markupSettings'), {
        baseCost: parseFloat(baseCost),
        markup: parseFloat(markupPercentage) / 100, // ✅ Convert back to decimal
      });
      alert('✅ Pricing settings saved successfully.');
    } catch (error) {
      console.error('❌ Failed to save pricing settings:', error);
      alert('❌ Failed to save pricing settings. See console for details.');
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>💰 Pricing Configuration</h2>
      <div>
        <label>
          Base Production Cost:
          <input
            type="number"
            value={baseCost}
            onChange={(e) => setBaseCost(e.target.value)}
            placeholder="e.g., 10.00"
            min="0"
            step="0.01"
          />
        </label>
      </div>
      <div>
        <label>
          Markup Percentage (%):
          <input
            type="number"
            value={markupPercentage}
            onChange={(e) => setMarkupPercentage(e.target.value)}
            placeholder="e.g., 20 for 20%"
            min="0"
            step="0.1"
          />
        </label>
      </div>
      <button onClick={handleSave} style={{ marginTop: '1rem' }}>
        Save Settings
      </button>
    </div>
  );
}

export default PricingManager;

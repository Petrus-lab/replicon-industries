// ✅ FILE: src/components/JobStatusReport.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const STATUSES = [
  'Uploaded',
  'Processing',
  'Slicing',
  'Quoted',
  'Paid',
  'For Printing',
  'Post-Processing',
  'Packing',
  'Shipped',
  'Canceled',
  'On Hold',
  'Rejected'
];

export default function JobStatusReport() {
  const [counts, setCounts] = useState(
    STATUSES.reduce((acc, status) => ({ ...acc, [status]: 0 }), {})
  );

  useEffect(() => {
    const fetchCounts = async () => {
      const snap = await getDocs(collection(db, 'jobs'));
      const tally = STATUSES.reduce((acc, status) => ({ ...acc, [status]: 0 }), {});
      snap.docs.forEach(doc => {
        const s = doc.data().status;
        if (tally[s] !== undefined) tally[s] += 1;
      });
      setCounts(tally);
    };
    fetchCounts();
  }, []);

  return (
    <section className="form-group">
      <h3 className="form-title">Job Status Report</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {STATUSES.map(status => (
          <div key={status} style={{ minWidth: 120 }}>
            <strong>{status}:</strong> {counts[status]}
          </div>
        ))}
      </div>
    </section>
  );
}

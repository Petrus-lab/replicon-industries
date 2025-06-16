// src/utils/stardate.js

import { db } from '../firebase';
import { doc, getDoc, runTransaction } from 'firebase/firestore';

export const generateStardateJobId = async () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const startOfYear = new Date(Date.UTC(year, 0, 0));
  const diff = now - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const hour = now.getUTCHours();
  const minute = now.getUTCMinutes();
  const fraction = ((hour * 60 + minute) / (24 * 60)).toFixed(1);

  const stardate = `${(year - 2000) * 100 + dayOfYear}.${fraction}`;

  const sequenceRef = doc(db, 'stardate_sequences', stardate);
  const sequenceNum = await runTransaction(db, async (transaction) => {
    const docSnap = await transaction.get(sequenceRef);
    let current = 0;
    if (docSnap.exists()) {
      current = docSnap.data().seq || 0;
    }
    transaction.set(sequenceRef, { seq: current + 1 });
    return current + 1;
  });

  const padded = sequenceNum.toString().padStart(3, '0');
  return {
    visualRef: `Stardate ${stardate}-${padded}`
  };
};

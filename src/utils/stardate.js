// Stardate generator — src/utils/stardate.js
import { doc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';

export const generateStardate = async () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const start = new Date(Date.UTC(year, 0, 0));
  const diff = now - start;
  const day = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hour = now.getUTCHours() + now.getUTCMinutes() / 60;
  const stardate = (((year - 2000) * 100) + day + Math.floor(hour * 10 / 24) / 10).toFixed(1);

  const ref = doc(db, 'stardate_sequences', stardate);
  const seq = await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref);
    const current = snap.exists() ? snap.data().seq || 0 : 0;
    transaction.set(ref, { seq: current + 1 });
    return current + 1;
  });

  const visualRef = `Stardate ${stardate}-${String(seq).padStart(3, '0')}`;
  return { stardate, visualRef };
};

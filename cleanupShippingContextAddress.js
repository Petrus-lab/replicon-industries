/**
 * Cleanup script to remove leftover `contextAddress` fields from shipping/{uid}
 */

const admin = require('firebase-admin');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

// Initialize Firebase Admin SDK
initializeApp({
  credential: applicationDefault()
});

const db = getFirestore();

async function cleanupContextAddress() {
  const shippingRef = db.collection('shipping');
  const snapshot = await shippingRef.get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const uid = doc.id;

    if ('contextAddress' in data) {
      try {
        await doc.ref.update({
          contextAddress: FieldValue.delete()
        });
        console.log(`🧹 Removed contextAddress from shipping/${uid}`);
      } catch (error) {
        console.error(`❌ Failed to clean shipping/${uid}:`, error.message);
      }
    }
  }

  console.log('✅ Context cleanup complete.');
}

cleanupContextAddress();
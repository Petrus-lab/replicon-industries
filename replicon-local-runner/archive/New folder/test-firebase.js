// test-firebase.js
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const dotenv = require('dotenv');

dotenv.config();

try {
  // Initialize Firebase only if not already initialized
  if (!getFirestore.apps?.length) {
    initializeApp({
      credential: applicationDefault(),
    });
  }

  const db = getFirestore();
  const testDocRef = db.collection('runner_test').doc('connectivity');
  const now = new Date();

  testDocRef.set({ timestamp: now.toISOString() }).then(() => {
    console.log(JSON.stringify({
      output: '✅ Firebase Admin connected and wrote to Firestore.'
    }));
  }).catch((error) => {
    console.error(JSON.stringify({
      output: `❌ Firebase Admin write failed:\n${error.message}`
    }));
  });

} catch (error) {
  console.error(JSON.stringify({
    output: `❌ Firebase Admin error:\n${error.message}`
  }));
}

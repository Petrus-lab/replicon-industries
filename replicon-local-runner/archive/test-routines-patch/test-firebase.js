const admin = require('firebase-admin');

module.exports = async function testFirebase() {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
    const firestore = admin.firestore();
    const docRef = firestore.collection('test').doc('connectivity_check');
    await docRef.set({ timestamp: new Date().toISOString() });
    return { status: 'success', message: 'Firebase write test passed.' };
  } catch (error) {
    return { status: 'error', message: 'Firebase test failed.', error: error.message };
  }
};
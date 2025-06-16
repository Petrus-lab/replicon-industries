
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.generateStardateJobId = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const now = new Date();
  const year = now.getUTCFullYear();
  const startOfYear = new Date(Date.UTC(year, 0, 0));
  const diff = now - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const hours = now.getUTCHours();
  const minutes = now.getUTCMinutes();
  const decimalHourFraction = Math.round((hours + minutes / 60) * 10) / 100; // e.g. 0.52

  const stardate = ((year - 2000) * 100) + dayOfYear + decimalHourFraction;
  const stardateKey = stardate.toFixed(1);

  const docRef = db.collection("stardate_sequences").doc(stardateKey);

  const result = await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(docRef);
    let seq = 1;

    if (doc.exists) {
      seq = (doc.data().seq || 0) + 1;
    }

    transaction.set(docRef, { seq }, { merge: true });
    return seq;
  });

  const paddedSeq = result.toString().padStart(3, "0");
  const visualRef = `Stardate ${stardateKey}-${paddedSeq}`;

  return {
    stardate: stardateKey,
    visualRef
  };
});

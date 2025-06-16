// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.generateStardateJobId = functions.https.onCall(async (data, context) => {
  // 🔐 Enforce authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const now = new Date();
  const stardate = `${now.getUTCFullYear() - 2000}.${now.getUTCMonth() + 1}.${now.getUTCDate()}`;
  const stardateDocRef = db.collection("stardate_sequences").doc(stardate);

  let sequence = 1;
  const doc = await stardateDocRef.get();

  if (doc.exists) {
    sequence = (doc.data().sequence || 0) + 1;
    await stardateDocRef.update({ sequence });
  } else {
    await stardateDocRef.set({ sequence });
  }

  const visualRef = `Stardate ${stardate}-${String(sequence).padStart(3, '0')}`;

  return { stardate, visualRef };
});

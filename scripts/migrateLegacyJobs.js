// scripts/migrateLegacyJobs.js

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load service account from absolute path
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!serviceAccountPath) {
  console.error('❌ Missing GOOGLE_APPLICATION_CREDENTIALS environment variable.');
  process.exit(1);
}
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function migrate() {
  const jobsRef = db.collection('jobs');
  const sequencesRef = db.collection('stardate_sequences');

  const snapshot = await jobsRef.get();

  for (const doc of snapshot.docs) {
    const job = doc.data();

    // Skip if already migrated
    if (job.visualRef && job.stardate) {
      console.log(`Skipping job ${doc.id}, already migrated.`);
      continue;
    }

    const createdAt = job.createdAt?.toDate?.() || new Date();

    const year = createdAt.getFullYear();
    const start = new Date(createdAt.getFullYear(), 0, 0);
    const diff = createdAt - start;
    const day = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hourFraction =
      createdAt.getHours() / 24 +
      createdAt.getMinutes() / 1440 +
      createdAt.getSeconds() / 86400;

    const stardateBase = ((year - 2000) * 100 + day + hourFraction).toFixed(1);
    const stardateKey = stardateBase;

    const seqDocRef = sequencesRef.doc(stardateKey);
    const sequenceNumber = await db.runTransaction(async (t) => {
      const snapshot = await t.get(seqDocRef);
      let counter = 1;
      if (snapshot.exists) {
        counter = (snapshot.data().counter || 0) + 1;
      }
      t.set(seqDocRef, { counter });
      return counter;
    });

    const visualRef = `Stardate ${stardateBase}-${String(sequenceNumber).padStart(3, '0')}`;

    await doc.ref.update({
      stardate: stardateBase,
      visualRef,
    });

    console.log(`✅ Migrated job ${doc.id} → ${visualRef}`);
  }

  console.log('✅ Migration complete.');
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
});

/**
 * One-click Firestore restore script from backup directory structure.
 * Re-uploads documents stored in `firestore-backup/{collection}/{docId}.json`
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Init Firebase Admin
initializeApp({ credential: applicationDefault() });
const db = getFirestore();

const BACKUP_DIR = path.join(__dirname, 'firestore-backup');

async function restoreFirestore() {
  console.log('🔁 Starting Firestore restore...');

  const collections = fs.readdirSync(BACKUP_DIR);

  for (const col of collections) {
    const colPath = path.join(BACKUP_DIR, col);
    const files = fs.readdirSync(colPath);

    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const docId = path.basename(file, '.json');
      const filePath = path.join(colPath, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      try {
        await db.collection(col).doc(docId).set(data, { merge: true });
        console.log(`✅ Restored ${col}/${docId}`);
      } catch (err) {
        console.error(`❌ Failed ${col}/${docId}: ${err.message}`);
      }
    }
  }

  console.log('🎯 Firestore restore complete.');
}

restoreFirestore();
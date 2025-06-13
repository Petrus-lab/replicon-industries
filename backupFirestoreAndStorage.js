/**
 * One-click Firestore and Storage structure backup script.
 * - Dumps all Firestore collections into JSON files.
 * - Indexes all Cloud Storage file paths into storage-index.json.
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');

// Init Firebase Admin
initializeApp({ credential: applicationDefault() });
const db = getFirestore();
const storage = getStorage();

// Helper: Save JSON to disk
function saveJSON(dir, filename, data) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, filename), JSON.stringify(data, null, 2));
}

async function backupFirestore() {
  console.log('📦 Starting Firestore backup...');
  const collections = await db.listCollections();
  for (const col of collections) {
    const colSnapshot = await col.get();
    const outDir = path.join(__dirname, 'firestore-backup', col.id);
    for (const doc of colSnapshot.docs) {
      saveJSON(outDir, doc.id + '.json', doc.data());
      console.log(`✅ ${col.id}/${doc.id}`);
    }
  }
  console.log('✅ Firestore backup complete.');
}

async function backupStorageIndex() {
  console.log('🗂 Indexing Cloud Storage paths...');
  const bucket = storage.bucket();
  const [files] = await bucket.getFiles();
  const paths = files.map(f => f.name);
  saveJSON(__dirname, 'storage-index.json', paths);
  console.log(`✅ Indexed ${paths.length} storage objects.`);
}

(async () => {
  await backupFirestore();
  await backupStorageIndex();
  console.log('🎯 All backups complete.');
})();
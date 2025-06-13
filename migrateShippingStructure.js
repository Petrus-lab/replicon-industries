/**
 * One-time Firestore migration script to refactor old shipping documents.
 * Moves legacy fields into defaultShipping, and removes top-level fields.
 */

const admin = require('firebase-admin');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

// Initialize Firebase Admin SDK
initializeApp({
  credential: applicationDefault()
});

const db = getFirestore();

async function migrateShippingData() {
  const shippingRef = db.collection('shipping');
  const snapshot = await shippingRef.get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const uid = doc.id;

    // Skip if already migrated
    if (data.defaultShipping) continue;

    const defaultShipping = {
      fullName: data.fullName || '',
      phoneNumber: data.phoneNumber || '',
      line1: data.line1 || '',
      line2: data.line2 || '',
      suburb: data.suburb || '',
      city: data.city || '',
      postalCode: data.zip || data.postalCode || '',
      country: data.country || '',
    };

    // Assemble fullAddress
    defaultShipping.fullAddress = [
      defaultShipping.line1,
      defaultShipping.line2,
      defaultShipping.suburb,
      defaultShipping.city,
      defaultShipping.postalCode,
      defaultShipping.country
    ].filter(Boolean).join(', ');

    // Prepare legacy fields to delete
    const deletions = {
      fullName: FieldValue.delete(),
      phoneNumber: FieldValue.delete(),
      line1: FieldValue.delete(),
      line2: FieldValue.delete(),
      suburb: FieldValue.delete(),
      city: FieldValue.delete(),
      zip: FieldValue.delete(),
      postalCode: FieldValue.delete(),
      country: FieldValue.delete(),
      address: FieldValue.delete()
    };

    // Update Firestore document
    try {
      await doc.ref.update({
        defaultShipping,
        ...deletions
      });
      console.log(`✅ Migrated shipping/${uid}`);
    } catch (error) {
      console.error(`❌ Failed to migrate shipping/${uid}:`, error.message);
    }
  }

  console.log('🎯 Migration complete.');
}

migrateShippingData();
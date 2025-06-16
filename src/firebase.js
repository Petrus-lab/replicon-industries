// Path: src/firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, getIdTokenResult } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore, doc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions'; // ✅ NEW

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCofcjuxiaqb9m6SpoSEmdi0Bku9EccZK4",
  authDomain: "replicon-industries.firebaseapp.com",
  projectId: "replicon-industries",
  storageBucket: "replicon-industries.firebasestorage.app",
  messagingSenderId: "500105339531",
  appId: "1:500105339531:web:faa0473c4c3481fb1aea8e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const storage = getStorage(app);
export const db = getFirestore(app);
export const functions = getFunctions(app); // ✅ NEW

// Check admin claim
export const isAdminUser = async (user) => {
  if (!user) return false;
  const token = await getIdTokenResult(user);
  return !!token.claims.admin;
};

// Firestore fetch functions
export const fetchUserData = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
};

export const fetchJobs = async () => {
  const jobsSnapshot = await getDocs(collection(db, 'jobs'));
  return jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const fetchOrders = async () => {
  const ordersSnapshot = await getDocs(collection(db, 'orders'));
  return ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const fetchPricingData = async () => {
  const pricingRef = doc(db, 'settings', 'pricing');
  const pricingSnap = await getDoc(pricingRef);
  return pricingSnap.exists() ? pricingSnap.data() : null;
};

export const fetchMarkupSettings = async () => {
  const markupRef = doc(db, 'settings', 'markupSettings');
  const markupSnap = await getDoc(markupRef);
  return markupSnap.exists() ? markupSnap.data() : null;
};

export const fetchShippingAddress = async (userId) => {
  const shippingRef = doc(db, 'shipping', userId);
  const shippingSnap = await getDoc(shippingRef);
  return shippingSnap.exists() ? shippingSnap.data() : null;
};

export const updateMarkupSettings = async (newMarkup) => {
  const markupRef = doc(db, 'settings', 'markupSettings');
  await updateDoc(markupRef, { markup: newMarkup });
};

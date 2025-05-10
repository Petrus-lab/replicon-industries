// Path: src/firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, getIdTokenResult } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration (replace with your actual keys)
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

// Initialize Firestore, Auth, and Storage
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider(); // For Google authentication
export const storage = getStorage(app);
export const db = getFirestore(app);

// Function to check if the current user is an admin
export const isAdminUser = async (user) => {
  if (!user) return false;
  const token = await getIdTokenResult(user);
  return !!token.claims.admin;
};

// Firebase data fetching functions:

// Fetch user data from the 'users' collection
export const fetchUserData = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
};

// Fetch job data from the 'jobs' collection
export const fetchJobs = async () => {
  const jobsSnapshot = await getDocs(collection(db, 'jobs'));
  return jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Fetch order data from the 'orders' collection
export const fetchOrders = async () => {
  const ordersSnapshot = await getDocs(collection(db, 'orders'));
  return ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Fetch pricing and material data from the 'settings' collection
export const fetchPricingData = async () => {
  const pricingRef = doc(db, 'settings', 'pricing');
  const pricingSnap = await getDoc(pricingRef);
  return pricingSnap.exists() ? pricingSnap.data() : null;
};

// Fetch markup settings from the 'settings' collection
export const fetchMarkupSettings = async () => {
  const markupRef = doc(db, 'settings', 'markupSettings');
  const markupSnap = await getDoc(markupRef);
  return markupSnap.exists() ? markupSnap.data() : null;
};

// Fetch shipping addresses from the 'shipping' collection
export const fetchShippingAddress = async (userId) => {
  const shippingRef = doc(db, 'shipping', userId);
  const shippingSnap = await getDoc(shippingRef);
  return shippingSnap.exists() ? shippingSnap.data() : null;
};

// Update markup settings in Firestore
export const updateMarkupSettings = async (newMarkup) => {
  const markupRef = doc(db, 'settings', 'markupSettings');
  await updateDoc(markupRef, { markup: newMarkup });
};

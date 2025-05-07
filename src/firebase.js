// src/firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, getIdTokenResult } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCofcjuxiaqb9m6SpoSEmdi0Bku9EccZK4",
  authDomain: "replicon-industries.firebaseapp.com",
  projectId: "replicon-industries",
  storageBucket: "replicon-industries.firebasestorage.app",
  messagingSenderId: "500105339531",
  appId: "1:500105339531:web:faa0473c4c3481fb1aea8e"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider(); // ✅ <-- THIS LINE IS REQUIRED
export const storage = getStorage(app);
export const db = getFirestore(app);

export const isAdminUser = async (user) => {
  if (!user) return false;
  const token = await getIdTokenResult(user);
  return !!token.claims.admin;
};

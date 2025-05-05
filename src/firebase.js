// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ✅ Your updated Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCofcjuxiaqb9m6SpoSEmdi0Bku9EccZK4",
  authDomain: "replicon-industries.firebaseapp.com",
  projectId: "replicon-industries",
  storageBucket: "replicon-industries.firebasestorage.app",
  messagingSenderId: "500105339531",
  appId: "1:500105339531:web:faa0473c4c3481fb1aea8e"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, provider, db, storage };

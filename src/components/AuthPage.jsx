// ✅ FILE: src/components/AuthPage.jsx
import React, { useState } from 'react';
import { auth, provider } from '../firebase';
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import UploadForm from './UploadForm';
import ShippingForm from './ShippingForm';
import LogoutButton from './LogoutButton';

function AuthPage() {
  const [user, setUser] = useState(null);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      setUser(result.user);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      {!user ? (
        <div>
          <h1>🧑‍💻 Client Portal</h1> {/* ✅ Added header to identify client */}
          <LogoutButton /> {/* ✅ Moved to always show on top */}
          <h2>Login or Sign Up</h2>
          <button onClick={handleGoogleSignIn}>Sign in with Google</button>
          <form onSubmit={handleEmailLogin}>
            <input name="email" type="email" placeholder="Email" required />
            <input name="password" type="password" placeholder="Password" required />
            <button type="submit">Login</button>
          </form>
          <form onSubmit={handleEmailSignup}>
            <input name="email" type="email" placeholder="Email" required />
            <input name="password" type="password" placeholder="Password" required />
            <button type="submit">Sign Up</button>
          </form>
        </div>
      ) : (
        <>
          <h1>🧑‍💻 Client Dashboard</h1>
          <LogoutButton />
          <ShippingForm user={user} />
          <UploadForm user={user} />
        </>
      )}
    </div>
  );
}

export default AuthPage;

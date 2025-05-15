// src/App.jsx
import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, getIdTokenResult, signOut } from 'firebase/auth';

import AuthPage     from './components/AuthPage';
import UploadForm   from './components/UploadForm';
import ShippingForm from './components/ShippingForm';
import AdminPanel   from './components/AdminPanel';

function App() {
  const [user, setUser]     = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      if (u) {
        setUser(u);
        const tokenResult = await getIdTokenResult(u);
        setIsAdmin(!!tokenResult.claims.admin);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });
    return unsub;
  }, []);

  const handleSignOut = () => signOut(auth).catch(console.error);

  // 1) Unauthenticated → show AuthPage
  if (!user) {
    return <AuthPage />;
  }

  // 2) Admin → AdminPanel (includes pricing config, etc.)
  if (isAdmin) {
    return (
      <div className="App">
        <button onClick={handleSignOut}>Sign Out</button>
        <AdminPanel />
      </div>
    );
  }

  // 3) Client → only client workflows (no pricing manager here)
  return (
    <div className="App">
      <button onClick={handleSignOut}>Sign Out</button>
      <h2>Client Dashboard</h2>
      <section>
        <h3>Upload Your 3D File</h3>
        <UploadForm />
      </section>
      <section>
        <h3>Enter Shipping Details</h3>
        <ShippingForm />
      </section>
    </div>
  );
}

export default App;

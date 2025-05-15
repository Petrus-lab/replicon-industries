// src/App.jsx
import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, getIdTokenResult, signOut } from 'firebase/auth';

import AuthPage        from './components/AuthPage';
import UploadForm      from './components/UploadForm';
import ShippingForm    from './components/ShippingForm';
import PricingManager  from './components/PricingManager';
import AdminPanel      from './components/AdminPanel';

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const tokenResult = await getIdTokenResult(u);
        setIsAdmin(Boolean(tokenResult.claims.admin));
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });
    return unsubscribe;
  }, []);

  const handleSignOut = () => {
    signOut(auth).catch(console.error);
  };

  // 1) If not logged in, show AuthPage
  if (!user) {
    return <AuthPage />;
  }

  // 2) If admin, show admin controls
  if (isAdmin) {
    return (
      <div className="App">
        <button onClick={handleSignOut}>Sign Out</button>
        <AdminPanel />
      </div>
    );
  }

  // 3) Otherwise, show client workflow
  return (
    <div className="App">
      <button onClick={handleSignOut}>Sign Out</button>
      <UploadForm />
      <ShippingForm />
      <PricingManager />
    </div>
  );
}

export default App;
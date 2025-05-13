// ✅ FILE: src/App.jsx

import React, { useEffect, useState } from 'react';
import { auth } from './firebase';
import AuthPage from './components/AuthPage';
import AdminRoute from './components/AdminRoute';

function App() {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      try {
        if (currentUser) {
          await currentUser.getIdToken(true); // ✅ Force refresh for updated claims
          const tokenResult = await currentUser.getIdTokenResult();
          setIsAdmin(!!tokenResult.claims.admin);
          setUser(currentUser);
          console.log("✅ User authenticated:", currentUser.email, "Admin:", !!tokenResult.claims.admin);
        }
      } catch (err) {
        console.error("Error checking auth status:", err);
      } finally {
        setChecking(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (checking) return <div style={{ padding: '2rem' }}>🔄 Checking role...</div>;

  return isAdmin ? <AdminRoute /> : <AuthPage />;
}

export default App;

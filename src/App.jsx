// src/App.jsx
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
      if (currentUser) {
        await currentUser.getIdToken(true); // force refresh
        const tokenResult = await currentUser.getIdTokenResult();
        setIsAdmin(!!tokenResult.claims.admin);
        setUser(currentUser);
      }
      setChecking(false);
    });

    return () => unsubscribe();
  }, []);

  if (checking) return <div>Checking role...</div>;
  return isAdmin ? <AdminRoute /> : <AuthPage />;
}

export default App;



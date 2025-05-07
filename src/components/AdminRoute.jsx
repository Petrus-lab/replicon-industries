import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { getIdTokenResult } from 'firebase/auth';
import AdminPanel from './AdminPanel';
import AuthPage from './AuthPage';

const AdminRoute = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Force refresh to ensure latest custom claims are loaded
        await user.getIdToken(true);
        const token = await getIdTokenResult(user);
        setIsAdmin(!!token.claims.admin);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;
  return isAdmin ? <AdminPanel /> : <AuthPage />;
};

export default AdminRoute;

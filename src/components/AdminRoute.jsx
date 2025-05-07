// src/components/AdminRoute.jsx
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
        await user.getIdToken(true); // force refresh to get latest claims
        const token = await getIdTokenResult(user);
        setIsAdmin(!!token.claims.admin);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <div style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
        {isAdmin ? 'Admin View' : 'Client View'}
      </div>
      {isAdmin ? <AdminPanel /> : <AuthPage />}
    </div>
  );
};

export default AdminRoute;

import React, { useEffect, useState } from 'react';
import { auth, isAdminUser } from '../firebase';
import AdminPanel from './AdminPanel';
import AuthPage from './AuthPage';

const AdminRoute = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const isAdmin = await isAdminUser(user);
        setIsAdmin(isAdmin);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;
  return isAdmin ? <AdminPanel /> : <AuthPage />;
};

export default AdminRoute;

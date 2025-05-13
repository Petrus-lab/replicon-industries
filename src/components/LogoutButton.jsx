// ✅ FILE: src/components/LogoutButton.jsx

import React from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const LogoutButton = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('Logged out successfully.');
      window.location.href = '/'; // ✅ Redirect to login/home instead of reload
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Error during logout.');
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;

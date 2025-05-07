import React from 'react';
import { auth } from '../firebase';

function LogoutButton() {
  const handleLogout = async () => {
    try {
      await auth.signOut();
      window.location.reload(); // Refresh to return to AuthPage
    } catch (err) {
      alert('Logout failed: ' + err.message);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
}

export default LogoutButton;

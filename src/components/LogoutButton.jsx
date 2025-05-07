// src/components/LogoutButton.jsx
import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const LogoutButton = () => {
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User signed out.");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
};

export default LogoutButton;

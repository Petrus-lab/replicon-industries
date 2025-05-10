// Path: src/components/LogoutButton.jsx

import React from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const LogoutButton = () => {
  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;

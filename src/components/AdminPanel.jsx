// src/components/AdminPanel.jsx

import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import InventoryStatus from './InventoryStatus';
import JobStatusReport from './JobStatusReport';
import '../styles/global.css';

const AdminPanel = () => {
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserEmail(currentUser.email);
    }
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        alert('Logged out successfully.');
        window.location.href = '/';
      })
      .catch(error => console.error("Logout error:", error));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Admin Dashboard – Logged in as {userEmail}</h2>
      <button onClick={handleLogout} className="form-button">Logout</button>

      {/* ===== Inventory Status Report ===== */}
      <section style={{ marginTop: '2rem' }}>
        <InventoryStatus />
      </section>

      {/* ===== Job Status Report ===== */}
      <section style={{ marginTop: '2rem' }}>
        <JobStatusReport />
      </section>
    </div>
  );
};

export default AdminPanel;

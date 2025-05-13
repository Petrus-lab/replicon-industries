// ✅ FILE: src/components/AdminPanel.jsx

import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Papa from 'papaparse';
import AdminUserProfileViewer from './AdminUserProfileViewer'; // ✅ Added



const AdminPanel = () => {
  const [jobs, setJobs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null); // ✅ Added
  const [shippingAddresses, setShippingAddresses] = useState({});
  const [markup, setMarkup] = useState(1.2);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const jobSnap = await getDocs(collection(db, 'jobs'));
      setJobs(jobSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const orderSnap = await getDocs(collection(db, 'orders'));
      setOrders(orderSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const userSnap = await getDocs(collection(db, 'users'));
      const userList = userSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(userList);

      const markupRef = doc(db, 'settings', 'markupSettings');
      const markupSnap = await getDoc(markupRef);
      if (markupSnap.exists()) {
        setMarkup(markupSnap.data().markup || 1.2);
      }

      const addresses = {};
      for (const user of userList) {
        const shippingDoc = await getDoc(doc(db, 'shipping', user.id));
        if (shippingDoc.exists()) {
          addresses[user.id] = shippingDoc.data();
        }
      }
      setShippingAddresses(addresses);

      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdTokenResult();
        setUserEmail(currentUser.email);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      alert('Logged out successfully.');
      window.location.href = '/';
    }).catch(console.error);
  };

// Add this function anywhere before the return statement
const exportUserProfilesToCSV = () => {
  const data = users.map(user => ({
    UserID: user.id,
    Email: user.email || 'N/A',
    Name: user.name || 'N/A',
    IsAdmin: user.isAdmin ? 'Yes' : 'No',
    DefaultFinish: user.defaultFinish || 'N/A',
    Address: shippingAddresses[user.id]?.address || 'N/A',
    Suburb: shippingAddresses[user.id]?.suburb || 'N/A',
    City: shippingAddresses[user.id]?.city || 'N/A',
    Zip: shippingAddresses[user.id]?.zip || 'N/A',
    Country: shippingAddresses[user.id]?.country || 'N/A'
  }));

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'user_profiles.csv';
  a.click();
};


  return (
    <div>
      <h2>Admin Panel - Logged in as {userEmail}</h2>

      {/* ✅ User Selection Dropdown */}
      <div style={{ marginBottom: '1rem' }}>
        <label>Select User Profile to View: </label>
        <select onChange={(e) => setSelectedUserId(e.target.value)} value={selectedUserId || ''}>
          <option value="">-- Select a User --</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.email}
            </option>
          ))}
        </select>
      </div>

      {/* ✅ User Profile Viewer */}
      {selectedUserId && <AdminUserProfileViewer userId={selectedUserId} />}

      <button onClick={handleLogout}>Logout</button>

      <button onClick={exportUserProfilesToCSV}>Export User Profiles to CSV</button>  // Add this button next to your other export buttons or logout button

    </div>
  );
};

export default AdminPanel;

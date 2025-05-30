// ✅ FILE: src/components/AdminPanel.jsx

import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Papa from 'papaparse';

export default function AdminPanel() {
  const [jobs, setJobs]                     = useState([]);
  const [orders, setOrders]                 = useState([]);
  const [users, setUsers]                   = useState([]);
  const [shippingAddresses, setShippingAddresses] = useState({});
  const [markup, setMarkup]                 = useState(1.2);
  const [userEmail, setUserEmail]           = useState('');

  useEffect(() => {
    const fetchData = async () => {
      // jobs
      const jobSnap = await getDocs(collection(db, 'jobs'));
      setJobs(jobSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // orders
      const orderSnap = await getDocs(collection(db, 'orders'));
      setOrders(orderSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // users
      const userSnap = await getDocs(collection(db, 'users'));
      const userList = userSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(userList);

      // pricing (markup)
      const markupSnap = await getDoc(doc(db, 'settings', 'markupSettings'));
      if (markupSnap.exists()) {
        setMarkup(markupSnap.data().markup || 1.2);
      }

      // shipping addresses
      const addrMap = {};
      for (const u of userList) {
        const s = await getDoc(doc(db, 'shipping', u.id));
        if (s.exists()) addrMap[u.id] = s.data();
      }
      setShippingAddresses(addrMap);

      // current user token/email
      const cu = auth.currentUser;
      if (cu) {
        const token = await cu.getIdTokenResult();
        setUserEmail(cu.email || '');
      }
    };
    fetchData();
  }, []);

  const updateMarkup = async () => {
    await updateDoc(doc(db, 'settings', 'markupSettings'), { markup });
    alert('Markup updated.');
  };

  const exportToCSV = () => {
    const data = jobs.map(j => ({
      fileName: j.fileName,
      status: j.status,
      shippingAddress: shippingAddresses[j.uid]?.addressLine1 || '',
      baseCost: j.cost,
      adjustedCost: (j.cost * markup).toFixed(2),
    }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jobs_history.csv';
    a.click();
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      window.location.href = '/';
    });
  };

  return (
    <div className="form" style={{ padding: '2rem' }}>
      <h2 className="form-title">Admin Dashboard — {userEmail}</h2>

      {/* Markup Section */}
      <section className="form-group">
        <label className="form-label">Markup (%):</label>
        <input
          type="number"
          value={markup * 100}
          onChange={e => setMarkup(e.target.value / 100)}
          step="0.1"
          className="form-input quarter-width"
        />
        <button
          onClick={updateMarkup}
          className="form-button quarter-width"
        >
          Save Markup
        </button>
      </section>

      {/* Logout & Export */}
      <section className="form-group">
        <button
          onClick={handleLogout}
          className="form-button quarter-width"
        >
          Logout
        </button>
        <button
          onClick={exportToCSV}
          className="form-button quarter-width"
        >
          Export Jobs CSV
        </button>
      </section>

      {/* Jobs */}
      <section className="form-group">
        <h3>Jobs</h3>
        <ul>
          {jobs.map(job => (
            <li key={job.id}>
              <p><strong>File:</strong> {job.fileName}</p>
              <p><strong>Status:</strong> {job.status}</p>
              <p><strong>Shipping:</strong> {shippingAddresses[job.uid]?.addressLine1 || 'N/A'}</p>
              <p><strong>Cost:</strong> {job.cost}</p>
              <p><strong>Adjusted:</strong> {(job.cost * markup).toFixed(2)}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Orders */}
      <section className="form-group">
        <h3>Orders</h3>
        <ul>
          {orders.map(o => (
            <li key={o.id}>
              <p><strong>Material:</strong> {o.material}</p>
              <p><strong>Color:</strong> {o.color}</p>
              <p><strong>Cost:</strong> {o.cost}</p>
              <p><strong>Status:</strong> {o.status}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Users */}
      <section className="form-group">
        <h3>Users</h3>
        <ul>
          {users.map(u => (
            <li key={u.id}>
              <p><strong>Email:</strong> {u.email}</p>
              <p><strong>Name:</strong> {u.name}</p>
              <p><strong>Admin:</strong> {u.isAdmin ? 'Yes' : 'No'}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

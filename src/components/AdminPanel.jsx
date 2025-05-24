// src/components/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Papa from 'papaparse';

const AdminPanel = () => {
  const [jobs, setJobs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [shippingAddresses, setShippingAddresses] = useState({});
  const [markup, setMarkup] = useState(1.2);
  const [userEmail, setUserEmail] = useState("");
  const [materials, setMaterials] = useState([]);
  const [colors, setColors] = useState([]);

  const statusOptions = ['pending', 'processing', 'shipped'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Jobs
        const jobSnap = await getDocs(collection(db, 'jobs'));
        setJobs(jobSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Orders (for admin overview)
        const orderSnap = await getDocs(collection(db, 'orders'));
        setOrders(orderSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Users
        const userSnap = await getDocs(collection(db, 'users'));
        const userList = userSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setUsers(userList);

        // Pricing settings
        const pricingSnap = await getDoc(doc(db, 'settings', 'pricing'));
        if (pricingSnap.exists()) {
          setMaterials(pricingSnap.data().availableMaterials || []);
          setColors(pricingSnap.data().availableColors || []);
        }
        const markupSnap = await getDoc(doc(db, 'settings', 'markupSettings'));
        if (markupSnap.exists()) {
          setMarkup(markupSnap.data().markupSettings ?? 1.2);
        }

        // Shipping addresses
        const addresses = {};
        for (const u of userList) {
          const shippingSnap = await getDoc(doc(db, 'shipping', u.id));
          if (shippingSnap.exists()) {
            addresses[u.id] = shippingSnap.data();
          }
        }
        setShippingAddresses(addresses);

        // Admin email
        const currentUser = auth.currentUser;
        if (currentUser) {
          setUserEmail(currentUser.email);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Update both /jobs and any matching /orders
  const updateJobStatus = async (jobId, newStatus) => {
    try {
      // Update the job document
      await updateDoc(doc(db, 'jobs', jobId), { status: newStatus });
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j));

      // Also update any orders linked to this jobId
      const ordersQ = query(
        collection(db, 'orders'),
        where('jobId', '==', jobId)
      );
      const ordersSnap = await getDocs(ordersQ);
      ordersSnap.forEach(orderDoc => {
        updateDoc(orderDoc.ref, { status: newStatus });
      });
      // Refresh local orders array
      setOrders(orders.map(o => o.jobId === jobId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error("Error updating job/order status:", error);
    }
  };

  const updateMarkup = async () => {
    try {
      await updateDoc(doc(db, 'settings', 'markupSettings'), { markupSettings: markup });
      alert('Markup updated successfully.');
    } catch (error) {
      console.error("Error updating markup:", error);
    }
  };

  const exportToCSV = () => {
    const data = jobs.map(job => ({
      fileName: job.fileName,
      status: job.status,
      shippingAddress: shippingAddresses[job.uid]
        ? `${shippingAddresses[job.uid].addressLine1}, ${shippingAddresses[job.uid].suburb}, ${shippingAddresses[job.uid].city}, ${shippingAddresses[job.uid].postalCode}, ${shippingAddresses[job.uid].country}`
        : 'N/A',
      baseCost: job.cost,
      adjustedCost: (job.cost * markup).toFixed(2),
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
    signOut(auth)
      .then(() => window.location.href = '/')
      .catch(err => console.error("Logout error:", err));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Admin Panel - Logged in as {userEmail}</h2>

      {/* Navigation */}
      <nav style={{ margin: '1rem 0', display: 'flex', gap: '1rem' }}>
        <Link to="/admin"><button>Dashboard Home</button></Link>
        <Link to="/admin/users"><button>User Profiles</button></Link>
        <Link to="/admin/pricing"><button>Pricing Manager</button></Link>
      </nav>

      {/* Markup */}
      <div style={{ margin: '1rem 0' }}>
        <label>
          Markup (%):
          <input
            type="number"
            value={markup * 100}
            onChange={e => setMarkup(e.target.value / 100)}
            step="0.1"
            min="1"
            max="100"
            style={{ marginLeft: '0.5rem', width: '5rem' }}
          />
        </label>
        <button onClick={updateMarkup} style={{ marginLeft: '1rem' }}>
          Save Markup
        </button>
      </div>

      <button onClick={handleLogout}>Logout</button>
      <button onClick={exportToCSV} style={{ marginLeft: '1rem' }}>
        Export Jobs CSV
      </button>

      {/* Jobs */}
      <h3 style={{ marginTop: '2rem' }}>Jobs</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {jobs.map(job => (
          <li key={job.id} style={{
            border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem'
          }}>
            <p><strong>File Name:</strong> {job.fileName}</p>
            <p><strong>Status:</strong>
              <select
                value={job.status}
                onChange={e => updateJobStatus(job.id, e.target.value)}
                style={{ marginLeft: '0.5rem' }}
              >
                {statusOptions.map(s => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </p>
            {shippingAddresses[job.uid] && (
              <>
                <p><strong>Shipping Address:</strong></p>
                <div style={{ paddingLeft: '1rem' }}>
                  <div>{shippingAddresses[job.uid].addressLine1}</div>
                  <div>{shippingAddresses[job.uid].suburb}</div>
                  <div>{shippingAddresses[job.uid].city}</div>
                  <div>{shippingAddresses[job.uid].postalCode}</div>
                  <div>{shippingAddresses[job.uid].country}</div>
                </div>
              </>
            )}
            <p><strong>Cost:</strong> {job.cost}</p>
            <p><strong>Adjusted Cost:</strong> {(job.cost * markup).toFixed(2)}</p>
          </li>
        ))}
      </ul>

      {/* Orders */}
      <h3>Orders</h3>
      <ul>
        {orders.map(o => (
          <li key={o.id}>
            <strong>Order:</strong> {o.id}
            {' — '}<strong>Status:</strong> {o.status}
          </li>
        ))}
      </ul>

      {/* Users */}
      <h3>Users</h3>
      <ul>
        {users.map(u => (
          <li key={u.id}>
            <strong>Email:</strong> {u.email}, <strong>Name:</strong> {u.name}, <strong>Admin:</strong> {u.isAdmin ? 'Yes' : 'No'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;

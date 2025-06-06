// src/components/AdminPanel.jsx

import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Papa from 'papaparse';
import InventoryStatus from './InventoryStatus'; // original import
import '../styles/global.css';

const AdminPanel = () => {
  const [jobs, setJobs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [shippingAddresses, setShippingAddresses] = useState({});
  const [markup, setMarkup] = useState(1.2);
  const [userEmail, setUserEmail] = useState("");
  const [materials, setMaterials] = useState([]);
  const [colors, setColors] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Jobs
        const jobSnap = await getDocs(collection(db, 'jobs'));
        setJobs(jobSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Fetch Orders
        const orderSnap = await getDocs(collection(db, 'orders'));
        setOrders(orderSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Fetch Users
        const userSnap = await getDocs(collection(db, 'users'));
        const userList = userSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setUsers(userList);

        // Fetch Pricing (materials/colors)
        const pricingSnap = await getDoc(doc(db, 'settings', 'pricing'));
        if (pricingSnap.exists()) {
          setMaterials(pricingSnap.data().availableMaterials || []);
          setColors(pricingSnap.data().availableColors || []);
        }

        // Fetch Markup
        const markupSnap = await getDoc(doc(db, 'settings', 'markupSettings'));
        if (markupSnap.exists()) {
          setMarkup(markupSnap.data().markup || 1.2);
        }

        // Fetch Shipping Addresses for Jobs
        const addresses = {};
        for (const user of userList) {
          const shippingSnap = await getDoc(doc(db, 'shipping', user.id));
          if (shippingSnap.exists()) {
            addresses[user.id] = shippingSnap.data();
          }
        }
        setShippingAddresses(addresses);

        // Check current user’s admin claim
        const currentUser = auth.currentUser;
        if (currentUser) {
          const token = await currentUser.getIdTokenResult();
          setIsAdmin(!!token.claims.admin);
          setUserEmail(currentUser.email);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleJobFieldChange = async (jobId, field, value) => {
    try {
      await updateDoc(doc(db, 'jobs', jobId), { [field]: value });
      setJobs(jobs.map(j => (j.id === jobId ? { ...j, [field]: value } : j)));
    } catch (error) {
      console.error(`Error updating ${field} for job ${jobId}:`, error);
    }
  };

  const updateJobStatus = (jobId, newStatus) => {
    handleJobFieldChange(jobId, 'status', newStatus);
  };

  const updateMarkup = async () => {
    try {
      await updateDoc(doc(db, 'settings', 'markupSettings'), { markup });
      alert('Markup updated successfully.');
    } catch (error) {
      console.error("Error updating markup:", error);
    }
  };

  const exportJobsToCSV = () => {
    const data = jobs.map(job => ({
      fileName: job.fileName,
      status: job.status,
      shippingAddress: shippingAddresses[job.uid]?.fullAddress || 'N/A',
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
      .then(() => {
        alert('Logged out successfully.');
        window.location.href = '/';
      })
      .catch(error => console.error("Logout error:", error));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Admin Panel - Logged in as {userEmail}</h2>

      <div>
        <label>
          Markup (%):
          <input
            type="number"
            value={markup * 100}
            onChange={e => setMarkup(e.target.value / 100)}
            step="0.1"
            min="1.0"
            max="100.0"
          />
        </label>
        <button onClick={updateMarkup} className="form-button">Save Markup</button>
      </div>

      <button onClick={handleLogout} className="form-button">Logout</button>
      <button onClick={exportJobsToCSV} className="form-button">Export Jobs to CSV</button>

      {/* ====== Inventory Status Report ====== */}
      <InventoryStatus />

      {/* ====== Jobs Report ====== */}
      <h3>Jobs</h3>
      <ul className="status-list">
        {jobs.map(job => (
          <li key={job.id} className="status-item">
            <p><strong>File Name:</strong> {job.fileName}</p>
            <p><strong>Status:</strong> {job.status}</p>
            <p><strong>Shipping Address:</strong></p>
            {shippingAddresses[job.uid] ? (
              <div style={{ paddingLeft: '1rem' }}>
                <div>{shippingAddresses[job.uid].addressLine1}</div>
                <div>{shippingAddresses[job.uid].suburb}</div>
                <div>{shippingAddresses[job.uid].city}</div>
                <div>{shippingAddresses[job.uid].postalCode}</div>
                <div>{shippingAddresses[job.uid].country}</div>
              </div>
            ) : (
              <p>N/A</p>
            )}
            <p><strong>Cost:</strong> {job.cost}</p>
            <p><strong>Adjusted Cost:</strong> {(job.cost * markup).toFixed(2)}</p>
            <button onClick={() => updateJobStatus(job.id, 'Processing')} className="form-button">
              Start Processing
            </button>
            <button onClick={() => updateJobStatus(job.id, 'Shipped')} className="form-button">
              Mark as Shipped
            </button>
            <button
              onClick={() =>
                updateJobStatus(job.id, prompt('New Shipping Address:', job.shippingAddress))
              }
              className="form-button"
            >
              Update Shipping Address
            </button>
          </li>
        ))}
      </ul>

      {/* ====== Orders ====== */}
      <h3>Orders</h3>
      <ul>
        {orders.map(order => (
          <li key={order.id}>
            <p><strong>Material:</strong> {order.material}</p>
            <p><strong>Color:</strong> {order.color}</p>
            <p><strong>Cost:</strong> {order.cost}</p>
            <p><strong>File URL:</strong> <a href={order.fileUrl} target="_blank" rel="noopener noreferrer">View File</a></p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>User ID:</strong> {order.userId}</p>
          </li>
        ))}
      </ul>

      {/* ====== Users ====== */}
      <h3>Users</h3>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Admin:</strong> {user.isAdmin ? 'Yes' : 'No'}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;

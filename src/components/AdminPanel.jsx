// Path: src/components/AdminPanel.jsx

import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';  // Import Firebase and Firebase Authentication
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';  // Firebase Authentication
import Papa from 'papaparse';  // For CSV export

const AdminPanel = () => {
  const [jobs, setJobs] = useState([]);  // Holds jobs data
  const [orders, setOrders] = useState([]);  // Holds orders data
  const [users, setUsers] = useState([]);  // Holds user data
  const [shippingAddresses, setShippingAddresses] = useState({});  // Holds shipping addresses
  const [markup, setMarkup] = useState(1.2);  // Default markup value (1.2 for 20%)
  const [isAdmin, setIsAdmin] = useState(false);  // Check if the user is an admin
  const [userEmail, setUserEmail] = useState("");  // For user's email, can be used for display
  const [materials, setMaterials] = useState([]);  // Available materials with base cost per gram
  const [colors, setColors] = useState([]);  // Available colors with markup percentage

  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch jobs
        const jobSnap = await getDocs(collection(db, 'jobs'));
        const jobList = jobSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setJobs(jobList);

        // Fetch orders
        const orderSnap = await getDocs(collection(db, 'orders'));
        const orderList = orderSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setOrders(orderList);

        // Fetch users
        const userSnap = await getDocs(collection(db, 'users'));
        const userList = userSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setUsers(userList);

        // Fetch pricing and materials
        const pricingRef = doc(db, 'settings', 'pricing');
        const pricingSnap = await getDoc(pricingRef);
        if (pricingSnap.exists()) {
          setMaterials(pricingSnap.data().availableMaterials);
          setColors(pricingSnap.data().availableColors);
        }

        // Fetch markup settings
        const markupRef = doc(db, 'settings', 'markupSettings');
        const markupSnap = await getDoc(markupRef);
        if (markupSnap.exists()) {
          setMarkup(markupSnap.data().markup);
        }

        // Fetch shipping addresses and associate with jobs
        const shippingAddresses = {};
        for (const user of userList) {
          const shippingDoc = await getDoc(doc(db, 'shipping', user.id));
          if (shippingDoc.exists()) {
            shippingAddresses[user.id] = shippingDoc.data();
          }
        }
        setShippingAddresses(shippingAddresses);

        // Check if user is admin
        const currentUser = auth.currentUser;
        if (currentUser) {
          const token = await currentUser.getIdTokenResult();
          setIsAdmin(token.claims.admin);  // Check admin claim
          setUserEmail(currentUser.email);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Update job status
  const updateJobStatus = async (jobId, status) => {
    try {
      await updateDoc(doc(db, 'jobs', jobId), { status });
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status } : j));
    } catch (error) {
      console.error("Error updating job status:", error);
    }
  };

  // Update shipping address for a job
  const updateShippingAddress = async (jobId, newAddress) => {
    try {
      await updateDoc(doc(db, 'jobs', jobId), { shippingAddress: newAddress });
      setJobs(jobs.map(j => j.id === jobId ? { ...j, shippingAddress: newAddress } : j));
    } catch (error) {
      console.error("Error updating shipping address:", error);
    }
  };

  // Update markup in Firestore
  const updateMarkup = async () => {
    try {
      await updateDoc(doc(db, 'settings', 'markupSettings'), { markup });
      alert('Markup updated successfully.');
    } catch (error) {
      console.error("Error updating markup:", error);
    }
  };

  // Export jobs to CSV
  const exportToCSV = () => {
    const data = jobs.map(job => ({
      fileName: job.fileName,
      status: job.status,
      shippingAddress: job.shippingAddress || 'N/A',
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

  // Logout functionality
  const handleLogout = () => {
    signOut(auth).then(() => {
      alert('Logged out successfully.');
      window.location.href = '/';  // Redirect to home or login page
    }).catch(error => console.error("Logout error:", error));
  };

  return (
    <div>
      <h2>Admin Panel - Logged in as {userEmail}</h2>

      {/* Markup Configuration */}
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
        <button onClick={updateMarkup}>Save Markup</button>
      </div>

      {/* Logout Button */}
      <button onClick={handleLogout}>Logout</button>

      {/* Export Data to CSV */}
      <button onClick={exportToCSV}>Export Jobs to CSV</button>

      {/* Display Jobs */}
      <h3>Jobs</h3>
      <ul>
        {jobs.map(job => (
          <li key={job.id}>
            <p><strong>File Name:</strong> {job.fileName}</p>
            <p><strong>Status:</strong> {job.status}</p>
            <p><strong>Shipping Address:</strong> {shippingAddresses[job.uid]?.address || 'N/A'}</p>
            <p><strong>Cost:</strong> {job.cost}</p>
            <p><strong>Adjusted Cost:</strong> {(job.cost * markup).toFixed(2)}</p>
            <button onClick={() => updateJobStatus(job.id, 'Processing')}>Start Processing</button>
            <button onClick={() => updateJobStatus(job.id, 'Shipped')}>Mark as Shipped</button>
            <button onClick={() => updateShippingAddress(job.id, prompt('New Shipping Address:', job.shippingAddress))}>Update Shipping Address</button>
          </li>
        ))}
      </ul>

      {/* Display Orders */}
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

      {/* Display Users */}
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

// Path: src/components/AdminPanel.jsx

import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Papa from 'papaparse';

const AdminPanel = () => {
  const [jobs, setJobs] = useState([]);
  const [shippingAddresses, setShippingAddresses] = useState({});
  const [markup, setMarkup] = useState(1.2);
  const [userEmail, setUserEmail] = useState("");

  // Fetch Jobs and Shipping Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Jobs
        const jobSnap = await getDocs(collection(db, 'jobs'));
        const jobList = jobSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setJobs(jobList);

        // Fetch Shipping Info for each Job UID
        const shippingData = {};
        for (const job of jobList) {
          const shipDoc = await getDoc(doc(db, 'shipping', job.uid));
          if (shipDoc.exists()) {
            shippingData[job.uid] = shipDoc.data();
          }
        }
        setShippingAddresses(shippingData);

        // Get Current Admin User Info
        const currentUser = auth.currentUser;
        if (currentUser) {
          const token = await currentUser.getIdTokenResult();
          if (token.claims.admin) {
            setUserEmail(currentUser.email);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    fetchData();
  }, []);

  const updateMarkup = async () => {
    try {
      await updateDoc(doc(db, 'settings', 'markupSettings'), { markup });
      alert('Markup updated successfully.');
    } catch (error) {
      console.error("Error updating markup:", error);
    }
  };

  const exportToCSV = () => {
    const data = jobs.map(job => ({
      fileName: job.fileName,
      cost: job.cost,
      adjustedCost: (job.cost * markup).toFixed(2),
      shippingAddress: shippingAddresses[job.uid]?.address || 'N/A',
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
      alert('Logged out successfully.');
      window.location.href = '/';
    }).catch(error => console.error("Logout error:", error));
  };

  return (
    <div>
      <h2>Admin Panel - Logged in as {userEmail}</h2>

      <div>
        <label>Markup (%):
          <input
            type="number"
            value={markup * 100}
            onChange={e => setMarkup(e.target.value / 100)}
            step="0.1"
          />
        </label>
        <button onClick={updateMarkup}>Save Markup</button>
      </div>

      <button onClick={handleLogout}>Logout</button>
      <button onClick={exportToCSV}>Export Jobs to CSV</button>

      <h3>Jobs</h3>
      <ul>
        {jobs.map(job => (
          <li key={job.id}>
            <p><strong>File Name:</strong> {job.fileName}</p>
            <p><strong>Shipping Address:</strong> {shippingAddresses[job.uid]?.address || 'N/A'}</p>
            <p><strong>Cost:</strong> {job.cost}</p>
            <p><strong>Adjusted Cost:</strong> {(job.cost * markup).toFixed(2)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;

// src/components/AdminPanel.jsx

import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import LogoutButton from './LogoutButton';

function AdminPanel() {
  const [jobs, setJobs] = useState([]);
  const [shipping, setShipping] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobsSnapshot = await getDocs(collection(db, 'jobs'));
        const jobList = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setJobs(jobList);

        const shippingSnapshot = await getDocs(collection(db, 'shipping'));
        const shippingList = shippingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setShipping(shippingList);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      }
    };

    fetchData();
  }, []);

  const exportToCSV = (data, filename) => {
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>🛠 Admin Panel</h2>
      <LogoutButton />

      <h3 style={{ marginTop: '2rem' }}>📂 Submitted Jobs</h3>
      {jobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        <>
          <button onClick={() => exportToCSV(jobs, 'jobs.csv')}>Export Jobs to CSV</button>
          <table border="1" cellPadding="6" style={{ marginTop: '1rem' }}>
            <thead>
              <tr>
                <th>User</th>
                <th>File</th>
                <th>Filament</th>
                <th>Color</th>
                <th>Cost</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id}>
                  <td>{job.email}</td>
                  <td>{job.fileName}</td>
                  <td>{job.filamentType}</td>
                  <td>{job.color}</td>
                  <td>{job.cost}</td>
                  <td>{job.createdAt?.toDate?.().toLocaleString?.() || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <h3 style={{ marginTop: '2rem' }}>🚚 Shipping Addresses</h3>
      {shipping.length === 0 ? (
        <p>No shipping addresses found.</p>
      ) : (
        <>
          <button onClick={() => exportToCSV(shipping, 'shipping.csv')}>Export Shipping to CSV</button>
          <table border="1" cellPadding="6" style={{ marginTop: '1rem' }}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Address</th>
                <th>City</th>
                <th>Postal Code</th>
                <th>Country</th>
              </tr>
            </thead>
            <tbody>
              {shipping.map(entry => (
                <tr key={entry.id}>
                  <td>{entry.email}</td>
                  <td>{entry.address}</td>
                  <td>{entry.city}</td>
                  <td>{entry.zip}</td>
                  <td>{entry.country}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default AdminPanel;

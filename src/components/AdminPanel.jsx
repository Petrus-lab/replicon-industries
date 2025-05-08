// File: src/components/AdminPanel.jsx

import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import LogoutButton from './LogoutButton';

function AdminPanel() {
  const [jobs, setJobs] = useState([]);
  const [shipping, setShipping] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobSnapshot = await getDocs(collection(db, 'jobs'));
        const jobList = jobSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setJobs(jobList);
      } catch (error) {
        console.error('Error loading jobs:', error);
      }
    };

    const fetchShipping = async () => {
      try {
        const shipSnapshot = await getDocs(collection(db, 'shipping'));
        const shipList = shipSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setShipping(shipList);
      } catch (error) {
        console.error('Error loading shipping info:', error);
      }
    };

    fetchJobs();
    fetchShipping();
  }, []);

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Admin Panel</h2>
      <LogoutButton />

      <h3>Print Jobs</h3>
      {jobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        <table>
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
      )}

      <h3>Shipping Info</h3>
      {shipping.length === 0 ? (
        <p>No shipping addresses found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Address</th>
              <th>City</th>
              <th>Zip</th>
              <th>Country</th>
            </tr>
          </thead>
          <tbody>
            {shipping.map(info => (
              <tr key={info.id}>
                <td>{info.uid}</td>
                <td>{info.email}</td>
                <td>{info.address}</td>
                <td>{info.city}</td>
                <td>{info.zip}</td>
                <td>{info.country}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminPanel;

import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import LogoutButton from './LogoutButton';

function AdminPanel() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobSnapshot = await getDocs(collection(db, 'jobs'));
        console.log('📦 Raw jobSnapshot:', jobSnapshot);

        const jobList = jobSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log('✅ Processed jobs:', jobList);
        setJobs(jobList);
      } catch (error) {
        console.error('❌ Firestore fetch error:', error);
        alert('Error loading jobs. See console for details.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Admin Panel</h2>
      <LogoutButton />
      {loading ? (
        <p>Loading...</p>
      ) : jobs.length === 0 ? (
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
    </div>
  );
}

export default AdminPanel;

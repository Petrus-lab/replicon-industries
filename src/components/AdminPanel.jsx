import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import LogoutButton from './LogoutButton';


function AdminPanel() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      const jobCollection = await getDocs(collection(db, 'jobs'));
      const jobList = jobCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobs(jobList);
    };

    fetchJobs();
  }, []);

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Admin Panel</h2>
	<LogoutButton />
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
    </div>
  );
}

export default AdminPanel;

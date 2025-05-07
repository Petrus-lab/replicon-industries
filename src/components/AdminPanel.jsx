// src/components/AdminPanel.jsx

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
        const jobList = jobSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setJobs(jobList);
      } catch (error) {
        console.error('❌ Failed to fetch jobs:', error);
        alert('Error loading jobs. See console for details.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const downloadCSV = () => {
    if (jobs.length === 0) {
      alert('No job data to export.');
      return;
    }

    const headers = ['Email', 'File', 'Filament Type', 'Color', 'Cost', 'Submitted'];
    const rows = jobs.map(job => [
      job.email || '',
      job.fileName || '',
      job.filamentType || '',
      job.color || '',
      job.cost || '',
      job.createdAt?.toDate?.().toLocaleString?.() || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'replicon_job_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🛠️ ADMIN PANEL VIEW</h2>
      <LogoutButton />

      {loading ? (
        <p>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p>No jobs found in the database.</p>
      ) : (
        <>
          <button onClick={downloadCSV} style={{ marginBottom: '1rem' }}>
            ⬇️ Export to CSV
          </button>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid black' }}>User Email</th>
                <th style={{ border: '1px solid black' }}>File Name</th>
                <th style={{ border: '1px solid black' }}>Filament Type</th>
                <th style={{ border: '1px solid black' }}>Color</th>
                <th style={{ border: '1px solid black' }}>Cost</th>
                <th style={{ border: '1px solid black' }}>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id}>
                  <td style={{ border: '1px solid black' }}>{job.email || 'N/A'}</td>
                  <td style={{ border: '1px solid black' }}>{job.fileName || 'N/A'}</td>
                  <td style={{ border: '1px solid black' }}>{job.filamentType || 'N/A'}</td>
                  <td style={{ border: '1px solid black' }}>{job.color || 'N/A'}</td>
                  <td style={{ border: '1px solid black' }}>{job.cost || 'N/A'}</td>
                  <td style={{ border: '1px solid black' }}>
                    {job.createdAt?.toDate?.().toLocaleString?.() || 'N/A'}
                  </td>
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

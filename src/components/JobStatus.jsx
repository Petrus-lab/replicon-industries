import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

const JobStatus = () => {
  const [jobs, setJobs] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchJobs = async () => {
      const isAdmin = user.email === 'admin@replicon.local';
      const q = isAdmin
        ? collection(db, 'jobs')
        : query(collection(db, 'jobs'), where('uid', '==', user.uid));

      const snapshot = await getDocs(q);
      const jobList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setJobs(jobList);
    };

    fetchJobs();
  }, [user]);

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await deleteDoc(doc(db, 'jobs', jobId));
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (err) {
      console.error('Failed to delete job:', err);
    }
  };

  return (
    <div className="section-container">
      <h2 className="section-heading">Job Status</h2>

      <div className="section-subblock" style={{ overflowX: 'auto' }}>
        <table className="table-wide">
          <thead>
            <tr>
              <th>Job ID</th>
              <th>Material</th>
              <th>Color</th>
              <th>Material Finish</th>
              <th>Post-Processing</th>
              <th>Print Quality</th>
              <th>Billing Address</th>
              <th>Shipping Address</th>
              <th>File</th>
              <th>Status</th>
              <th>Print Time</th>
              <th>Print Quote</th>
              <th>Post Time</th>
              <th>Post Quote</th>
              <th>Shipping Time</th>
              <th>Shipping Quote</th>
              <th>Total Price</th>
              <th>Total Processing</th>
              <th>Pay</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan="20">No jobs found.</td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.visualRef || job.id}</td>
                  <td>{job.material || ''}</td>
                  <td>{job.color || ''}</td>
                  <td>{job.materialFinish || ''}</td>
                  <td>{job.finish || ''}</td>
                  <td>{job.quality || ''}</td>
                  <td>
                    {job.billingAddress ? (
                      <span title={job.billingAddress.fullAddress}>Hover</span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>
                    {job.shippingAddress ? (
                      <span title={job.shippingAddress.fullAddress}>
                        {job.shippingAddress.type}
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>
                    {job.fileName ? (
                      <a href={job.fileUrl} target="_blank" rel="noreferrer">
                        {job.fileName}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>{job.status || 'Uploaded'}</td>
                  <td>{job.printTime || 'Pending'}</td>
                  <td>{job.printQuote || 'Pending'}</td>
                  <td>{job.postProcessingTime || 'Pending'}</td>
                  <td>{job.postProcessingQuote || 'Pending'}</td>
                  <td>{job.shippingTime || 'Pending'}</td>
                  <td>{job.shippingQuote || 'Pending'}</td>
                  <td>
                    {job.totalQuote
                      ? `R ${job.totalQuote.toFixed(2)}`
                      : 'Pending'}
                  </td>
                  <td>
                    {job.totalProcessingTime
                      ? `${job.totalProcessingTime} hrs`
                      : 'Pending'}
                  </td>
                  <td>
                    {job.status === 'Quoted' &&
                    job.printQuote &&
                    job.postProcessingQuote &&
                    job.shippingQuote ? (
                      <button className="button-primary">Pay</button>
                    ) : (
                      <button disabled className="button-disabled">
                        Pay
                      </button>
                    )}
                  </td>
                  <td>
                    {job.status !== 'Paid' && (
                      <button
                        className="button-secondary"
                        onClick={() => handleDelete(job.id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobStatus;

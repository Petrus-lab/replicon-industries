import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

const JobStatus = () => {
  const [jobs, setJobs] = useState([]);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const u = auth.currentUser;
      setUser(u);
      if (u) {
        const token = await u.getIdTokenResult();
        setIsAdmin(!!token.claims.admin);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return;
      const q = isAdmin
        ? query(collection(db, 'jobs'))
        : query(collection(db, 'jobs'), where('uid', '==', user.uid));
      const snapshot = await getDocs(q);
      const jobList = [];
      snapshot.forEach((doc) => {
        jobList.push({ id: doc.id, ...doc.data() });
      });
      setJobs(jobList);
    };
    fetchJobs();
  }, [user, isAdmin]);

  const handlePay = async (jobId) => {
    await updateDoc(doc(db, 'jobs', jobId), {
      status: 'Paid',
    });
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, status: 'Paid' } : job
      )
    );
  };

  const handleDelete = async (jobId) => {
    await deleteDoc(doc(db, 'jobs', jobId));
    setJobs((prev) => prev.filter((job) => job.id !== jobId));
  };

  const renderAddressHover = (data) => {
    if (!data || typeof data !== 'object') return 'Invalid address';
    return `${data.fullName || ''}\n${data.line1 || ''}\n${data.line2 || ''}\n${data.city || ''}\n${data.suburb || ''}\n${data.postalCode || ''}\n${data.country || ''}`;
  };

  return (
    <div className="section-container">
      <h2 className="section-heading">Job Status</h2>
      <div className="job-table-wrapper">
        <table className="job-table">
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
              <th>Total Time</th>
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
              jobs.map((job) => {
                const {
                  visualRef,
                  material,
                  color,
                  materialFinish,
                  finish,
                  quality,
                  billingAddress,
                  shippingAddress,
                  fileName,
                  fileUrl,
                  status,
                  printTime,
                  printQuote,
                  postProcessingTime,
                  postProcessingQuote,
                  shippingTime,
                  shippingQuote,
                } = job;

                const totalPrice =
                  (printQuote || 0) +
                  (postProcessingQuote || 0) +
                  (shippingQuote || 0);

                const totalTime =
                  (printTime || 0) + (postProcessingTime || 0);

                const quotesAreValid =
                  typeof printQuote === 'number' &&
                  typeof postProcessingQuote === 'number' &&
                  typeof shippingQuote === 'number';

                return (
                  <tr key={job.id}>
                    <td>{visualRef || job.id}</td>
                    <td>{material}</td>
                    <td>{color}</td>
                    <td>{materialFinish}</td>
                    <td>{finish}</td>
                    <td>{quality}</td>
                    <td>
                      <div
                        className="hover-popup"
                        title={renderAddressHover(billingAddress)}
                      >
                        View
                      </div>
                    </td>
                    <td>
                      <div
                        className="hover-popup"
                        title={renderAddressHover(shippingAddress)}
                      >
                        View
                      </div>
                    </td>
                    <td>
                      <a href={fileUrl} target="_blank" rel="noreferrer">
                        {fileName}
                      </a>
                    </td>
                    <td>{status}</td>
                    <td>{printTime || 'Pending'}</td>
                    <td>{printQuote != null ? `R${printQuote}` : 'Pending'}</td>
                    <td>{postProcessingTime || 'Pending'}</td>
                    <td>{postProcessingQuote != null ? `R${postProcessingQuote}` : 'Pending'}</td>
                    <td>{shippingTime || 'Pending'}</td>
                    <td>{shippingQuote != null ? `R${shippingQuote}` : 'Pending'}</td>
                    <td>{quotesAreValid ? `R${totalPrice}` : 'Pending'}</td>
                    <td>{totalTime ? `${totalTime} hrs` : 'Pending'}</td>
                    <td>
                      {status === 'Quoted' && quotesAreValid ? (
                        <button className="button-pay" onClick={() => handlePay(job.id)}>
                          Pay
                        </button>
                      ) : status === 'Paid' ? (
                        'Paid'
                      ) : (
                        <button className="button-disabled" disabled>
                          Pay
                        </button>
                      )}
                    </td>
                    <td>
                      {status !== 'Paid' && (
                        <button className="button-delete" onClick={() => handleDelete(job.id)}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobStatus;

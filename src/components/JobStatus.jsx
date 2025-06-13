// src/components/JobStatus.jsx

import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import '../styles/global.css';

const JobStatus = () => {
  const [jobs, setJobs] = useState([]);
  const [hoveredBilling, setHoveredBilling] = useState(null);
  const [hoveredShipping, setHoveredShipping] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const snapshot = await getDocs(
        query(collection(db, 'jobs'), where('uid', '==', user.uid))
      );
      const jobList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      jobList.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setJobs(jobList);
    };

    fetchJobs();
  }, []);

  const renderHover = (data, key) => {
    const isActive = key === 'billing' ? hoveredBilling === data : hoveredShipping === data;
    const setHover = key === 'billing' ? setHoveredBilling : setHoveredShipping;

    return (
      <div
        className="hover-trigger"
        onMouseEnter={() => setHover(data)}
        onMouseLeave={() => setHover(null)}
      >
        <span className="text-link">
          {key === 'billing' ? 'As per Profile' : (data === 'Default' ? 'Default' : 'One-Off')}
        </span>
        {isActive && data && typeof data === 'object' && (
          <div className="hover-popup">
            {data.fullName && <div>{data.fullName}</div>}
            {data.phoneNumber && <div>{data.phoneNumber}</div>}
            {data.line1 && <div>{data.line1}</div>}
            {data.line2 && <div>{data.line2}</div>}
            {data.suburb && <div>{data.suburb}</div>}
            {data.city && <div>{data.city}</div>}
            {data.postalCode && <div>{data.postalCode}</div>}
            {data.country && <div>{data.country}</div>}
          </div>
        )}
      </div>
    );
  };

  const handleDelete = (jobId) => {
    console.log('Request to delete job:', jobId);
    // deletion logic goes here
  };

  return (
    <div className="section-container">
      <h2 className="section-heading">Job Status</h2>
      <div className="table-scroll">
        <table className="table-fixed">
          <thead>
            <tr>
              <th>Job ID</th>
              <th>Material</th>
              <th>Color</th>
              <th>Material Finish</th>
              <th>Post Processing</th>
              <th>Print Quality</th>
              <th>Billing Address</th>
              <th>Shipping Address Type</th>
              <th>File Uploaded</th>
              <th>Status</th>
              <th>Print Time</th>
              <th>Print Cost</th>
              <th>Post Time</th>
              <th>Post Cost</th>
              <th>Ship Time</th>
              <th>Ship Cost</th>
              <th>Total Price</th>
              <th>Total Time</th>
              <th>Pay</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => {
              const canPay =
                job.status === 'Quoted' &&
                ['printCost', 'postProcessCost', 'shippingCost'].every(k => typeof job[k] === 'number');

              const totalCost = ['printCost', 'postProcessCost', 'shippingCost']
                .filter(k => typeof job[k] === 'number')
                .reduce((sum, k) => sum + job[k], 0);

              const totalTime = ['printTime', 'postProcessTime']
                .filter(k => typeof job[k] === 'number')
                .reduce((sum, k) => sum + job[k], 0);

              return (
                <tr key={job.id}>
                  <td>{job.visualRef || job.id}</td>
                  <td>{job.material}</td>
                  <td>{job.color}</td>
                  <td>{job.materialFinish}</td>
                  <td>{job.finish}</td>
                  <td>{job.quality}</td>
                  <td>{renderHover(job.billingAddress, 'billing')}</td>
                  <td>{renderHover(job.shippingAddress, 'shipping')}</td>
                  <td>
                    <a href={job.fileUrl} target="_blank" rel="noopener noreferrer">
                      {job.fileName}
                    </a>
                  </td>
                  <td>{job.status}</td>
                  <td>{job.printTime || 'Pending'}</td>
                  <td>{job.printCost != null ? `R${job.printCost.toFixed(2)}` : 'Pending'}</td>
                  <td>{job.postProcessTime || 'Pending'}</td>
                  <td>{job.postProcessCost != null ? `R${job.postProcessCost.toFixed(2)}` : 'Pending'}</td>
                  <td>{job.shippingTime || 'Pending'}</td>
                  <td>{job.shippingCost != null ? `R${job.shippingCost.toFixed(2)}` : 'Pending'}</td>
                  <td>{totalCost ? `R${totalCost.toFixed(2)}` : 'Pending'}</td>
                  <td>{totalTime || 'Pending'}</td>
                  <td>
                    {canPay ? (
                      <button className="button-primary" onClick={() => console.log('Process payment')}>
                        Pay
                      </button>
                    ) : (
                      <button className="button-disabled" disabled>
                        Pay
                      </button>
                    )}
                  </td>
                  <td>
                    {job.status !== 'Paid' && (
                      <button className="button-secondary" onClick={() => handleDelete(job.id)}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobStatus;

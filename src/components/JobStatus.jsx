import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const JobStatus = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const jobsRef = collection(db, 'jobs');
      const isAdmin = currentUser?.email === 'admin@replicon.local';

      const q = isAdmin
        ? query(jobsRef)
        : query(jobsRef, where('uid', '==', currentUser.uid));

      try {
        const snapshot = await getDocs(q);
        const jobList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setJobs(jobList);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      }
    };

    fetchJobs();
  }, []);

  const renderHover = (label, data) => {
    return (
      <span className="hover-popup" data-hover={label}>
        {label}
        <div className="hover-content">
          {data.fullName}<br />
          {data.phoneNumber}<br />
          {data.line1}<br />
          {data.line2}<br />
          {data.suburb}, {data.city}<br />
          {data.postalCode}, {data.country}
        </div>
      </span>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Uploaded': return 'text-gray';
      case 'Quoted': return 'text-blue';
      case 'Paid': return 'text-green';
      case 'Rejected': return 'text-red';
      default: return 'text-faint';
    }
  };

  return (
    <div className="section-container">
      <h2 className="section-heading">Job Status Dashboard</h2>
      {jobs.length === 0 ? (
        <p className="text-faint">No jobs found.</p>
      ) : (
        <div className="section-subblock">
          <div className="job-table-row header-row">
            <span>Stardate</span>
            <span>Material</span>
            <span>Color</span>
            <span>Material Finish</span>
            <span>Post-Processing</span>
            <span>Print Quality</span>
            <span>Billing Address</span>
            <span>Shipping</span>
            <span>File</span>
            <span>Status</span>
            <span>Print Time</span>
            <span>Print Quote</span>
            <span>Post Time</span>
            <span>Post Quote</span>
            <span>Shipping Time</span>
            <span>Shipping Quote</span>
            <span>Total</span>
            <span>Total Time</span>
            <span>Actions</span>
            <span></span>
          </div>

          {jobs.map(job => (
            <div className="job-table-row column-block" key={job.id}>
              <span>{job.visualRef}</span>
              <span>{job.material}</span>
              <span>{job.color}</span>
              <span>{job.materialFinish}</span>
              <span>{job.finish}</span>
              <span>{job.quality}</span>
              <span>{renderHover('Billing', job.billingAddress || {})}</span>
              <span>{renderHover(job.shippingType, job.shippingAddress || {})}</span>
              <span><a href={job.fileUrl} target="_blank" rel="noopener noreferrer">{job.fileName}</a></span>
              <span className={getStatusColor(job.status)}>{job.status}</span>
              <span>{job.printTime || 'Pending'}</span>
              <span>{job.printQuote ? `R${job.printQuote}` : 'Pending'}</span>
              <span>{job.postTime || 'Pending'}</span>
              <span>{job.postQuote ? `R${job.postQuote}` : 'Pending'}</span>
              <span>{job.shippingTime || 'Pending'}</span>
              <span>{job.shippingQuote ? `R${job.shippingQuote}` : 'Pending'}</span>
              <span>{job.totalPrice ? `R${job.totalPrice}` : 'Pending'}</span>
              <span>{job.totalProcessingTime || 'Pending'}</span>
              <span>
                {job.status === 'Quoted' && job.printQuote && job.postQuote && job.shippingQuote ? (
                  <button className="button-primary" onClick={() => {/* handle pay */}}>Pay</button>
                ) : (
                  <button className="button-disabled" disabled>Pay</button>
                )}
              </span>
              <span>
                {job.status !== 'Paid' && (
                  <button className="button-secondary" onClick={() => {/* handle delete */}}>Delete</button>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobStatus;

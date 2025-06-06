// src/components/JobStatus.jsx

import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import '../styles/global.css';

export default function JobStatus() {
  const [jobs, setJobs]         = useState([]);
  const [profiles, setProfiles] = useState({});
  const [shipData, setShipData] = useState({});
  const [hoverAddress, setHoverAddress] = useState('');
  const [hoverVisible, setHoverVisible] = useState(false);
  const hoverTimeoutRef = useRef(null);

  useEffect(() => {
    // Fetch all jobs in real time
    const jobsUnsub = onSnapshot(
      collection(db, 'jobs'),
      snapshot => {
        const jobList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setJobs(jobList);
        // Pre-fetch profiles and shipping for each job's user
        jobList.forEach(job => {
          // Billing Address (Profile)
          if (!profiles[job.uid]) {
            getDoc(doc(db, 'profiles', job.uid)).then(profSnap => {
              if (profSnap.exists()) {
                setProfiles(prev => ({
                  ...prev,
                  [job.uid]: profSnap.data().billingAddress?.fullAddress || '',
                }));
              }
            });
          }
          // Default Shipping Address
          if (job.shippingChoice === 'default' && !shipData[job.uid]) {
            getDoc(doc(db, 'shipping', job.uid)).then(shipSnap => {
              if (shipSnap.exists()) {
                setShipData(prev => ({
                  ...prev,
                  [job.uid]: shipSnap.data().contextAddress?.fullAddress || '',
                }));
              }
            });
          }
        });
      },
      error => {
        console.error('Error fetching jobs:', error);
      }
    );

    return () => jobsUnsub();
  }, [profiles, shipData]);

  const showHover = address => {
    clearTimeout(hoverTimeoutRef.current);
    setHoverAddress(address);
    setHoverVisible(true);
  };

  const hideHoverWithDelay = () => {
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoverVisible(false);
    }, 5000);
  };

  const handlePay = async job => {
    try {
      await updateDoc(doc(db, 'jobs', job.id), { status: 'Paid' });
    } catch (e) {
      console.error('Payment failed:', e);
    }
  };

  const handleDelete = async job => {
    try {
      await deleteDoc(doc(db, 'jobs', job.id));
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const calculateTotalPrice = job => {
    const pQuote  = job.printingQuote;
    const ppQuote = job.postProcessingQuote;
    const sQuote  = job.shippingQuote;
    if (
      typeof pQuote === 'number' &&
      typeof ppQuote === 'number' &&
      typeof sQuote === 'number'
    ) {
      return (pQuote + ppQuote + sQuote).toFixed(2);
    }
    return 'Pending';
  };

  const calculateTotalTime = job => {
    const pTime  = job.printTime;
    const ppTime = job.postProcessingTime;
    if (
      typeof pTime === 'number' &&
      typeof ppTime === 'number'
    ) {
      const totalMin = pTime + ppTime;
      const hrs = Math.floor(totalMin / 60);
      const mins = totalMin % 60;
      return `${hrs}h ${mins}m`;
    }
    return 'Pending';
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Job Status</h2>
      <table className="job-status-table">
        <thead>
          <tr>
            <th>Job Card Number</th>
            <th>Material</th>
            <th>Color</th>
            <th>Finish</th>
            <th>Post-Processing</th>
            <th>Print Quality</th>
            <th>Billing Address</th>
            <th>Shipping Address</th>
            <th>File Uploaded</th>
            <th>Processing Status</th>
            <th>Print Time</th>
            <th>Printing Quote</th>
            <th>Post-Processing Time</th>
            <th>Post-Processing Quote</th>
            <th>Shipping Time</th>
            <th>Shipping Quote</th>
            <th>Total Price</th>
            <th>Total Processing Time</th>
            <th>Pay</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map(job => {
            const billingFull   = profiles[job.uid] || 'Fetching...';
            const defaultShip    = shipData[job.uid] || 'Fetching...';
            const customShipFull = job.customShippingAddress?.fullAddress || '';
            const shippingFull   =
              job.shippingChoice === 'default'
                ? defaultShip
                : customShipFull;
            const isQuotedOrBeyond = job.status === 'Quoted' || job.status === 'Paid' || job.status === 'Printing' || job.status === 'Post-Processing' || job.status === 'Packing' || job.status === 'Shipped';
            const hasAllQuotes = 
              typeof job.printingQuote === 'number' &&
              typeof job.postProcessingQuote === 'number' &&
              typeof job.shippingQuote === 'number';
            const payEnabled =
              job.status === 'Quoted' &&
              hasAllQuotes &&
              job.status !== 'Rejected';
            return (
              <tr key={job.id}>
                <td>{job.jobCardNumber}</td>
                <td>{job.material}</td>
                <td>{job.color}</td>
                <td>{job.finish}</td>
                <td>{job.postProcessing}</td>
                <td>{job.printQuality}</td>
                <td
                  onMouseEnter={() => showHover(billingFull)}
                  onMouseLeave={hideHoverWithDelay}
                  style={{ position: 'relative', cursor: 'pointer' }}
                >
                  As per Profile
                  {hoverVisible && hoverAddress === billingFull && (
                    <div className="address-hover-popup">
                      {billingFull}
                    </div>
                  )}
                </td>
                <td
                  onMouseEnter={() => showHover(shippingFull)}
                  onMouseLeave={hideHoverWithDelay}
                  style={{ position: 'relative', cursor: 'pointer' }}
                >
                  {job.shippingChoice === 'default' ? 'Default' : 'Custom'}
                  {hoverVisible && hoverAddress === shippingFull && (
                    <div className="address-hover-popup">
                      {shippingFull}
                    </div>
                  )}
                </td>
                <td>
                  {job.fileUrl ? (
                    <a href={job.fileUrl} download>
                      {job.fileName}
                    </a>
                  ) : (
                    job.fileName
                  )}
                </td>
                <td>{job.status}</td>
                <td>
                  {typeof job.printTime === 'number'
                    ? `${job.printTime} min (est.)`
                    : 'Pending'}
                </td>
                <td>
                  {typeof job.printingQuote === 'number'
                    ? `$${job.printingQuote.toFixed(2)}`
                    : 'Pending'}
                </td>
                <td>
                  {typeof job.postProcessingTime === 'number'
                    ? `${job.postProcessingTime} min (est.)`
                    : 'Pending'}
                </td>
                <td>
                  {typeof job.postProcessingQuote === 'number'
                    ? `$${job.postProcessingQuote.toFixed(2)}`
                    : 'Pending'}
                </td>
                <td>
                  {typeof job.shippingTime === 'string'
                    ? job.shippingTime
                    : 'Pending'}
                </td>
                <td>
                  {typeof job.shippingQuote === 'number'
                    ? `$${job.shippingQuote.toFixed(2)}`
                    : 'Pending'}
                </td>
                <td>{calculateTotalPrice(job)}</td>
                <td>{calculateTotalTime(job)}</td>
                <td>
                  <button
                    className="form-button"
                    disabled={!payEnabled}
                    onClick={() => handlePay(job)}
                  >
                    {payEnabled ? 'Pay' : 'Pay'}
                  </button>
                </td>
                <td>
                  {job.status !== 'Paid' ? (
                    <button
                      className="form-button"
                      onClick={() => handleDelete(job)}
                    >
                      Delete
                    </button>
                  ) : (
                    <span style={{ color: '#666' }}>—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

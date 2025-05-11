import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Papa from 'papaparse';

const AdminPanel = () => {
  const [jobs, setJobs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [shippingAddresses, setShippingAddresses] = useState({});
  const [markup, setMarkup] = useState(1.2);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [materials, setMaterials] = useState([]);
  const [colors, setColors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobSnap = await getDocs(collection(db, 'jobs'));
        setJobs(jobSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const orderSnap = await getDocs(collection(db, 'orders'));
        setOrders(orderSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const userSnap = await getDocs(collection(db, 'users'));
        const userList = userSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setUsers(userList);

        const pricingRef = doc(db, 'settings', 'pricing');
        const pricingSnap = await getDoc(pricingRef);
        if (pricingSnap.exists()) {
          setMaterials(pricingSnap.data().availableMaterials || []);
          setColors(pricingSnap.data().availableColors || []);
        }

        const markupRef = doc(db, 'settings', 'markupSettings');
        const markupSnap = await getDoc(markupRef);
        if (markupSnap.exists()) {
          setMarkup(markupSnap.data().markup || 1.2);
        }

        const addresses = {};
        for (const user of userList) {
          const shippingDoc = await getDoc(doc(db, 'shipping', user.id));
          if (shippingDoc.exists()) {
            addresses[user.id] = shippingDoc.data();
          }
        }
        setShippingAddresses(addresses);

        const currentUser = auth.currentUser;
        if (currentUser) {
          const token = await currentUser.getIdTokenResult();
          setIsAdmin(!!token.claims.admin);
          setUserEmail(currentUser.email);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const updateJobStatus = async (jobId, status) => {
    try {
      await updateDoc(doc(db, 'jobs', jobId), { status });
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status } : j));
    } catch (error) {
      console.error("Error updating job status:", error);
    }
  };

  const updateShippingAddress = async (jobId, newAddress) => {
    try {
      await updateDoc(doc(db, 'jobs', jobId), { shippingAddress: newAddress });
      setJobs(jobs.map(j => j.id === jobId ? { ...j, shippingAddress: newAddress } : j));
    } catch (error) {
      console.error("Error updating shipping address:", error);
    }
  };

  const updateMarkup = async () => {
    try {
      await updateDoc(doc(db, 'settings', 'markupSettings'), { markup });
      alert('Markup updated successfully.');
    } catch (error) {
      console.error("Error updating markup:", error);
    }
  };

  const exportToCSV = () => {
    const data = jobs.map(job => ({
      fileName: job.fileName,
      status: job.status,
      shippingAddress: job.shippingAddress || 'N/A',
      baseCost: job.cost,
      adjustedCost: (job.cost * markup).toFixed(2),
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jobs_history.csv';
    a.click();
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      alert('Logged out successfully.');
      window.location.href = '/';
    }).catch(error => console.error("Logout error:", error));
  };

  return (
    <div>
      <h2>Admin Panel - Logged in as {userEmail}</h2>

      <div>
        <label>
          Markup (%):
          <input
            type="number"
            value={markup * 100}
            onChange={e => setMarkup(e.target.value / 100)}
            step="0.1"
            min="1.0"
            max="100.0"
          />
        </label>
        <button onClick={updateMarkup}>Save Markup</button>
      </div>

      <button onClick={handleLogout}>Logout</button>
      <button onClick={exportToCSV}>Export Jobs to CSV</button>

      <h3>Jobs</h3>
      <ul>
        {jobs.map(job => (
          <li key={job.id}>
            <p><strong>File Name:</strong> {job.fileName}</p>
            <p><strong>Status:</strong> {job.status}</p>

            {/* ✅ CHANGE: Display address stacked vertically */}
            <p><strong>Shipping Address:</strong></p>
            {shippingAddresses[job.uid] ? (
              <div style={{ paddingLeft: '1rem' }}>
                <div>{shippingAddresses[job.uid].address}</div>
                <div>{shippingAddresses[job.uid].suburb}</div>
                <div>{shippingAddresses[job.uid].city}</div>
                <div>{shippingAddresses[job.uid].zip}</div>
                <div>{shippingAddresses[job.uid].country}</div>
              </div>
            ) : (
              <p>N/A</p>
            )}

            <p><strong>Cost:</strong> {job.cost}</p>
            <p><strong>Adjusted Cost:</strong> {(job.cost * markup).toFixed(2)}</p>
            <button onClick={() => updateJobStatus(job.id, 'Processing')}>Start Processing</button>
            <button onClick={() => updateJobStatus(job.id, 'Shipped')}>Mark as Shipped</button>
            <button onClick={() => updateShippingAddress(job.id, prompt('New Shipping Address:', job.shippingAddress))}>Update Shipping Address</button>
          </li>
        ))}
      </ul>

      <h3>Orders</h3>
      <ul>
        {orders.map(order => (
          <li key={order.id}>
            <p><strong>Material:</strong> {order.material}</p>
            <p><strong>Color:</strong> {order.color}</p>
            <p><strong>Cost:</strong> {order.cost}</p>
            <p><strong>File URL:</strong> <a href={order.fileUrl} target="_blank" rel="noopener noreferrer">View File</a></p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>User ID:</strong> {order.userId}</p>
          </li>
        ))}
      </ul>

      <h3>Users</h3>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Admin:</strong> {user.isAdmin ? 'Yes' : 'No'}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;

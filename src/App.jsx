// ✅ FILE: src/App.jsx

import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate
} from 'react-router-dom';
import { auth, db } from './firebase';
import { onAuthStateChanged, getIdTokenResult, signOut } from 'firebase/auth';

// Client components
import AuthPage               from './components/AuthPage';
import UploadForm             from './components/UploadForm';
import ShippingForm           from './components/ShippingForm';
import Profile                from './components/Profile';
import UploadStatus           from './components/UploadStatus';
import NotFound               from './components/NotFound';

// Admin components
import AdminPanel             from './components/AdminPanel';
import AdminUserProfileViewer from './components/AdminUserProfileViewer';
import PricingManager         from './components/PricingManager';
import InventoryManager       from './components/InventoryManager';

function App() {
  const [user, setUser]     = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async u => {
      if (u) {
        setUser(u);
        const token = await getIdTokenResult(u);
        setIsAdmin(!!token.claims.admin);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });
  }, []);

  const handleSignOut = () => signOut(auth).catch(console.error);

  if (!user) {
    return <AuthPage />;
  }

  return (
    <Router>
      <div className="App" style={{ padding: '1rem' }}>
        <button onClick={handleSignOut} className="form-button">Sign Out</button>

        {isAdmin && (
          <nav className="admin-nav" style={{ margin: '1rem 0' }}>
            <Link to="/admin">Dashboard</Link> |{' '}
            <Link to="/admin/jobs">Jobs</Link> |{' '}
            <Link to="/admin/orders">Orders</Link> |{' '}
            <Link to="/admin/users">Users</Link> |{' '}
            <Link to="/admin/shipping">Shipping</Link> |{' '}
            <Link to="/admin/pricing">Pricing</Link> |{' '}
            <Link to="/admin/inventory">Inventory</Link>
          </nav>
        )}

        {!isAdmin && (
          <nav style={{ margin: '1rem 0' }}>
            <Link to="/client/profile">Profile</Link> |{' '}
            <Link to="/client/upload">Upload</Link> |{' '}
            <Link to="/client/shipping">Shipping</Link> |{' '}
            <Link to="/client/status">Status</Link> |{' '}
            <Link to="/client/orders">Orders</Link>
          </nav>
        )}

        <Routes>
          {/* Admin Views */}
          {isAdmin && (
            <>
              <Route path="/admin"            element={<AdminPanel />} />
              <Route path="/admin/jobs"       element={<AdminPanel />} />
              <Route path="/admin/orders"     element={<AdminPanel />} />
              <Route path="/admin/users"      element={<AdminUserProfileViewer />} />
              <Route path="/admin/shipping"   element={<AdminUserProfileViewer />} />
              <Route path="/admin/pricing"    element={<PricingManager />} />
              <Route path="/admin/inventory"  element={<InventoryManager />} />
              <Route path="*"                  element={<Navigate to="/admin" />} />
            </>
          )}

          {/* Client Views */}
          {!isAdmin && (
            <>
              <Route path="/client/profile" element={<Profile />} />
              <Route path="/client/upload"  element={<UploadForm />} />
              <Route path="/client/shipping" element={<ShippingForm />} />
              <Route path="/client/status"  element={<UploadStatus />} />
              <Route path="/client/orders"  element={<NotFound />} />
              <Route path="/"                element={<Navigate to="/client/profile" />} />
              <Route path="*"                element={<NotFound />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;

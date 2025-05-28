// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged, getIdTokenResult, signOut } from 'firebase/auth';
import InventoryManager         from './components/InventoryManager';

// Components
import AuthPage                  from './components/AuthPage';
import UploadForm                from './components/UploadForm';
import ShippingForm              from './components/ShippingForm';
import UploadStatus              from './components/UploadStatus';
import Orders                    from './components/Orders';                // ← here
import AdminPanel                from './components/AdminPanel';
import AdminUserProfileViewer    from './components/AdminUserProfileViewer';
import PricingManager            from './components/PricingManager';
import Profile                   from './components/Profile';
import NotFound                  from './components/NotFound';

function App() {
  const [user, setUser]       = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      if (u) {
        setUser(u);
        const tokenResult = await getIdTokenResult(u);
        setIsAdmin(!!tokenResult.claims.admin);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });
    return unsub;
  }, []);

  const handleSignOut = () => signOut(auth).catch(console.error);

  if (!user) {
    return <AuthPage />;
  }

  return (
    <Router>
      <div className="App" style={{ padding: '1rem' }}>
        <button onClick={handleSignOut}>Sign Out</button>

        {/* Admin Navigation */}
        {isAdmin && (
          <nav style={{ margin: '1rem 0' }}>
            <Link to="/admin">Admin Dashboard</Link> |{' '}
            <Link to="/admin/users">User Profiles</Link> |{' '}
            <Link to="/admin/pricing">Pricing Manager</Link>
          </nav>
        )}

        {/* Client Navigation */}
        {!isAdmin && (
          <nav style={{ margin: '1rem 0' }}>
            <Link to="/client/profile">Profile</Link> |{' '}
            <Link to="/client/shipping">Shipping</Link> |{' '}
            <Link to="/client/upload">Upload</Link> |{' '}
            <Link to="/client/status">Status</Link> |{' '} 
            <Link to="/client/orders">Orders</Link>
          </nav>
        )}

        <Routes>
          {/* Admin Views */}
          {isAdmin && (
            <>
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/admin/users" element={<AdminUserProfileViewer />} />
              <Route path="/admin/pricing" element={<PricingManager />} />
	      <Route path="/admin/inventory" element={<InventoryManager />} />
              <Route path="*" element={<Navigate to="/admin" />} />
            </>
          )}

          {/* Client Views */}
          {!isAdmin && (
            <>
              <Route path="/client/profile" element={<Profile />} />
              <Route path="/client/upload" element={<UploadForm />} />
              <Route path="/client/orders" element={<Orders />} />         {/* ← here */}
              <Route path="/client/shipping" element={<ShippingForm />} />
              <Route path="/client/status" element={<UploadStatus />} />
              <Route path="/" element={<Navigate to="/client/profile" />} />
              <Route path="*" element={<NotFound />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;

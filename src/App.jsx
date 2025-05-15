// src/App.jsx
import React from 'react';

// —– Your existing page components
import AuthPage        from './components/AuthPage';
import UploadForm      from './components/UploadForm';
import ShippingForm    from './components/ShippingForm';
import PricingManager  from './components/PricingManager';
import AdminPanel      from './components/AdminPanel';

function App() {
  return (
    <div className="App" style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Replicon Industries Platform</h1>

      <section style={{ margin: '2rem 0' }}>
        <h2>1. Authentication</h2>
        <AuthPage />
      </section>

      <section style={{ margin: '2rem 0' }}>
        <h2>2. File Upload</h2>
        <UploadForm />
      </section>

      <section style={{ margin: '2rem 0' }}>
        <h2>3. Shipping Details</h2>
        <ShippingForm />
      </section>

      <section style={{ margin: '2rem 0' }}>
        <h2>4. Cost & Filament Management</h2>
        <PricingManager />
      </section>

      <section style={{ margin: '2rem 0' }}>
        <h2>5. Admin Dashboard</h2>
        <AdminPanel />
      </section>
    </div>
  );
}

export default App;

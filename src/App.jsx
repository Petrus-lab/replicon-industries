// src/App.jsx
import React, { useState } from 'react';
import AuthPage from './AuthPage';
import UploadForm from './UploadForm';
import ShippingForm from './ShippingForm';
import AdminPanel from './AdminPanel';
import PricingManager from './PricingManager';
import Checkout from './Checkout';        // ← added import

function App() {
  const [paypalEnabled, setPaypalEnabled] = useState(true);  // ← added toggle

  return (
    <div className="App">
      {/* …your existing routes / layout… */}

      {/* Example: show checkout after user selects amount */}
      <Checkout amount="10.00" paypalEnabled={paypalEnabled} />

      {/* You can add a real toggle switch to flip paypalEnabled */}
    </div>
  );
}

export default App;

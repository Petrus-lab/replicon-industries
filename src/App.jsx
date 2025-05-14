// src/App.jsx
import React, { useState } from 'react';

// —– UPDATED import paths to point inside components/ —–
import AuthPage        from './components/AuthPage';
import UploadForm      from './components/UploadForm';
import ShippingForm    from './components/ShippingForm';
import AdminPanel      from './components/AdminPanel';
import PricingManager  from './components/PricingManager';

// Checkout remains in src/
import Checkout        from './Checkout';

function App() {
  // —– added toggle for PayPal enable/disable —–
  const [paypalEnabled, setPaypalEnabled] = useState(true);

  return (
    <div className="App">
      {/* …your existing routes/layout… */}

      {/* Example: show checkout after user selects amount */}
      <Checkout amount="10.00" paypalEnabled={paypalEnabled} />
    </div>
  );
}

export default App;

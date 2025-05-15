// src/App.jsx
-import React, { useState } from 'react';
+import React, { useState } from 'react';

 // —– import your components
 import AuthPage        from './components/AuthPage';
 import UploadForm      from './components/UploadForm';
 import ShippingForm    from './components/ShippingForm';
 import AdminPanel      from './components/AdminPanel';
 import PricingManager  from './components/PricingManager';
-import Checkout        from './Checkout';

 function App() {
-  // —– added toggle for PayPal enable/disable —–
-  const [paypalEnabled, setPaypalEnabled] = useState(true);
+  // —– disable PayPal payments for now —–
+  const [paypalEnabled] = useState(false);

   return (
     <div className="App">
       {/* …your existing routes/layout… */}

-      {/* Example: show checkout after user selects amount */}
-      <Checkout amount="10.00" paypalEnabled={paypalEnabled} />
+      {/* Payments are disabled for now */}
+      {/*
+        paypalEnabled && (
+          <Checkout amount="10.00" paypalEnabled={paypalEnabled} />
+        )
+      */}

       {/* rest of your app… */}
     </div>
   );
 }

 export default App;


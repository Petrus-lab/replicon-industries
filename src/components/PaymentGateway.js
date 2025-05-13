// ✅ FILE: src/components/PaymentGateway.jsx

import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

// ✅ Optionally uncomment when implementing Stripe in the future
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements } from '@stripe/react-stripe-js';

// ✅ PayPal Client ID from environment or fallback to placeholder
const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID || 'your-paypal-client-id';

// ✅ Stripe public key (future support)
// const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'your-stripe-public-key');

function PaymentGateway() {
  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>💳 Payment Options</h2>

      {/* ✅ PayPal Integration */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>Pay with PayPal</h3>
        <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID }}>
          <PayPalButtons
            style={{ layout: 'vertical' }}
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [{
                  amount: {
                    value: '10.00', // ✅ Replace with dynamic value in the future
                  },
                }],
              });
            }}
            onApprove={(data, actions) => {
              return actions.order.capture().then(details => {
                alert(`✅ Payment completed by ${details.payer.name.given_name}`);
              });
            }}
            onError={(err) => {
              console.error('❌ PayPal Error:', err);
              alert('❌ Payment failed. See console for details.');
            }}
          />
        </PayPalScriptProvider>
      </div>

      {/* ✅ Stripe Support (Coming Soon) */}
      {/*
      <div>
        <h3>Pay with Stripe</h3>
        <Elements stripe={stripePromise}>
          <StripeCheckout />  // Implement StripeCheckout component when ready
        </Elements>
      </div>
      */}
    </div>
  );
}

export default PaymentGateway;

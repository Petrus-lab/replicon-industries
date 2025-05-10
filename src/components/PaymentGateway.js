// Path: src/components/PaymentGateway.js

import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('your-stripe-public-key'); // Replace with your Stripe public key

const PaymentGateway = () => {
  return (
    <div>
      {/* PayPal */}
      <PayPalScriptProvider options={{ "client-id": "your-paypal-client-id" }}>
        <PayPalButtons />
      </PayPalScriptProvider>

      {/* Stripe */}
      <Elements stripe={stripePromise}>
        <StripeCheckout />
      </Elements>
    </div>
  );
};

export default PaymentGateway;

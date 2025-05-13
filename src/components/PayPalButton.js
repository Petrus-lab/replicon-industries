// ✅ FILE: src/components/PayPalButton.jsx

import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

// ✅ Reads PayPal Client ID from environment variable or fallback placeholder
const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID || 'your-paypal-client-id';

const PayPalButtonComponent = ({ jobId, amount = '50.00', description = 'Replicon Industries Order' }) => {

  const updatePaymentStatus = async (jobId, status) => {
    try {
      const jobDoc = doc(db, 'jobs', jobId);
      await updateDoc(jobDoc, { paymentStatus: status });
      console.log(`✅ Payment status updated for job ${jobId} to "${status}".`);
    } catch (error) {
      console.error(`❌ Failed to update payment status for job ${jobId}:`, error);
    }
  };

  return (
    <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID, "currency": "USD" }}>
      <PayPalButtons
        style={{ layout: 'vertical' }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: { value: amount },
              description: description,
            }],
          });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then((details) => {
            alert(`✅ Transaction completed by ${details.payer.name.given_name}`);
            updatePaymentStatus(jobId, 'Paid');
          });
        }}
        onError={(err) => {
          console.error('❌ PayPal Error:', err);
          alert('❌ There was an error processing your payment.');
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalButtonComponent;

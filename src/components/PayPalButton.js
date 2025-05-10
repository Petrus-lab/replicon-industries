// Path: src/components/PayPalButton.js

import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { db } from '../firebase'; // Import Firestore database
import { doc, updateDoc } from 'firebase/firestore';

const PayPalButtonComponent = ({ jobId }) => {
  const updatePaymentStatus = async (jobId, status) => {
    const jobDoc = doc(db, 'jobs', jobId);
    await updateDoc(jobDoc, { paymentStatus: status });
  };

  return (
    <PayPalScriptProvider options={{ "client-id": "AXXQSc4zl-3p4f_L2GIf-osWPBLX5vtAmABoz33lVj2NuiSug7n0LtIhvFjGyW0Y2oGKkujK7TwHvC-p", "currency": "USD" }}>
      <PayPalButtons
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: '50.00', // Replace with the actual order amount
              },
              description: 'Replicon Industries Order',
            }],
          });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then((details) => {
            alert('Transaction completed by ' + details.payer.name.given_name);
            updatePaymentStatus(jobId, 'Paid');
          });
        }}
        onError={(err) => {
          console.error('PayPal error: ', err);
          alert('There was an error processing your payment.');
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalButtonComponent;

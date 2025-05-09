import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

const PayPalButtonComponent = () => {
  return (
    <PayPalScriptProvider options={{ "client-id": "AXXQSc4zl-3p4f_L2GIf-osWPBLX5vtAmABoz33lVj2NuiSug7n0LtIhvFjGyW0Y2oGKkujK7TwHvC-p", "currency": "ZAR" }}>
      <PayPalButtons
        style={{ layout: 'vertical' }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: '50.00', // Replace with the total amount to be charged
                },
                description: 'Replicon Industries Order', // Add any description if needed
              },
            ],
          });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then((details) => {
            alert('Transaction completed by ' + details.payer.name.given_name);
            // Optionally, update the order status here in your app's backend
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

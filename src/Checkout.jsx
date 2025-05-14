// src/Checkout.jsx
import React, { useEffect } from 'react';

export default function Checkout({ amount, paypalEnabled }) {
  useEffect(() => {
    if (!paypalEnabled) return;

    // Dynamically load PayPal SDK
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.REACT_APP_PAYPAL_CLIENT_ID}&currency=USD`;
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      // Determine base URL for our create-order endpoint:
      // 1) Use the env var if set (in Vercel)
      // 2) Fallback to the known Cloud Function URL directly
      const baseUrl =
        process.env.REACT_APP_PAYPAL_FUNCTION_URL ||
        'https://us-central1-replicon-industries.cloudfunctions.net/paypal';

      window.paypal.Buttons({
        // Server-side order creation
        createOrder: () => {
          return fetch(`${baseUrl}/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount }),
          })
            .then(res => {
              if (!res.ok) {
                throw new Error(`Create-order failed: ${res.status}`);
              }
              return res.json();
            })
            .then(data => data.id);
        },

        // Capture payment on approval
        onApprove: (data, actions) => {
          return actions.order.capture().then(details => {
            console.log('Payment successful:', details);
            // TODO: post-payment handling (update Firestore, UI, etc.)
          });
        },

        onError: err => {
          console.error('PayPal Buttons error:', err);
        },
      }).render('#paypal-button-container');
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [paypalEnabled, amount]);

  return <div id="paypal-button-container" />;
}

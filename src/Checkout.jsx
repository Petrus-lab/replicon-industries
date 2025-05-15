// src/Checkout.jsx
import React, { useEffect } from 'react';

export default function Checkout({ amount, paypalEnabled }) {
  useEffect(() => {
    if (!paypalEnabled) return;

    // Load PayPal SDK
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.REACT_APP_PAYPAL_CLIENT_ID}&currency=USD`;
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.paypal.Buttons({
        // Call our Vercel API instead of Firebase
        createOrder: () => {
          return fetch('/api/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount }),
          })
            .then(res => {
              if (!res.ok) throw new Error(`Error ${res.status}`);
              return res.json();
            })
            .then(data => data.id);
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then(details => {
            console.log('Payment successful:', details);
            // TODO: update your DB/UI here
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

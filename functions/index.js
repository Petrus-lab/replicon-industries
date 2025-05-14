// functions/index.js  
const functions = require('firebase-functions');
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();

// Enable CORS so your React app (on Vercel) can call it:
app.use(cors({ origin: true }));
app.use(express.json());

/**
 * Helper: fetch OAuth2 token from PayPal sandbox
 */
async function getAccessToken() {
  const response = await fetch(
    'https://api.sandbox.paypal.com/v1/oauth2/token', 
    {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' +
          Buffer.from(
            `${process.env.REACT_APP_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
          ).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    }
  );
  const json = await response.json();
  return json.access_token;
}

/**
 * POST /create-order
 * Expects JSON body: { amount: string }
 * Returns: { id: <PayPal Order ID> }
 */
app.post('/create-order', async (req, res) => {
  try {
    const token = await getAccessToken();
    const orderResponse = await fetch(
      'https://api.sandbox.paypal.com/v2/checkout/orders',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: 'USD',
              value: req.body.amount,
            },
          }],
        }),
      }
    );
    const order = await orderResponse.json();
    res.status(200).json({ id: order.id });
  } catch (error) {
    console.error('PayPal create-order error:', error);
    res.status(500).json({ error: 'Unable to create order' });
  }
});

// Export as a single Cloud Function
exports.paypal = functions.https.onRequest(app);

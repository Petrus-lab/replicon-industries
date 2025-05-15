// functions/index.js
const functions = require('firebase-functions');
const express   = require('express');
const fetch     = require('node-fetch');
const cors      = require('cors');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Safely pull PayPal creds from runtime config
const { client_id: clientId, client_secret: secret } = functions.config().paypal || {};
if (!clientId || !secret) {
  console.error(
    '⚠️  PayPal credentials missing! ' +
    'Run: firebase functions:config:set ' +
    'paypal.client_id="YOUR_CLIENT_ID" ' +
    'paypal.client_secret="YOUR_SECRET"'
  );
}

async function getAccessToken() {
  if (!clientId || !secret) {
    throw new Error('Missing PayPal credentials in functions.config().paypal');
  }

  const resp = await fetch(
    'https://api.sandbox.paypal.com/v1/oauth2/token',
    {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' +
          Buffer.from(`${clientId}:${secret}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    }
  );

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Token fetch failed (${resp.status}): ${text}`);
  }
  return (await resp.json()).access_token;
}

app.post('/create-order', async (req, res) => {
  try {
    const token = await getAccessToken();
    const orderRes = await fetch(
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
            amount: { currency_code: 'USD', value: req.body.amount },
          }],
        }),
      }
    );

    if (!orderRes.ok) {
      const text = await orderRes.text();
      throw new Error(`Order create failed (${orderRes.status}): ${text}`);
    }

    const order = await orderRes.json();
    res.status(200).json({ id: order.id });
  } catch (err) {
    console.error('PayPal create-order error:', err);
    res.status(500).json({ error: err.message || 'Unable to create order' });
  }
});

exports.paypal = functions.https.onRequest(app);

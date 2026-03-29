/**
 * Vercel Serverless Function: Create Stripe Checkout Session
 *
 * POST /api/create-checkout
 * Body: { priceId: "price_xxx", planName: "pro", billingCycle: "monthly"|"annual", customerEmail: "..." }
 *
 * Environment Variables (set in Vercel Dashboard):
 *   STRIPE_SECRET_KEY  — sk_live_xxx or sk_test_xxx
 *
 * Returns: { url: "https://checkout.stripe.com/..." }
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const ALLOWED_ORIGINS = [
  'https://www.subcontractors.ai',
  'https://subcontractors.ai',
  'http://localhost:3000',
  'http://localhost:5500',
];

function getCorsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

module.exports = async (req, res) => {
  const origin = req.headers.origin || '';
  const cors = getCorsHeaders(origin);
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate Stripe key is configured
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.' });
  }

  try {
    const { priceId, planName, billingCycle, customerEmail } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'priceId is required' });
    }

    // Build checkout session params
    const sessionParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: 'https://www.subcontractors.ai/app/dashboard.html?upgraded=true&plan=' + (planName || 'pro'),
      cancel_url: 'https://www.subcontractors.ai/pricing.html?canceled=true',
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      metadata: {
        plan: planName || 'unknown',
        billing_cycle: billingCycle || 'monthly',
      },
    };

    // Add trial period for new subscriptions
    if (planName !== 'enterprise') {
      sessionParams.subscription_data = {
        trial_period_days: 14,
        metadata: {
          plan: planName || 'unknown',
        },
      };
    }

    // Pre-fill email if provided
    if (customerEmail) {
      sessionParams.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Stripe Checkout Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

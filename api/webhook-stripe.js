/**
 * Vercel Serverless Function: Stripe Webhook Handler
 *
 * POST /api/webhook-stripe
 *
 * Handles Stripe subscription events and updates user profile in Supabase.
 *
 * Environment Variables:
 *   STRIPE_SECRET_KEY       — sk_live_xxx or sk_test_xxx
 *   STRIPE_WEBHOOK_SECRET   — whsec_xxx
 *   SUPABASE_URL            — https://xxx.supabase.co
 *   SUPABASE_SERVICE_KEY    — eyJxxx (service role key, NOT anon key)
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Vercel raw body helper
module.exports.config = { api: { bodyParser: false } };

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).json({ error: 'Missing signature or webhook secret' });
  }

  let event;
  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // Supabase admin client (service role)
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  async function updateProfile(email, updates) {
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('Supabase not configured — skipping profile update');
      return;
    }

    // Find user by email via Supabase auth admin API
    const findResp = await fetch(`${supabaseUrl}/auth/v1/admin/users?filter=email%3Deq.${encodeURIComponent(email)}`, {
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
      }
    });

    // Update profiles table
    const updateResp = await fetch(`${supabaseUrl}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        ...updates,
        updated_at: new Date().toISOString(),
      }),
    });

    if (!updateResp.ok) {
      console.error('Failed to update profile:', await updateResp.text());
    }
  }

  try {
    const obj = event.data.object;

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = obj;
        const email = session.customer_email || session.customer_details?.email;
        const plan = session.metadata?.plan || 'pro';
        if (email) {
          await updateProfile(email, {
            subscription_status: 'trial',
            subscription_plan: plan,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = obj;
        const status = sub.status; // active, trialing, past_due, canceled, etc.
        let mappedStatus = 'active';
        if (status === 'trialing') mappedStatus = 'trial';
        else if (status === 'past_due') mappedStatus = 'past_due';
        else if (status === 'canceled' || status === 'unpaid') mappedStatus = 'cancelled';
        else if (status === 'active') mappedStatus = 'active';

        // Get customer email
        const customer = await stripe.customers.retrieve(sub.customer);
        if (customer.email) {
          await updateProfile(customer.email, {
            subscription_status: mappedStatus,
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = obj;
        const customer = await stripe.customers.retrieve(sub.customer);
        if (customer.email) {
          await updateProfile(customer.email, {
            subscription_status: 'cancelled',
            subscription_plan: 'free',
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = obj;
        if (invoice.customer_email) {
          await updateProfile(invoice.customer_email, {
            subscription_status: 'past_due',
          });
        }
        break;
      }

      default:
        // Unhandled event type
        break;
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
};

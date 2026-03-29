# Subcontractors.ai — Setup Guide

## What Was Built

### Stripe Payments Integration
- **Pricing page** now has a monthly/annual billing toggle (20% annual discount)
- Buttons call `/api/create-checkout` serverless function which creates a Stripe Checkout Session
- After payment, Stripe webhook updates user's subscription status in Supabase
- Settings page shows current subscription status dynamically
- Graceful fallback: if Stripe isn't configured yet, users are redirected to signup with a "coming soon" message

### AI Bid Assistant Backend
- `/api/bid-assistant` serverless function calls OpenAI GPT-4o-mini
- Returns structured JSON: scope items, cost estimates (low/mid/high + breakdown), risk flags, timeline, and strategic recommendations
- Frontend tries real AI first, falls back to local simulation if the endpoint isn't configured
- Cost-efficient: GPT-4o-mini at ~$0.15/1M input tokens

### Stripe Webhook Handler
- `/api/webhook-stripe` processes subscription lifecycle events
- Handles: checkout completed, subscription updated/deleted, payment failed
- Updates `profiles` table in Supabase with subscription status

---

## Environment Variables to Set in Vercel

Go to: **Vercel Dashboard > subcontractors-ai > Settings > Environment Variables**

### Required for Stripe Payments:
```
STRIPE_SECRET_KEY = sk_test_xxxxx       (from Stripe Dashboard > Developers > API Keys)
STRIPE_WEBHOOK_SECRET = whsec_xxxxx     (from Stripe Dashboard > Developers > Webhooks)
```

### Required for AI Bid Assistant:
```
OPENAI_API_KEY = sk-xxxxx               (from platform.openai.com/api-keys)
```

### Required for Stripe Webhook (to update Supabase):
```
SUPABASE_URL = https://ljpsfhhcbjvkkuvdpjip.supabase.co
SUPABASE_SERVICE_KEY = eyJxxxxx         (from Supabase > Settings > API > service_role key — NOT the anon key)
```

---

## Stripe Setup Steps

1. **Create Stripe account** at https://stripe.com (if you haven't already)

2. **Create Products in Stripe Dashboard** (Products > Add Product):
   - **Pro Monthly** — $49/month recurring
   - **Pro Annual** — $470/year recurring ($39.17/mo)
   - **Business Monthly** — $149/month recurring
   - **Business Annual** — $1,430/year recurring ($119.17/mo)
   - **Enterprise Monthly** — $399/month recurring
   - **Enterprise Annual** — $3,830/year recurring ($319.17/mo)

3. **Copy Price IDs** (each product gets a `price_xxxx` ID) and paste them into `app/stripe-config.js`

4. **Copy your Publishable Key** (`pk_test_xxxx` or `pk_live_xxxx`) into `app/stripe-config.js`

5. **Set up Webhook** in Stripe Dashboard:
   - Endpoint URL: `https://www.subcontractors.ai/api/webhook-stripe`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
   - Copy the webhook signing secret (`whsec_xxxx`) to Vercel env vars

6. **Add Environment Variables** in Vercel (see above)

7. **Redeploy** — push to GitHub or trigger a redeploy in Vercel

---

## OpenAI Setup Steps

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add it to Vercel as `OPENAI_API_KEY`
4. Add a spending limit (recommended: $20/month to start)
5. The bid assistant uses GPT-4o-mini which costs roughly $0.001 per analysis

---

## Testing

### Test Stripe (use test mode first):
1. Make sure Stripe is in **Test Mode** (toggle in Stripe Dashboard)
2. Use test card: `4242 4242 4242 4242`, any future expiry, any CVC
3. Click "Start 14-Day Free Trial" on the pricing page
4. You should be redirected to Stripe Checkout, then back to dashboard

### Test AI Bid Assistant:
1. Log in to the app
2. Go to Bid Assistant
3. Fill in project details and click Analyze
4. If OPENAI_API_KEY is set, you'll get real AI analysis
5. If not, you'll get the built-in simulation (still useful, just not AI-powered)

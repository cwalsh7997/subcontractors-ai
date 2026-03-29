/**
 * Subcontractors.ai — Stripe Configuration
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a Stripe account at https://stripe.com
 * 2. Get your publishable key from Dashboard > Developers > API Keys
 * 3. Create Products + Prices in Stripe Dashboard:
 *    - Pro: $49/month (recurring)
 *    - Business: $149/month (recurring)
 *    - Enterprise: $399/month (recurring)
 * 4. Replace the placeholder price IDs below with your real Stripe Price IDs
 * 5. Set up a webhook endpoint for subscription events (optional but recommended)
 *
 * For Stripe Checkout (redirect to Stripe-hosted page), you only need the
 * publishable key on the client side. The checkout session is created via
 * a serverless function (see /api/create-checkout.js for Vercel).
 */

window.STRIPE_CONFIG = {
  // Replace with your Stripe publishable key (starts with pk_live_ or pk_test_)
  publishableKey: '',

  // Stripe Price IDs — replace with your actual IDs after creating products in Stripe
  prices: {
    pro_monthly:        '',  // price_xxxxx for Pro $49/mo
    pro_annual:         '',  // price_xxxxx for Pro $470/yr (save ~20%)
    business_monthly:   '',  // price_xxxxx for Business $149/mo
    business_annual:    '',  // price_xxxxx for Business $1,430/yr
    enterprise_monthly: '',  // price_xxxxx for Enterprise $399/mo
    enterprise_annual:  '',  // price_xxxxx for Enterprise $3,830/yr
  },

  // URLs
  successUrl: 'https://www.subcontractors.ai/app/dashboard.html?upgraded=true',
  cancelUrl:  'https://www.subcontractors.ai/pricing.html?canceled=true',

  // Feature flags
  trialDays: 14,  // Free trial period for paid plans
  allowPromoCode: true,
};

/**
 * Check if Stripe is configured
 */
window.isStripeConfigured = function() {
  return window.STRIPE_CONFIG.publishableKey &&
         window.STRIPE_CONFIG.publishableKey.startsWith('pk_');
};

/**
 * Subcontractors.ai — Stripe Configuration
 * Auto-configured with real Stripe test mode keys and price IDs
 */

window.STRIPE_CONFIG = {
  publishableKey: 'pk_test_51TGQ9D24w3pcpuV6EThuTZ6yQduroSvDpop7OHCd4qyzubwr0vxbRudYHoKO2twbHikZbjVuoYGeBZS0pEABH6vl00SrVYIs5d',

  prices: {
    pro_monthly:        'price_1TGSOK24w3pcpuV6mjpWw5HD',
    pro_annual:         'price_1TGSOK24w3pcpuV64HDizpA6',
    business_monthly:   'price_1TGSOL24w3pcpuV6jywQzBxr',
    business_annual:    'price_1TGSOL24w3pcpuV6f4TuKbnr',
    enterprise_monthly: 'price_1TGSOL24w3pcpuV6YTQgRnr4',
    enterprise_annual:  'price_1TGSOL24w3pcpuV6sqdrPrg9',
  },

  successUrl: 'https://www.subcontractors.ai/app/dashboard.html?upgraded=true',
  cancelUrl:  'https://www.subcontractors.ai/pricing.html?canceled=true',

  trialDays: 14,
  allowPromoCode: true,
};

/**
 * Check if Stripe is configured
 */
window.isStripeConfigured = function() {
  return window.STRIPE_CONFIG.publishableKey &&
         window.STRIPE_CONFIG.publishableKey.startsWith('pk_');
};

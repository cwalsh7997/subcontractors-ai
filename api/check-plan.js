/**
 * GET /api/check-plan
 * Returns current user's plan, status, and usage stats.
 * Requires: Authorization: Bearer <supabase_jwt>
 */
const { verifyAuth } = require('./_lib/auth');
const { checkUsage } = require('./_lib/usage');

const ALLOWED_ORIGINS = [
  'https://www.subcontractors.ai',
  'https://subcontractors.ai',
  'http://localhost:3000',
  'http://localhost:5500',
];

module.exports = async (req, res) => {
  const origin = req.headers.origin || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader('Access-Control-Allow-Origin', allowed);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const auth = await verifyAuth(req);

  if (!auth) {
    return res.status(401).json({ error: 'Not authenticated', plan: 'free' });
  }

  const bidUsage = await checkUsage(auth.user.id, 'bid-assistant', auth.plan);

  return res.status(200).json({
    email: auth.user.email,
    plan: auth.plan,
    status: auth.status,
    usage: {
      'bid-assistant': bidUsage,
    },
  });
};

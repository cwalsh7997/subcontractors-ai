/**
 * GET /api/usage
 * Returns usage stats for the current billing period.
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
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const bidUsage = await checkUsage(auth.user.id, 'bid-assistant', auth.plan);

  return res.status(200).json({
    plan: auth.plan,
    currentMonth: {
      start: monthStart.toISOString().split('T')[0],
      end: monthEnd.toISOString().split('T')[0],
    },
    features: {
      'bid-assistant': bidUsage,
    },
  });
};

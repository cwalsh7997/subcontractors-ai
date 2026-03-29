/**
 * /api/dashboard-stats
 * GET: Returns dashboard stats for authenticated user
 * - active_projects: count of projects where status='active'
 * - total_contract_value: sum of contract_value across active projects
 * - bid_analyses_this_month: count from bid_analyses this month
 * - recent_projects: last 5 projects with name, gc_name, contract_value, status, updated_at
 * Requires: Authorization: Bearer <supabase_jwt>
 */

const { verifyAuth } = require('./_lib/auth');

const ALLOWED_ORIGINS = [
  'https://www.subcontractors.ai',
  'https://subcontractors.ai',
  'http://localhost:3000',
  'http://localhost:5500',
];

function setCorsHeaders(req, res) {
  const origin = req.headers.origin || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader('Access-Control-Allow-Origin', allowed);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

async function fetchStats(auth) {
  const stats = {
    active_projects: 0,
    total_contract_value: 0,
    bid_analyses_this_month: 0,
    recent_projects: [],
  };

  try {
    // Fetch active projects count and sum
    const projectsResponse = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/projects?user_id=eq.${auth.user.id}&status=eq.active&select=id,contract_value`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (projectsResponse.ok) {
      const projects = await projectsResponse.json();
      stats.active_projects = projects.length;
      stats.total_contract_value = projects.reduce((sum, p) => sum + (p.contract_value || 0), 0);
    }
  } catch (err) {
    console.warn('Error fetching active projects:', err.message);
  }

  try {
    // Fetch bid analyses this month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    const analysesResponse = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/bid_analyses?user_id=eq.${auth.user.id}&created_at=gte.${monthStart}&created_at=lte.${monthEnd}&select=id`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (analysesResponse.ok) {
      const analyses = await analysesResponse.json();
      stats.bid_analyses_this_month = analyses.length;
    }
  } catch (err) {
    console.warn('Error fetching bid analyses this month:', err.message);
  }

  try {
    // Fetch recent 5 projects
    const recentResponse = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/projects?user_id=eq.${auth.user.id}&select=name,gc_name,contract_value,status,updated_at&order=updated_at.desc&limit=5`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (recentResponse.ok) {
      stats.recent_projects = await recentResponse.json();
    }
  } catch (err) {
    console.warn('Error fetching recent projects:', err.message);
  }

  return stats;
}

module.exports = async (req, res) => {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await verifyAuth(req);
  if (!auth) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const stats = await fetchStats(auth);
    return res.status(200).json(stats);
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

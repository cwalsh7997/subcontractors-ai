/**
 * /api/bid-analyses
 * Saved Bid Analyses CRUD endpoints
 * GET: List user's saved bid analyses (with optional project_id filter)
 * POST: Save a new bid analysis
 * DELETE: Delete a saved analysis
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

async function listAnalyses(req, res, auth) {
  try {
    const { project_id } = req.query;
    let url = `${process.env.SUPABASE_URL}/rest/v1/bid_analyses?user_id=eq.${auth.user.id}&order=created_at.desc`;

    if (project_id) {
      url += `&project_id=eq.${project_id}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch bid analyses' });
    }

    const analyses = await response.json();
    return res.status(200).json(analyses);
  } catch (err) {
    console.error('List analyses error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function saveAnalysis(req, res, auth) {
  const { project_id, project_name, trade, location, building_type, sqft, gc_name, analysis_data, model_used, tokens_used } = req.body;

  if (!project_name) {
    return res.status(400).json({ error: 'Missing required field: project_name' });
  }

  if (!analysis_data) {
    return res.status(400).json({ error: 'Missing required field: analysis_data' });
  }

  const analysis = {
    user_id: auth.user.id,
    project_id: project_id || null,
    project_name,
    trade: trade || null,
    location: location || null,
    building_type: building_type || null,
    sqft: sqft || null,
    gc_name: gc_name || null,
    analysis_data,
    model_used: model_used || null,
    tokens_used: tokens_used || null,
  };

  try {
    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/bid_analyses`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(analysis),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: 'Failed to save analysis', details: errorData });
    }

    const created = await response.json();
    return res.status(201).json(created[0] || created);
  } catch (err) {
    console.error('Save analysis error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteAnalysis(req, res, auth) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing required query parameter: id' });
  }

  // Verify ownership before deleting
  try {
    const checkResponse = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/bid_analyses?id=eq.${id}&select=user_id`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    const analyses = await checkResponse.json();
    if (!analyses.length || analyses[0].user_id !== auth.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
  } catch (err) {
    console.error('Ownership check error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }

  // Perform deletion
  try {
    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/bid_analyses?id=eq.${id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: 'Failed to delete analysis', details: errorData });
    }

    return res.status(204).end();
  } catch (err) {
    console.error('Delete analysis error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = async (req, res) => {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') return res.status(200).end();

  const auth = await verifyAuth(req);
  if (!auth) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  switch (req.method) {
    case 'GET':
      return listAnalyses(req, res, auth);
    case 'POST':
      return saveAnalysis(req, res, auth);
    case 'DELETE':
      return deleteAnalysis(req, res, auth);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
};

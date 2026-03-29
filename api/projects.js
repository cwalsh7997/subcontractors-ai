/**
 * /api/projects
 * Project CRUD endpoints
 * GET: List user's projects
 * POST: Create a new project
 * PATCH: Update a project
 * DELETE: Delete a project
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

async function listProjects(req, res, auth) {
  try {
    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/projects?user_id=eq.${auth.user.id}&select=*&order=updated_at.desc`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch projects' });
    }

    const projects = await response.json();
    return res.status(200).json(projects);
  } catch (err) {
    console.error('List projects error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function createProject(req, res, auth) {
  const { name, trade, gc_name, gc_contact, contract_value, retainage_pct, location, description, status, start_date, end_date, project_number } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Missing required field: name' });
  }

  const project = {
    user_id: auth.user.id,
    name,
    trade: trade || null,
    gc_name: gc_name || null,
    gc_contact: gc_contact || null,
    contract_value: contract_value || null,
    retainage_pct: retainage_pct !== undefined ? retainage_pct : 10,
    location: location || null,
    description: description || null,
    status: status || 'active',
    start_date: start_date || null,
    end_date: end_date || null,
    project_number: project_number || null,
  };

  try {
    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/projects`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(project),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: 'Failed to create project', details: errorData });
    }

    const created = await response.json();
    return res.status(201).json(created[0] || created);
  } catch (err) {
    console.error('Create project error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateProject(req, res, auth) {
  const { id, ...updates } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Missing required field: id' });
  }

  // Verify ownership before updating
  try {
    const checkResponse = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/projects?id=eq.${id}&select=user_id`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    const projects = await checkResponse.json();
    if (!projects.length || projects[0].user_id !== auth.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
  } catch (err) {
    console.error('Ownership check error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }

  // Perform update
  try {
    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/projects?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: 'Failed to update project', details: errorData });
    }

    const updated = await response.json();
    return res.status(200).json(updated[0] || updated);
  } catch (err) {
    console.error('Update project error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteProject(req, res, auth) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing required query parameter: id' });
  }

  // Verify ownership before deleting
  try {
    const checkResponse = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/projects?id=eq.${id}&select=user_id`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    const projects = await checkResponse.json();
    if (!projects.length || projects[0].user_id !== auth.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
  } catch (err) {
    console.error('Ownership check error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }

  // Perform deletion
  try {
    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/projects?id=eq.${id}`,
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
      return res.status(response.status).json({ error: 'Failed to delete project', details: errorData });
    }

    return res.status(204).end();
  } catch (err) {
    console.error('Delete project error:', err);
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
      return listProjects(req, res, auth);
    case 'POST':
      return createProject(req, res, auth);
    case 'PATCH':
      return updateProject(req, res, auth);
    case 'DELETE':
      return deleteProject(req, res, auth);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
};

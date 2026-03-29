/**
 * Usage Tracking Module for Subcontractors.ai
 *
 * Tracks API usage per user per month and enforces plan limits.
 * Gracefully handles missing usage_logs table — allows requests through.
 */

const PLAN_LIMITS = {
  free: { 'bid-assistant': 3 },
  pro: { 'bid-assistant': 50 },
  business: { 'bid-assistant': 200 },
  enterprise: { 'bid-assistant': Infinity },
};

async function checkUsage(userId, feature, plan) {
  const limit = PLAN_LIMITS[plan]?.[feature] ?? PLAN_LIMITS.free[feature] ?? 3;

  // Enterprise = unlimited
  if (limit === Infinity) {
    return { allowed: true, used: 0, limit: Infinity, remaining: Infinity };
  }

  // If no userId (anonymous), use free limits and can't track
  if (!userId) {
    return { allowed: true, used: 0, limit: limit, remaining: limit };
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    // Can't track — allow but with warning
    return { allowed: true, used: 0, limit: limit, remaining: limit };
  }

  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

    const resp = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/usage_logs?user_id=eq.${userId}&feature=eq.${feature}&created_at=gte.${monthStart}&created_at=lt.${monthEnd}&select=id`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_KEY,
        },
      }
    );

    if (!resp.ok) {
      // Table might not exist yet — allow request through
      console.warn('Usage check failed (table may not exist):', resp.status);
      return { allowed: true, used: 0, limit: limit, remaining: limit };
    }

    const logs = await resp.json();
    const used = Array.isArray(logs) ? logs.length : 0;

    return {
      allowed: used < limit,
      used,
      limit,
      remaining: Math.max(0, limit - used),
    };
  } catch (err) {
    console.warn('Usage check error (non-fatal):', err.message);
    return { allowed: true, used: 0, limit: limit, remaining: limit };
  }
}

async function trackUsage(userId, feature) {
  if (!userId || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return;

  try {
    await fetch(`${process.env.SUPABASE_URL}/rest/v1/usage_logs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ user_id: userId, feature }),
    });
  } catch (err) {
    console.warn('Usage tracking error (non-fatal):', err.message);
  }
}

module.exports = { checkUsage, trackUsage, PLAN_LIMITS };

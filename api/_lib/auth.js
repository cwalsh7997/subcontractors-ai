/**
 * Shared Auth Middleware for Subcontractors.ai
 *
 * Verifies JWT tokens against Supabase and returns user, plan, and subscription status.
 * Gracefully handles missing columns/tables — defaults to 'free' plan.
 */

async function verifyAuth(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null; // No auth = anonymous (treated as free)
  }

  const token = authHeader.substring(7);

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.warn('Auth: Supabase not configured — defaulting to free');
    return null;
  }

  try {
    // Step 1: Verify JWT with Supabase auth endpoint
    const authResponse = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': process.env.SUPABASE_SERVICE_KEY,
      },
    });

    if (!authResponse.ok) {
      return null; // Invalid token = treat as anonymous/free
    }

    const authData = await authResponse.json();
    const userId = authData.id;
    const userEmail = authData.email;

    // Step 2: Query profiles table for subscription info (graceful if columns missing)
    let plan = 'free';
    let status = 'free';

    try {
      const profileResponse = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=subscription_plan,subscription_status`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
            'apikey': process.env.SUPABASE_SERVICE_KEY,
            'Content-Type': 'application/json',
          },
        }
      );

      if (profileResponse.ok) {
        const profiles = await profileResponse.json();
        const profile = profiles?.[0];
        if (profile) {
          plan = profile.subscription_plan || 'free';
          status = profile.subscription_status || 'free';
        }
      }
    } catch (profileErr) {
      console.warn('Auth: Could not fetch profile, defaulting to free:', profileErr.message);
    }

    return {
      user: { id: userId, email: userEmail },
      plan,
      status,
    };
  } catch (err) {
    console.error('Auth verification error:', err);
    return null;
  }
}

module.exports = { verifyAuth };

/**
 * Vercel Serverless Function: AI Bid Assistant
 *
 * POST /api/bid-assistant
 * Body: { project, location, trade, buildingType, sqft, gc, notes, dueDate }
 * Headers: Authorization: Bearer <supabase_jwt> (optional — anonymous gets free tier limits)
 *
 * Features:
 * - Auth-aware: logged-in users get plan-appropriate responses
 * - Usage tracking: enforces monthly limits per plan
 * - Free tier: basic analysis (3/month)
 * - Pro+: full detailed analysis with cost breakdowns
 */

const { verifyAuth } = require('./_lib/auth');
const { checkUsage, trackUsage } = require('./_lib/usage');

const ALLOWED_ORIGINS = [
  'https://www.subcontractors.ai',
  'https://subcontractors.ai',
  'http://localhost:3000',
  'http://localhost:5500',
];

function getCorsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

module.exports = async (req, res) => {
  const origin = req.headers.origin || '';
  const cors = getCorsHeaders(origin);
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'AI service not configured.' });
  }

  // Step 1: Check auth (graceful — null means anonymous/free)
  const auth = await verifyAuth(req);
  const userId = auth?.user?.id || null;
  const userEmail = auth?.user?.email || 'anonymous';
  const plan = auth?.plan || 'free';

  // Step 2: Check usage limits (graceful — allows through if table doesn't exist)
  const usage = await checkUsage(userId, 'bid-assistant', plan);

  if (!usage.allowed) {
    return res.status(403).json({
      error: 'Monthly usage limit reached',
      usage,
      upgrade: plan === 'free'
        ? 'Upgrade to Pro for 50 analyses/month → /pricing.html'
        : plan === 'pro'
          ? 'Upgrade to Business for 200 analyses/month → /pricing.html'
          : null,
    });
  }

  try {
    const { project, location, trade, buildingType, sqft, gc, notes, dueDate } = req.body;

    if (!project || !trade || !buildingType) {
      return res.status(400).json({ error: 'project, trade, and buildingType are required.' });
    }

    const sf = parseInt(sqft) || 25000;
    const isPaid = ['pro', 'business', 'enterprise'].includes(plan);

    // Adjust detail level based on plan
    const maxTokens = isPaid ? 2000 : 800;

    const systemPrompt = isPaid
      ? `You are an expert construction estimator and bid analyst specializing in commercial construction subcontracting. You provide detailed, accurate scope analysis, cost estimates, risk assessments, and project timelines.

IMPORTANT RULES:
- Be specific and quantitative. Use real industry numbers.
- Base cost estimates on current 2025-2026 market rates for the given location.
- Include material AND labor in cost estimates.
- Flag real risks — prevailing wage, code requirements, logistics, etc.
- Format your response as valid JSON only. No markdown, no code fences.

RESPONSE FORMAT (strict JSON):
{
  "scopeItems": ["string array of 6-8 specific scope items with quantities"],
  "costEstimate": {
    "low": number (total dollars),
    "mid": number (total dollars),
    "high": number (total dollars),
    "breakdown": [
      { "item": "string", "amount": number }
    ]
  },
  "risks": [
    { "level": "high|medium|low", "text": "description" }
  ],
  "timeline": [
    { "phase": "string", "duration": "string", "description": "string" }
  ],
  "recommendations": "string with 2-3 sentences of strategic advice for the sub"
}`
      : `You are a construction bid analyst. Provide a brief scope overview and high-level cost range. Keep it concise.

RESPONSE FORMAT (strict JSON):
{
  "scopeItems": ["3-4 key scope items"],
  "costEstimate": {
    "low": number,
    "mid": number,
    "high": number
  },
  "risks": [
    { "level": "high|medium", "text": "top 2 risks only" }
  ],
  "recommendations": "1 sentence of advice",
  "upgradeNote": "Upgrade to Pro for detailed cost breakdowns, timeline, and 50 analyses/month"
}`;

    const userPrompt = `Analyze this bid opportunity for a ${trade} subcontractor:

PROJECT: ${project}
LOCATION: ${location || 'Not specified'}
BUILDING TYPE: ${buildingType}
SQUARE FOOTAGE: ${sf.toLocaleString()} SF
GENERAL CONTRACTOR: ${gc || 'Not specified'}
BID DUE DATE: ${dueDate || 'Not specified'}
SCOPE NOTES: ${notes || 'None provided'}

Provide a ${isPaid ? 'comprehensive' : 'brief'} bid analysis. All costs should be realistic for ${location || 'a typical US market'} in 2026. The subcontractor's trade is ${trade}.`;

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('OpenAI error:', response.status, errData);
      return res.status(502).json({ error: 'AI service returned an error. Please try again.' });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(502).json({ error: 'No response from AI service.' });
    }

    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch (parseErr) {
      console.error('Failed to parse AI response:', content);
      return res.status(502).json({ error: 'AI returned invalid format. Please try again.' });
    }

    // Track usage (non-fatal)
    await trackUsage(userId, 'bid-assistant');

    console.log(`Bid analysis: user=${userEmail} plan=${plan} tokens=${data.usage?.total_tokens}`);

    return res.status(200).json({
      success: true,
      analysis,
      plan,
      usage: {
        used: usage.used + 1,
        limit: usage.limit,
        remaining: Math.max(0, usage.remaining - 1),
      },
      model: 'gpt-4o-mini',
      tokens: data.usage?.total_tokens || 0,
    });

  } catch (err) {
    console.error('Bid Assistant Error:', err);
    return res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
};

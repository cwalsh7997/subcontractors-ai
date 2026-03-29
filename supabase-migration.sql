/**
 * Supabase Migration for Subcontractors.ai
 *
 * Adds subscription and usage tracking tables
 *
 * Run in Supabase SQL Editor
 */

-- Step 1: Add subscription columns to profiles table if they don't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'free';

-- Step 2: Create usage_logs table
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  feature text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Step 3: Create index on usage_logs for efficient querying
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id_feature_created_at
ON public.usage_logs(user_id, feature, created_at DESC);

-- Step 4: Enable RLS on usage_logs
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Step 5: RLS Policy: Users can read their own usage_logs
CREATE POLICY IF NOT EXISTS "Users can read their own usage logs"
ON public.usage_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Step 6: RLS Policy: Service role can insert into usage_logs
CREATE POLICY IF NOT EXISTS "Service role can insert usage logs"
ON public.usage_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- Step 7: RLS Policy: Service role can select all usage_logs (for aggregation)
CREATE POLICY IF NOT EXISTS "Service role can read all usage logs"
ON public.usage_logs
FOR SELECT
TO service_role
USING (true);

-- Step 8: Create comment on usage_logs table
COMMENT ON TABLE public.usage_logs IS 'Tracks API usage per user per feature per month for billing and rate limiting';
COMMENT ON COLUMN public.usage_logs.user_id IS 'Reference to the user who made the API call';
COMMENT ON COLUMN public.usage_logs.feature IS 'Name of the feature/API endpoint used (e.g., bid-assistant)';
COMMENT ON COLUMN public.usage_logs.created_at IS 'Timestamp when the feature was used';

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

-- Step 9: Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  trade text,
  gc_name text,
  gc_contact text,
  contract_value numeric,
  retainage_pct numeric DEFAULT 10,
  location text,
  description text,
  status text DEFAULT 'active',
  start_date date,
  end_date date,
  project_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Step 10: Create index on projects for efficient user_id querying
CREATE INDEX IF NOT EXISTS idx_projects_user_id_updated_at
ON public.projects(user_id, updated_at DESC);

-- Step 11: Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Step 12: RLS Policy: Users can read their own projects
CREATE POLICY IF NOT EXISTS "Users can read their own projects"
ON public.projects
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Step 13: RLS Policy: Users can create projects
CREATE POLICY IF NOT EXISTS "Users can create projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Step 14: RLS Policy: Users can update their own projects
CREATE POLICY IF NOT EXISTS "Users can update their own projects"
ON public.projects
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 15: RLS Policy: Users can delete their own projects
CREATE POLICY IF NOT EXISTS "Users can delete their own projects"
ON public.projects
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Step 16: RLS Policy: Service role can access all projects
CREATE POLICY IF NOT EXISTS "Service role can access all projects"
ON public.projects
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Step 17: Create bid_analyses table
CREATE TABLE IF NOT EXISTS public.bid_analyses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  project_name text,
  trade text,
  location text,
  building_type text,
  sqft integer,
  gc_name text,
  analysis_data jsonb,
  model_used text,
  tokens_used integer,
  created_at timestamptz DEFAULT now()
);

-- Step 18: Create index on bid_analyses for efficient user_id querying
CREATE INDEX IF NOT EXISTS idx_bid_analyses_user_id_created_at
ON public.bid_analyses(user_id, created_at DESC);

-- Step 19: Create index on bid_analyses for project filtering
CREATE INDEX IF NOT EXISTS idx_bid_analyses_project_id
ON public.bid_analyses(project_id);

-- Step 20: Enable RLS on bid_analyses
ALTER TABLE public.bid_analyses ENABLE ROW LEVEL SECURITY;

-- Step 21: RLS Policy: Users can read their own bid analyses
CREATE POLICY IF NOT EXISTS "Users can read their own bid analyses"
ON public.bid_analyses
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Step 22: RLS Policy: Users can create bid analyses
CREATE POLICY IF NOT EXISTS "Users can create bid analyses"
ON public.bid_analyses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Step 23: RLS Policy: Users can delete their own bid analyses
CREATE POLICY IF NOT EXISTS "Users can delete their own bid analyses"
ON public.bid_analyses
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Step 24: RLS Policy: Service role can access all bid analyses
CREATE POLICY IF NOT EXISTS "Service role can access all bid analyses"
ON public.bid_analyses
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Step 25: Create comments on projects table
COMMENT ON TABLE public.projects IS 'User projects for bid analysis tracking';
COMMENT ON COLUMN public.projects.user_id IS 'Reference to the user who owns the project';
COMMENT ON COLUMN public.projects.name IS 'Project name';
COMMENT ON COLUMN public.projects.trade IS 'Trade/specialty for the project';
COMMENT ON COLUMN public.projects.contract_value IS 'Total contract value';
COMMENT ON COLUMN public.projects.retainage_pct IS 'Retainage percentage (default 10%)';
COMMENT ON COLUMN public.projects.status IS 'Project status (active, completed, archived)';

-- Step 26: Create comments on bid_analyses table
COMMENT ON TABLE public.bid_analyses IS 'Saved bid analyses from AI analysis';
COMMENT ON COLUMN public.bid_analyses.user_id IS 'Reference to the user who created the analysis';
COMMENT ON COLUMN public.bid_analyses.project_id IS 'Optional reference to a project';
COMMENT ON COLUMN public.bid_analyses.analysis_data IS 'Full AI analysis response (JSON)';
COMMENT ON COLUMN public.bid_analyses.model_used IS 'AI model used for analysis';
COMMENT ON COLUMN public.bid_analyses.tokens_used IS 'Tokens consumed by the analysis';

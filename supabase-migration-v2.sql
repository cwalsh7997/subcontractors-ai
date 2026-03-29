-- =============================================
-- Subcontractors.ai — Migration V2
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Change Orders Table
CREATE TABLE IF NOT EXISTS change_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    number TEXT,
    project TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(12,2) DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft','submitted','pending','approved','rejected')),
    date_submitted DATE,
    requested_by TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Daily Logs Table
CREATE TABLE IF NOT EXISTS daily_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    project TEXT NOT NULL,
    weather TEXT,
    temperature TEXT,
    wind TEXT,
    work_performed TEXT,
    materials TEXT,
    equipment TEXT,
    delays TEXT,
    safety TEXT,
    visitors TEXT,
    total_hours DECIMAL(6,1) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Crew Entries (linked to daily logs)
CREATE TABLE IF NOT EXISTS crew_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    log_id UUID REFERENCES daily_logs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    hours DECIMAL(4,1) DEFAULT 0,
    notes TEXT
);

-- 4. Lien Waivers (track generated waivers)
CREATE TABLE IF NOT EXISTS lien_waivers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    waiver_type TEXT NOT NULL CHECK (waiver_type IN ('conditional_progress','unconditional_progress','conditional_final','unconditional_final')),
    project TEXT,
    owner_name TEXT,
    gc_name TEXT,
    claimant TEXT,
    amount DECIMAL(12,2),
    through_date DATE,
    exceptions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. GC Ratings Table
CREATE TABLE IF NOT EXISTS gc_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    gc_name TEXT NOT NULL,
    project TEXT,
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
    payment_speed INTEGER CHECK (payment_speed BETWEEN 1 AND 5),
    communication INTEGER CHECK (communication BETWEEN 1 AND 5),
    change_order_fairness INTEGER CHECK (change_order_fairness BETWEEN 1 AND 5),
    safety_culture INTEGER CHECK (safety_culture BETWEEN 1 AND 5),
    would_work_again BOOLEAN DEFAULT true,
    review_text TEXT,
    anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Projects Table (for project board / ITB postings)
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    posted_by UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    gc_name TEXT,
    location TEXT,
    project_type TEXT,
    estimated_value TEXT,
    sqft TEXT,
    bid_due DATE,
    prebid_date DATE,
    status TEXT DEFAULT 'bidding' CHECK (status IN ('prebid','bidding','closing','closed')),
    trades TEXT[], -- array of trade names
    description TEXT,
    plans_available BOOLEAN DEFAULT false,
    requirements JSONB DEFAULT '{}',
    source TEXT DEFAULT 'Subcontractors.ai',
    hot BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Project Interests (subs expressing interest in projects)
CREATE TABLE IF NOT EXISTS project_interests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    interest_type TEXT DEFAULT 'express' CHECK (interest_type IN ('express','request_plans','bid_submitted')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- =============================================
-- Row Level Security Policies
-- =============================================

ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE lien_waivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE gc_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_interests ENABLE ROW LEVEL SECURITY;

-- Change Orders: users see their own
CREATE POLICY "Users can manage own change orders" ON change_orders
    FOR ALL USING (auth.uid() = user_id);

-- Daily Logs: users see their own
CREATE POLICY "Users can manage own daily logs" ON daily_logs
    FOR ALL USING (auth.uid() = user_id);

-- Crew Entries: users see their own
CREATE POLICY "Users can manage own crew entries" ON crew_entries
    FOR ALL USING (auth.uid() = user_id);

-- Lien Waivers: users see their own
CREATE POLICY "Users can manage own lien waivers" ON lien_waivers
    FOR ALL USING (auth.uid() = user_id);

-- GC Ratings: anyone can read, users manage their own
CREATE POLICY "Anyone can read gc ratings" ON gc_ratings
    FOR SELECT USING (true);
CREATE POLICY "Users can manage own gc ratings" ON gc_ratings
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own gc ratings" ON gc_ratings
    FOR UPDATE USING (auth.uid() = user_id);

-- Projects: anyone can read, admins can manage
CREATE POLICY "Anyone can read projects" ON projects
    FOR SELECT USING (true);
CREATE POLICY "Authenticated users can post projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = posted_by);

-- Project Interests: users manage their own
CREATE POLICY "Users can manage own interests" ON project_interests
    FOR ALL USING (auth.uid() = user_id);

-- Admin policies (connor@acglass.com can see everything)
CREATE POLICY "Admin can view all change orders" ON change_orders
    FOR SELECT USING (auth.jwt() ->> 'email' = 'connor@acglass.com');
CREATE POLICY "Admin can view all daily logs" ON daily_logs
    FOR SELECT USING (auth.jwt() ->> 'email' = 'connor@acglass.com');
CREATE POLICY "Admin can view all lien waivers" ON lien_waivers
    FOR SELECT USING (auth.jwt() ->> 'email' = 'connor@acglass.com');
CREATE POLICY "Admin can manage all projects" ON projects
    FOR ALL USING (auth.jwt() ->> 'email' = 'connor@acglass.com');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_change_orders_user ON change_orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user ON daily_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_gc_ratings_gc ON gc_ratings(gc_name);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status, bid_due);
CREATE INDEX IF NOT EXISTS idx_projects_trades ON projects USING GIN(trades);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_change_orders_updated_at ON change_orders;
CREATE TRIGGER update_change_orders_updated_at BEFORE UPDATE ON change_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_daily_logs_updated_at ON daily_logs;
CREATE TRIGGER update_daily_logs_updated_at BEFORE UPDATE ON daily_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

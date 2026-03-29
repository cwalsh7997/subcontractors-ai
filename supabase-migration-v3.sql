-- Subcontractors.ai Migration V3: Estimates & Safety Tables
-- Run this in Supabase SQL Editor

-- ============================================================
-- ESTIMATES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_name TEXT,
    client_name TEXT,
    project_address TEXT,
    estimate_date DATE DEFAULT CURRENT_DATE,
    line_items JSONB DEFAULT '[]'::jsonb,
    overhead_pct NUMERIC DEFAULT 0,
    profit_pct NUMERIC DEFAULT 0,
    tax_pct NUMERIC DEFAULT 0,
    contingency_pct NUMERIC DEFAULT 0,
    subtotal NUMERIC DEFAULT 0,
    total_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'draft',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own estimates" ON estimates
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all estimates" ON estimates
    FOR SELECT USING (
        auth.jwt() ->> 'email' IN ('connor@acglass.com')
    );

CREATE INDEX idx_estimates_user_id ON estimates(user_id);
CREATE INDEX idx_estimates_status ON estimates(status);

-- ============================================================
-- SAFETY INCIDENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS safety_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('near-miss', 'incident', 'observation', 'violation')),
    incident_date DATE DEFAULT CURRENT_DATE,
    project TEXT,
    location TEXT,
    description TEXT,
    corrective_action TEXT,
    severity TEXT DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE safety_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own safety incidents" ON safety_incidents
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all safety incidents" ON safety_incidents
    FOR SELECT USING (
        auth.jwt() ->> 'email' IN ('connor@acglass.com')
    );

CREATE INDEX idx_safety_incidents_user_id ON safety_incidents(user_id);
CREATE INDEX idx_safety_incidents_type ON safety_incidents(type);

-- ============================================================
-- COMPLETED TOOLBOX TALKS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS completed_talks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    talk_id TEXT NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE completed_talks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own completed talks" ON completed_talks
    FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_completed_talks_user_id ON completed_talks(user_id);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
CREATE TRIGGER update_estimates_updated_at
    BEFORE UPDATE ON estimates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_safety_incidents_updated_at
    BEFORE UPDATE ON safety_incidents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

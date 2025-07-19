-- Drop existing tables if they exist (to ensure clean state)
DROP TABLE IF EXISTS divisions;
DROP TABLE IF EXISTS conferences;

-- Recreate conferences table
CREATE TABLE conferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(name, league_id)
);

-- Create divisions table
CREATE TABLE divisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    conference_id UUID NOT NULL REFERENCES conferences(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(name, conference_id)
);

-- Add division_id to teams table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'teams' 
        AND column_name = 'division_id'
    ) THEN
        ALTER TABLE teams ADD COLUMN division_id UUID REFERENCES divisions(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE conferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read for authenticated users" ON conferences;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON conferences;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON conferences;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON conferences;

DROP POLICY IF EXISTS "Enable read for authenticated users" ON divisions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON divisions;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON divisions;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON divisions;

-- Create policies for conferences
CREATE POLICY "Enable read for authenticated users" ON conferences
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON conferences
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON conferences
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete for authenticated users" ON conferences
    FOR DELETE TO authenticated USING (true);

-- Create policies for divisions
CREATE POLICY "Enable read for authenticated users" ON divisions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON divisions
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON divisions
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete for authenticated users" ON divisions
    FOR DELETE TO authenticated USING (true);

-- Grant permissions to authenticated users
GRANT ALL ON conferences TO authenticated;
GRANT ALL ON divisions TO authenticated;
GRANT USAGE ON SEQUENCE conferences_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE divisions_id_seq TO authenticated;

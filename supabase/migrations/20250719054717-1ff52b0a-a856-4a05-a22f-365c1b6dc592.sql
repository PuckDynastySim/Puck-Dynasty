
-- First, let's ensure the conferences and divisions tables exist with the correct structure
-- Drop and recreate to ensure clean state
DROP TABLE IF EXISTS divisions CASCADE;
DROP TABLE IF EXISTS conferences CASCADE;

-- Create conferences table
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

-- Create function to update timestamp if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_conferences_updated_at ON conferences;
CREATE TRIGGER update_conferences_updated_at
    BEFORE UPDATE ON conferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_divisions_updated_at ON divisions;
CREATE TRIGGER update_divisions_updated_at
    BEFORE UPDATE ON divisions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

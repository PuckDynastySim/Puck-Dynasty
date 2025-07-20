-- Create UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.conferences CASCADE;

-- Create conferences table
CREATE TABLE public.conferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT conferences_name_league_unique UNIQUE(name, league_id)
);

-- Add indexes
CREATE INDEX idx_conferences_league_id ON public.conferences(league_id);

-- Enable Row Level Security
ALTER TABLE public.conferences ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.conferences;
CREATE POLICY "Enable read access for all users" ON public.conferences
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.conferences;
CREATE POLICY "Enable insert for authenticated users" ON public.conferences
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.conferences;
CREATE POLICY "Enable update for authenticated users" ON public.conferences
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.conferences;
CREATE POLICY "Enable delete for authenticated users" ON public.conferences
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_conferences_updated_at ON public.conferences;
CREATE TRIGGER update_conferences_updated_at
    BEFORE UPDATE ON public.conferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables with proper order to handle foreign key constraints
CREATE TABLE IF NOT EXISTS public.conferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_conference_name_per_league UNIQUE(name, league_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conferences_league_id ON public.conferences(league_id);

-- Create divisions table
CREATE TABLE IF NOT EXISTS public.divisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    conference_id UUID NOT NULL REFERENCES public.conferences(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_division_name_per_conference UNIQUE(name, conference_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_divisions_conference_id ON public.divisions(conference_id);

-- Add foreign key to teams table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'teams' 
        AND column_name = 'division_id'
    ) THEN
        ALTER TABLE public.teams
        ADD COLUMN division_id UUID REFERENCES public.divisions(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.conferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;

-- Create policies for conferences
CREATE POLICY "Enable read access for all authenticated users"
    ON public.conferences FOR SELECT
    USING (auth.role() IN ('authenticated', 'service_role'));

CREATE POLICY "Enable insert for authenticated users"
    ON public.conferences FOR INSERT
    WITH CHECK (auth.role() IN ('authenticated', 'service_role'));

CREATE POLICY "Enable update for authenticated users"
    ON public.conferences FOR UPDATE
    USING (auth.role() IN ('authenticated', 'service_role'));

CREATE POLICY "Enable delete for authenticated users"
    ON public.conferences FOR DELETE
    USING (auth.role() IN ('authenticated', 'service_role'));

-- Create policies for divisions
CREATE POLICY "Enable read access for all authenticated users"
    ON public.divisions FOR SELECT
    USING (auth.role() IN ('authenticated', 'service_role'));

CREATE POLICY "Enable insert for authenticated users"
    ON public.divisions FOR INSERT
    WITH CHECK (auth.role() IN ('authenticated', 'service_role'));

CREATE POLICY "Enable update for authenticated users"
    ON public.divisions FOR UPDATE
    USING (auth.role() IN ('authenticated', 'service_role'));

CREATE POLICY "Enable delete for authenticated users"
    ON public.divisions FOR DELETE
    USING (auth.role() IN ('authenticated', 'service_role'));

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS set_conferences_updated_at ON public.conferences;
CREATE TRIGGER set_conferences_updated_at
    BEFORE UPDATE ON public.conferences
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_divisions_updated_at ON public.divisions;
CREATE TRIGGER set_divisions_updated_at
    BEFORE UPDATE ON public.divisions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

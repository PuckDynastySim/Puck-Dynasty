-- Extend teams table for tiered league system
ALTER TABLE public.teams 
ADD COLUMN parent_team_id UUID REFERENCES public.teams(id),
ADD COLUMN is_ai_controlled BOOLEAN NOT NULL DEFAULT false;

-- Create index for parent team relationships
CREATE INDEX idx_teams_parent_team_id ON public.teams(parent_team_id);

-- Add comment to explain the relationship
COMMENT ON COLUMN public.teams.parent_team_id IS 'Links farm teams to their parent pro team';
COMMENT ON COLUMN public.teams.is_ai_controlled IS 'Marks teams as AI-controlled (typically junior teams)';

-- Create function to validate player league age requirements
CREATE OR REPLACE FUNCTION public.validate_player_league_age(
    _player_age INTEGER,
    _league_type league_type
) RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    CASE _league_type
        WHEN 'pro' THEN
            RETURN _player_age >= 18;
        WHEN 'farm' THEN
            RETURN _player_age >= 16;
        WHEN 'junior' THEN
            RETURN _player_age >= 16 AND _player_age <= 21;
        ELSE
            RETURN false;
    END CASE;
END;
$$;

-- Create function to check draft eligibility
CREATE OR REPLACE FUNCTION public.is_draft_eligible(
    _player_age INTEGER
) RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN _player_age >= 18;
END;
$$;

-- Create function to get organization teams (pro team + its farm team)
CREATE OR REPLACE FUNCTION public.get_organization_teams(
    _team_id UUID
) RETURNS TABLE (
    team_id UUID,
    team_name TEXT,
    league_type league_type,
    is_parent BOOLEAN
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    WITH organization AS (
        SELECT 
            t.id,
            t.name,
            l.league_type,
            CASE WHEN t.parent_team_id IS NULL THEN t.id ELSE t.parent_team_id END as parent_id
        FROM public.teams t
        JOIN public.leagues l ON t.league_id = l.id
        WHERE t.id = _team_id OR t.parent_team_id = _team_id
    )
    SELECT 
        o.id as team_id,
        o.name as team_name,
        o.league_type,
        (o.parent_id = o.id) as is_parent
    FROM organization o;
END;
$$;
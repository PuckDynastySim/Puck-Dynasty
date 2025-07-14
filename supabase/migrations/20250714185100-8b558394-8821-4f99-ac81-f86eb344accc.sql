-- Extend teams table for tiered league system
ALTER TABLE public.teams 
ADD COLUMN parent_team_id UUID REFERENCES public.teams(id),
ADD COLUMN is_ai_controlled BOOLEAN NOT NULL DEFAULT false;

-- Create index for parent team relationships
CREATE INDEX idx_teams_parent_team_id ON public.teams(parent_team_id);

-- Add comment to explain the relationship
COMMENT ON COLUMN public.teams.parent_team_id IS 'Links farm teams to their parent pro team';
COMMENT ON COLUMN public.teams.is_ai_controlled IS 'Marks teams as AI-controlled (typically junior teams)';

-- Create function to validate league age requirements
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

-- Add constraint to ensure junior teams are AI-controlled
ALTER TABLE public.teams 
ADD CONSTRAINT check_junior_teams_ai_controlled 
CHECK (
    (league_id IN (SELECT id FROM public.leagues WHERE league_type = 'junior') AND is_ai_controlled = true) OR
    (league_id NOT IN (SELECT id FROM public.leagues WHERE league_type = 'junior'))
);

-- Prevent human GM assignment to AI-controlled teams
ALTER TABLE public.teams 
ADD CONSTRAINT check_ai_teams_no_human_gm 
CHECK (
    (is_ai_controlled = true AND gm_user_id IS NULL) OR
    (is_ai_controlled = false)
);
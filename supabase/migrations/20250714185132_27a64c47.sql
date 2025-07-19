-- This section is already covered in the previous migration
-- Proceeding with new functions

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

-- Create function to check draft eligibility based on age
CREATE OR REPLACE FUNCTION public.check_draft_eligibility()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.age < 18 THEN
        RAISE EXCEPTION 'Player must be 18 or older to be draft eligible';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for draft eligibility check
CREATE TRIGGER check_player_draft_eligibility
    BEFORE INSERT OR UPDATE ON public.players
    FOR EACH ROW
    EXECUTE FUNCTION public.check_draft_eligibility();
-- Create career statistics table for players
CREATE TABLE public.player_career_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    season_year INTEGER NOT NULL,
    team_id UUID REFERENCES public.teams(id),
    league_id UUID NOT NULL REFERENCES public.leagues(id),
    games_played INTEGER DEFAULT 0,
    
    -- Skater stats
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    points INTEGER GENERATED ALWAYS AS (goals + assists) STORED,
    plus_minus INTEGER DEFAULT 0,
    penalty_minutes INTEGER DEFAULT 0,
    shots INTEGER DEFAULT 0,
    shooting_percentage DECIMAL GENERATED ALWAYS AS (
        CASE 
            WHEN shots > 0 THEN (goals::DECIMAL / shots::DECIMAL) * 100
            ELSE 0
        END
    ) STORED,
    hits INTEGER DEFAULT 0,
    blocks INTEGER DEFAULT 0,
    takeaways INTEGER DEFAULT 0,
    giveaways INTEGER DEFAULT 0,
    faceoffs_taken INTEGER DEFAULT 0,
    faceoffs_won INTEGER DEFAULT 0,
    faceoff_percentage DECIMAL GENERATED ALWAYS AS (
        CASE 
            WHEN faceoffs_taken > 0 THEN (faceoffs_won::DECIMAL / faceoffs_taken::DECIMAL) * 100
            ELSE 0
        END
    ) STORED,
    time_on_ice_seconds INTEGER DEFAULT 0,
    powerplay_goals INTEGER DEFAULT 0,
    powerplay_assists INTEGER DEFAULT 0,
    powerplay_points INTEGER GENERATED ALWAYS AS (powerplay_goals + powerplay_assists) STORED,
    shorthanded_goals INTEGER DEFAULT 0,
    shorthanded_assists INTEGER DEFAULT 0,
    shorthanded_points INTEGER GENERATED ALWAYS AS (shorthanded_goals + shorthanded_assists) STORED,
    game_winning_goals INTEGER DEFAULT 0,
    overtime_goals INTEGER DEFAULT 0,
    
    -- Goalie stats
    games_started INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    overtime_losses INTEGER DEFAULT 0,
    shutouts INTEGER DEFAULT 0,
    goals_against INTEGER DEFAULT 0,
    shots_against INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    save_percentage DECIMAL GENERATED ALWAYS AS (
        CASE 
            WHEN shots_against > 0 THEN (saves::DECIMAL / shots_against::DECIMAL) * 100
            ELSE 0
        END
    ) STORED,
    goals_against_average DECIMAL GENERATED ALWAYS AS (
        CASE 
            WHEN time_on_ice_seconds > 0 THEN (goals_against::DECIMAL / (time_on_ice_seconds::DECIMAL / 3600)) * 60
            ELSE 0
        END
    ) STORED,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Ensure unique player/season combination
    UNIQUE(player_id, season_year)
);

-- Create a view for career totals
CREATE OR REPLACE VIEW public.player_career_totals AS
SELECT 
    player_id,
    COUNT(DISTINCT season_year) as seasons_played,
    SUM(games_played) as total_games_played,
    
    -- Skater totals
    SUM(goals) as total_goals,
    SUM(assists) as total_assists,
    SUM(goals + assists) as total_points,
    SUM(penalty_minutes) as total_penalty_minutes,
    SUM(shots) as total_shots,
    CASE 
        WHEN SUM(shots) > 0 THEN (SUM(goals)::DECIMAL / SUM(shots)::DECIMAL) * 100
        ELSE 0
    END as career_shooting_percentage,
    SUM(hits) as total_hits,
    SUM(blocks) as total_blocks,
    SUM(takeaways) as total_takeaways,
    SUM(giveaways) as total_giveaways,
    SUM(faceoffs_won) as total_faceoffs_won,
    SUM(faceoffs_taken) as total_faceoffs_taken,
    CASE 
        WHEN SUM(faceoffs_taken) > 0 THEN (SUM(faceoffs_won)::DECIMAL / SUM(faceoffs_taken)::DECIMAL) * 100
        ELSE 0
    END as career_faceoff_percentage,
    SUM(powerplay_goals) as total_powerplay_goals,
    SUM(powerplay_assists) as total_powerplay_assists,
    SUM(shorthanded_goals) as total_shorthanded_goals,
    SUM(shorthanded_assists) as total_shorthanded_assists,
    SUM(game_winning_goals) as total_game_winning_goals,
    SUM(overtime_goals) as total_overtime_goals,
    
    -- Goalie totals
    SUM(games_started) as total_games_started,
    SUM(wins) as total_wins,
    SUM(losses) as total_losses,
    SUM(overtime_losses) as total_overtime_losses,
    SUM(shutouts) as total_shutouts,
    SUM(goals_against) as total_goals_against,
    SUM(shots_against) as total_shots_against,
    SUM(saves) as total_saves,
    CASE 
        WHEN SUM(shots_against) > 0 THEN (SUM(saves)::DECIMAL / SUM(shots_against)::DECIMAL) * 100
        ELSE 0
    END as career_save_percentage,
    CASE 
        WHEN SUM(time_on_ice_seconds) > 0 THEN (SUM(goals_against)::DECIMAL / (SUM(time_on_ice_seconds)::DECIMAL / 3600)) * 60
        ELSE 0
    END as career_goals_against_average
FROM public.player_career_stats
GROUP BY player_id;

-- Function to get a player's career statistics
CREATE OR REPLACE FUNCTION public.get_player_career_stats(_player_id UUID)
RETURNS TABLE (
    season_year INTEGER,
    team_name TEXT,
    league_type public.league_type,
    games_played INTEGER,
    goals INTEGER,
    assists INTEGER,
    points INTEGER,
    plus_minus INTEGER,
    penalty_minutes INTEGER,
    shots INTEGER,
    shooting_percentage DECIMAL,
    powerplay_points INTEGER,
    shorthanded_points INTEGER,
    game_winning_goals INTEGER,
    games_started INTEGER,
    wins INTEGER,
    losses INTEGER,
    overtime_losses INTEGER,
    shutouts INTEGER,
    save_percentage DECIMAL,
    goals_against_average DECIMAL
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pcs.season_year,
        t.name as team_name,
        l.league_type,
        pcs.games_played,
        pcs.goals,
        pcs.assists,
        pcs.points,
        pcs.plus_minus,
        pcs.penalty_minutes,
        pcs.shots,
        pcs.shooting_percentage,
        pcs.powerplay_points,
        pcs.shorthanded_points,
        pcs.game_winning_goals,
        pcs.games_started,
        pcs.wins,
        pcs.losses,
        pcs.overtime_losses,
        pcs.shutouts,
        pcs.save_percentage,
        pcs.goals_against_average
    FROM public.player_career_stats pcs
    LEFT JOIN public.teams t ON pcs.team_id = t.id
    LEFT JOIN public.leagues l ON pcs.league_id = l.id
    WHERE pcs.player_id = _player_id
    ORDER BY pcs.season_year DESC;
END;
$$;
